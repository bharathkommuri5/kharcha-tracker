"""User directory — super-admin only, for picking team members."""
from fastapi import APIRouter, Query
from sqlmodel import or_, select

from app.deps import SessionDep, SuperAdmin
from app.models import User
from app.presenters import image_token_map, user_brief
from app.schemas import UserBrief

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserBrief])
def list_users(
    _: SuperAdmin,
    session: SessionDep,
    q: str | None = Query(default=None),
    limit: int = Query(default=50, le=100),
) -> list[UserBrief]:
    stmt = select(User)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(User.name.ilike(like), User.email.ilike(like), User.username.ilike(like)))
    stmt = stmt.order_by(User.name).limit(limit)
    users = list(session.exec(stmt).all())
    tokens = image_token_map(session, [u.avatar_image_id for u in users])
    return [user_brief(u, tokens) for u in users]
