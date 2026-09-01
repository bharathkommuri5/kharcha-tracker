"""Build API DTOs from ORM rows, resolving avatar image tokens."""
from sqlmodel import Session, select

from app.config import settings
from app.models import Image, User
from app.schemas import UserBrief, UserRead


def is_superadmin(user: User) -> bool:
    return user.email.lower() in settings.superadmin_email_set


def image_token_map(session: Session, image_ids: list[int | None]) -> dict[int, str]:
    ids = {i for i in image_ids if i}
    if not ids:
        return {}
    rows = session.exec(select(Image.id, Image.token).where(Image.id.in_(ids))).all()
    return {row[0]: row[1] for row in rows}


def _avatar_url(token: str | None) -> str | None:
    return f"/images/{token}" if token else None


def user_read(session: Session, user: User) -> UserRead:
    tokens = image_token_map(session, [user.avatar_image_id])
    return UserRead(
        id=user.id,
        email=user.email,
        name=user.name,
        username=user.username,
        avatar_url=_avatar_url(tokens.get(user.avatar_image_id)),
        is_superadmin=is_superadmin(user),
        created_at=user.created_at,
    )


def user_brief(user: User, tokens: dict[int, str]) -> UserBrief:
    return UserBrief(
        id=user.id,
        name=user.name,
        username=user.username,
        email=user.email,
        avatar_url=_avatar_url(tokens.get(user.avatar_image_id)),
    )
