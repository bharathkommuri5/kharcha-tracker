"""Teams: creation (super-admin), membership, and the combined team expense view."""
from datetime import date

from fastapi import APIRouter, HTTPException, Query, UploadFile, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.daterange import resolve_range
from app.deps import CurrentUser, SessionDep, SuperAdmin
from app.models import Team, TeamMembership, TeamRole, User
from app.presenters import image_token_map, is_superadmin, user_brief
from app.schemas import (
    AddMemberRequest,
    MemberTotal,
    TeamAnalyticsSummary,
    TeamCreate,
    TeamDetail,
    TeamMemberRead,
    TeamRead,
    TeamTransactionRead,
    TeamUpdate,
)
from app.services import analytics
from app.services import images as image_service
from app.services import teams as team_service

router = APIRouter(prefix="/teams", tags=["teams"])


def _avatar_url(session, image_id):
    if not image_id:
        return None
    tokens = image_token_map(session, [image_id])
    tok = tokens.get(image_id)
    return f"/images/{tok}" if tok else None


@router.get("", response_model=list[TeamRead])
def list_my_teams(current_user: CurrentUser, session: SessionDep) -> list[TeamRead]:
    memberships = team_service.memberships_for_user(session, current_user.id)
    out: list[TeamRead] = []
    for m in memberships:
        team = session.get(Team, m.team_id)
        if team is None:
            continue
        count = len(team_service.member_user_ids(session, team.id))
        out.append(
            TeamRead(
                id=team.id,
                name=team.name,
                avatar_url=_avatar_url(session, team.avatar_image_id),
                role=m.role,
                member_count=count,
            )
        )
    out.sort(key=lambda t: t.name.lower())
    return out


@router.post("", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(body: TeamCreate, admin: SuperAdmin, session: SessionDep) -> TeamRead:
    team = Team(name=body.name, created_by_user_id=admin.id)
    session.add(team)
    session.commit()
    session.refresh(team)
    session.add(TeamMembership(team_id=team.id, user_id=admin.id, role=TeamRole.admin))
    session.commit()
    return TeamRead(
        id=team.id, name=team.name, avatar_url=None, role=TeamRole.admin, member_count=1
    )


def _team_detail(session, team: Team, current_user: User) -> TeamDetail:
    memberships = list(
        session.exec(select(TeamMembership).where(TeamMembership.team_id == team.id)).all()
    )
    users = {
        u.id: u
        for u in session.exec(
            select(User).where(User.id.in_([m.user_id for m in memberships]))
        ).all()
    }
    tokens = image_token_map(session, [u.avatar_image_id for u in users.values()])
    members = [
        TeamMemberRead(user=user_brief(users[m.user_id], tokens), role=m.role)
        for m in memberships
        if m.user_id in users
    ]
    members.sort(key=lambda m: (m.role != TeamRole.admin, m.user.name.lower()))
    my = next((m.role for m in memberships if m.user_id == current_user.id), None)
    return TeamDetail(
        id=team.id,
        name=team.name,
        avatar_url=_avatar_url(session, team.avatar_image_id),
        my_role=my or TeamRole.admin,  # super-admin viewing a team they're not in
        members=members,
    )


@router.get("/{team_id}", response_model=TeamDetail)
def get_team(team_id: int, current_user: CurrentUser, session: SessionDep) -> TeamDetail:
    team, _ = team_service.require_member(session, team_id, current_user)
    return _team_detail(session, team, current_user)


@router.patch("/{team_id}", response_model=TeamDetail)
def update_team(
    team_id: int, body: TeamUpdate, current_user: CurrentUser, session: SessionDep
) -> TeamDetail:
    team = team_service.require_team_admin(session, team_id, current_user)
    team.name = body.name.strip()
    session.add(team)
    session.commit()
    session.refresh(team)
    return _team_detail(session, team, current_user)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, admin: SuperAdmin, session: SessionDep) -> None:
    team = team_service.get_team_or_404(session, team_id)
    for m in session.exec(select(TeamMembership).where(TeamMembership.team_id == team_id)).all():
        session.delete(m)
    old_avatar = team.avatar_image_id
    session.delete(team)
    session.commit()
    image_service.delete_image(session, old_avatar)


@router.post("/{team_id}/avatar", response_model=TeamDetail)
async def set_team_avatar(
    team_id: int, current_user: CurrentUser, session: SessionDep, file: UploadFile
) -> TeamDetail:
    team = team_service.require_team_admin(session, team_id, current_user)
    old_id = team.avatar_image_id
    image = await image_service.store_avatar(session, file)
    team.avatar_image_id = image.id
    session.add(team)
    session.commit()
    session.refresh(team)
    image_service.delete_image(session, old_id)
    return _team_detail(session, team, current_user)


@router.delete("/{team_id}/avatar", response_model=TeamDetail)
def clear_team_avatar(team_id: int, current_user: CurrentUser, session: SessionDep) -> TeamDetail:
    team = team_service.require_team_admin(session, team_id, current_user)
    old_id = team.avatar_image_id
    team.avatar_image_id = None
    session.add(team)
    session.commit()
    session.refresh(team)
    image_service.delete_image(session, old_id)
    return _team_detail(session, team, current_user)


@router.post("/{team_id}/members", response_model=TeamDetail, status_code=status.HTTP_201_CREATED)
def add_member(
    team_id: int, body: AddMemberRequest, current_user: CurrentUser, session: SessionDep
) -> TeamDetail:
    team = team_service.require_team_admin(session, team_id, current_user)
    if session.get(User, body.user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    session.add(TeamMembership(team_id=team_id, user_id=body.user_id, role=body.role))
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already a member"
        ) from None
    return _team_detail(session, team, current_user)


@router.delete("/{team_id}/members/{user_id}", response_model=TeamDetail)
def remove_member(
    team_id: int, user_id: int, current_user: CurrentUser, session: SessionDep
) -> TeamDetail:
    team = team_service.require_team_admin(session, team_id, current_user)
    membership = team_service.get_membership(session, team_id, user_id)
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a member")
    admins = session.exec(
        select(TeamMembership).where(
            TeamMembership.team_id == team_id, TeamMembership.role == TeamRole.admin
        )
    ).all()
    if membership.role == TeamRole.admin and len(admins) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Can't remove the last admin"
        )
    session.delete(membership)
    session.commit()
    return _team_detail(session, team, current_user)


@router.get("/{team_id}/analytics/summary", response_model=TeamAnalyticsSummary)
def team_summary(
    team_id: int,
    current_user: CurrentUser,
    session: SessionDep,
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
) -> TeamAnalyticsSummary:
    team_service.require_member(session, team_id, current_user)
    start, end = resolve_range(start, end)
    ids = team_service.member_user_ids(session, team_id)
    summary, txns = analytics.summarize_users(session, ids, start, end)
    totals = analytics.member_totals(txns)
    users = {
        u.id: u for u in session.exec(select(User).where(User.id.in_(ids))).all()
    }
    tokens = image_token_map(session, [u.avatar_image_id for u in users.values()])
    by_member = [
        MemberTotal(
            user_id=uid,
            name=users[uid].name if uid in users else "Unknown",
            avatar_url=(
                f"/images/{tokens[users[uid].avatar_image_id]}"
                if uid in users and users[uid].avatar_image_id in tokens
                else None
            ),
            total=amt,
        )
        for uid, amt in sorted(totals.items(), key=lambda kv: kv[1], reverse=True)
    ]
    return TeamAnalyticsSummary(**summary.model_dump(), by_member=by_member)


@router.get("/{team_id}/transactions", response_model=list[TeamTransactionRead])
def team_transactions(
    team_id: int,
    current_user: CurrentUser,
    session: SessionDep,
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
) -> list[TeamTransactionRead]:
    team_service.require_member(session, team_id, current_user)
    start, end = resolve_range(start, end)
    ids = team_service.member_user_ids(session, team_id)
    _, txns = analytics.summarize_users(session, ids, start, end)
    users = {u.id: u for u in session.exec(select(User).where(User.id.in_(ids))).all()}
    tokens = image_token_map(session, [u.avatar_image_id for u in users.values()])
    out = []
    for t in txns:
        row = TeamTransactionRead(
            id=t.id,
            amount=t.amount,
            category=t.category,
            payment_mode=t.payment_mode,
            note=t.note,
            transaction_date=t.transaction_date,
            created_at=t.created_at,
            member=user_brief(users[t.user_id], tokens),
        )
        out.append(row)
    return out
