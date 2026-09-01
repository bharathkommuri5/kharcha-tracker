"""Aggregated spend for the dashboard."""
from datetime import date

from fastapi import APIRouter, Query

from app.daterange import resolve_range
from app.deps import CurrentUser, SessionDep
from app.schemas import AnalyticsSummary
from app.services import analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    current_user: CurrentUser,
    session: SessionDep,
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
) -> AnalyticsSummary:
    start, end = resolve_range(start, end)
    return analytics.summary_only(session, current_user.id, start, end)
