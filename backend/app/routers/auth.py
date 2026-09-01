"""Authentication: Google sign-in, dev-login fallback, current-user profile."""
import re

from fastapi import APIRouter, HTTPException, UploadFile, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.config import settings
from app.deps import CurrentUser, SessionDep
from app.models import User
from app.presenters import user_read
from app.schemas import (
    DevLoginRequest,
    GoogleAuthRequest,
    TokenResponse,
    UserRead,
    UsernameUpdate,
)
from app.security import create_access_token
from app.services import images as image_service

router = APIRouter(prefix="/auth", tags=["auth"])

_slug_re = re.compile(r"[^a-z0-9_]+")


def _slugify(raw: str) -> str:
    slug = _slug_re.sub("_", raw.strip().lower()).strip("_")
    return slug or "user"


def _unique_username(session: Session, base: str) -> str:
    base = _slugify(base)[:32]
    candidate = base
    n = 1
    while session.exec(select(User).where(User.username == candidate)).first() is not None:
        n += 1
        candidate = f"{base}{n}"
    return candidate


def _get_or_create_user(session: Session, *, google_id: str, email: str, name: str) -> User:
    user = session.exec(select(User).where(User.google_id == google_id)).first()
    if user is None:
        user = User(
            google_id=google_id,
            email=email,
            name=name or email.split("@")[0],
            username=_unique_username(session, name or email.split("@")[0]),
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    elif user.email != email or (name and user.name != name):
        user.email = email
        if name:
            user.name = name
        session.add(user)
        session.commit()
        session.refresh(user)
    return user


def _issue(session: Session, user: User) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(user.id), user=user_read(session, user))


@router.post("/google", response_model=TokenResponse)
def google_login(body: GoogleAuthRequest, session: SessionDep) -> TokenResponse:
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google login is not configured on this server",
        )
    try:
        claims = google_id_token.verify_oauth2_token(
            body.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token"
        ) from None

    if not claims.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Google email not verified"
        )

    user = _get_or_create_user(
        session,
        google_id=claims["sub"],
        email=claims["email"],
        name=claims.get("name", ""),
    )
    return _issue(session, user)


@router.post("/dev-login", response_model=TokenResponse)
def dev_login(body: DevLoginRequest, session: SessionDep) -> TokenResponse:
    """Local-only shortcut so stories can be tested before real Google credentials exist."""
    if not settings.DEV_AUTH:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    user = _get_or_create_user(
        session,
        google_id=f"dev:{body.email.lower()}",
        email=body.email.lower(),
        name=body.name or body.email.split("@")[0],
    )
    return _issue(session, user)


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser, session: SessionDep) -> UserRead:
    return user_read(session, current_user)


@router.patch("/me", response_model=UserRead)
def update_me(body: UsernameUpdate, current_user: CurrentUser, session: SessionDep) -> UserRead:
    current_user.username = body.username
    session.add(current_user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username already taken"
        ) from None
    session.refresh(current_user)
    return user_read(session, current_user)


@router.post("/me/avatar", response_model=UserRead)
async def set_avatar(current_user: CurrentUser, session: SessionDep, file: UploadFile) -> UserRead:
    old_id = current_user.avatar_image_id
    image = await image_service.store_avatar(session, file)
    current_user.avatar_image_id = image.id
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    image_service.delete_image(session, old_id)
    return user_read(session, current_user)


@router.delete("/me/avatar", response_model=UserRead)
def clear_avatar(current_user: CurrentUser, session: SessionDep) -> UserRead:
    old_id = current_user.avatar_image_id
    current_user.avatar_image_id = None
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    image_service.delete_image(session, old_id)
    return user_read(session, current_user)
