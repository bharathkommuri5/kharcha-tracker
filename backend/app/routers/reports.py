"""Emailed expense reports."""
from fastapi import APIRouter, HTTPException, status

from app.daterange import resolve_range
from app.deps import CurrentUser, SessionDep
from app.schemas import ReportEmailRequest, ReportEmailResponse
from app.services import email as email_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/email", response_model=ReportEmailResponse)
def email_report(
    body: ReportEmailRequest, current_user: CurrentUser, session: SessionDep
) -> ReportEmailResponse:
    start, end = resolve_range(body.start, body.end)
    try:
        return email_service.send_report(current_user, start, end, session)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send report: {exc}",
        ) from exc
