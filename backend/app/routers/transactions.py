"""Transaction CRUD, scoped to the authenticated user."""
from datetime import date

from fastapi import APIRouter, HTTPException, Query, status
from sqlmodel import select

from app.daterange import resolve_range
from app.deps import CurrentUser, SessionDep
from app.models import Transaction
from app.schemas import TransactionCreate, TransactionRead, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _owned_or_404(session, tx_id: int, user_id: int) -> Transaction:
    tx = session.get(Transaction, tx_id)
    if tx is None or tx.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    current_user: CurrentUser,
    session: SessionDep,
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
) -> list[Transaction]:
    start, end = resolve_range(start, end)
    stmt = (
        select(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
        )
        .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
    )
    return list(session.exec(stmt).all())


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    body: TransactionCreate, current_user: CurrentUser, session: SessionDep
) -> Transaction:
    tx = Transaction(
        user_id=current_user.id,
        amount=body.amount,
        category=body.category,
        payment_mode=body.payment_mode,
        note=body.note,
        transaction_date=body.transaction_date or date.today(),
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@router.patch("/{tx_id}", response_model=TransactionRead)
def update_transaction(
    tx_id: int, body: TransactionUpdate, current_user: CurrentUser, session: SessionDep
) -> Transaction:
    tx = _owned_or_404(session, tx_id, current_user.id)
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(tx, field, value)
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(tx_id: int, current_user: CurrentUser, session: SessionDep) -> None:
    tx = _owned_or_404(session, tx_id, current_user.id)
    session.delete(tx)
    session.commit()
