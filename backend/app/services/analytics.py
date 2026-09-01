"""Spend aggregation for the dashboard charts and the email report.

Aggregation is done in Python (a month of personal expenses is tiny) so behaviour is
identical on SQLite and Postgres. `daily` is filled across the whole range, including
zero-spend days, so the frontend can render a continuous axis without gap-filling.
"""
from datetime import date, timedelta
from decimal import Decimal

from sqlmodel import Session, select

from app.config_options import category_label, payment_mode_label
from app.models import Transaction
from app.schemas import (
    AnalyticsSummary,
    DailyTotal,
    DateRange,
    NamedTotal,
    TransactionRead,
)

_Q = Decimal("0.01")


def _round(d: Decimal) -> Decimal:
    return d.quantize(_Q)


def fetch_transactions(
    session: Session, user_id: int, start: date, end: date
) -> list[Transaction]:
    stmt = (
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
        )
        .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
    )
    return list(session.exec(stmt).all())


def _named_totals(pairs: dict[str, Decimal], labeller) -> list[NamedTotal]:
    items = [
        NamedTotal(value=value, label=labeller(value), total=_round(total))
        for value, total in pairs.items()
        if total > 0
    ]
    items.sort(key=lambda x: x.total, reverse=True)
    return items


def summarize(
    session: Session, user_id: int, start: date, end: date
) -> tuple[AnalyticsSummary, list[Transaction]]:
    txns = fetch_transactions(session, user_id, start, end)

    total = Decimal("0")
    by_category: dict[str, Decimal] = {}
    by_payment: dict[str, Decimal] = {}
    by_day: dict[date, Decimal] = {}

    for t in txns:
        amt = Decimal(t.amount)
        total += amt
        by_category[t.category.value] = by_category.get(t.category.value, Decimal("0")) + amt
        by_payment[t.payment_mode.value] = (
            by_payment.get(t.payment_mode.value, Decimal("0")) + amt
        )
        by_day[t.transaction_date] = by_day.get(t.transaction_date, Decimal("0")) + amt

    category_totals = _named_totals(by_category, category_label)
    payment_totals = _named_totals(by_payment, payment_mode_label)

    daily: list[DailyTotal] = []
    cursor = start
    while cursor <= end:
        daily.append(DailyTotal(date=cursor, total=_round(by_day.get(cursor, Decimal("0")))))
        cursor += timedelta(days=1)

    summary = AnalyticsSummary(
        range=DateRange(start=start, end=end),
        total=_round(total),
        transaction_count=len(txns),
        top_category=category_totals[0] if category_totals else None,
        by_category=category_totals,
        by_payment_mode=payment_totals,
        daily=daily,
    )
    return summary, txns


def summary_only(session: Session, user_id: int, start: date, end: date) -> AnalyticsSummary:
    return summarize(session, user_id, start, end)[0]


def transactions_read(txns: list[Transaction]) -> list[TransactionRead]:
    return [TransactionRead.model_validate(t) for t in txns]
