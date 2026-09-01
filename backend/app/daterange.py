"""Resolve the (start, end) window used by transactions / analytics / reports."""
from calendar import monthrange
from datetime import date

from fastapi import HTTPException, status


def month_to_date(today: date | None = None) -> tuple[date, date]:
    today = today or date.today()
    return date(today.year, today.month, 1), today


def month_bounds(year: int, month: int) -> tuple[date, date]:
    last = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last)


def resolve_range(start: date | None, end: date | None) -> tuple[date, date]:
    """Default to month-to-date. Validate ordering. Inclusive on both ends."""
    if start is None and end is None:
        return month_to_date()
    if start is None or end is None:
        default_start, default_end = month_to_date()
        start = start or default_start
        end = end or default_end
    if start > end:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start date must be on or before end date",
        )
    return start, end
