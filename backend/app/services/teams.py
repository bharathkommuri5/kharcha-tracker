"""Team membership queries + permission checks."""
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models import Team, TeamMembership, TeamRole, User
from app.presenters import is_superadmin


def get_membership(session: Session, team_id: int, user_id: int) -> TeamMembership | None:
    return session.exec(
        select(TeamMembership).where(
            TeamMembership.team_id == team_id, TeamMembership.user_id == user_id
        )
    ).first()


def get_team_or_404(session: Session, team_id: int) -> Team:
    team = session.get(Team, team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


def require_member(session: Session, team_id: int, user: User) -> tuple[Team, TeamMembership | None]:
    team = get_team_or_404(session, team_id)
    membership = get_membership(session, team_id, user.id)
    if membership is None and not is_superadmin(user):
        # hide existence from non-members
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team, membership


def require_team_admin(session: Session, team_id: int, user: User) -> Team:
    team = get_team_or_404(session, team_id)
    if is_superadmin(user):
        return team
    membership = get_membership(session, team_id, user.id)
    if membership is None or membership.role != TeamRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Team admin access required"
        )
    return team


def member_user_ids(session: Session, team_id: int) -> list[int]:
    return list(
        session.exec(
            select(TeamMembership.user_id).where(TeamMembership.team_id == team_id)
        ).all()
    )


def memberships_for_user(session: Session, user_id: int) -> list[TeamMembership]:
    return list(
        session.exec(
            select(TeamMembership).where(TeamMembership.user_id == user_id)
        ).all()
    )
