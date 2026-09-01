from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum

from sqlalchemy import Column, DateTime, Numeric
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Category(str, Enum):
    food_beverages = "food_beverages"
    medical = "medical"
    travel = "travel"
    shopping = "shopping"
    bills = "bills"
    entertainment = "entertainment"
    others = "others"


class PaymentMode(str, Enum):
    phonepe = "phonepe"
    gpay = "gpay"
    supermoney = "supermoney"
    cred = "cred"
    credit_card = "credit_card"
    debit_card = "debit_card"
    cash = "cash"
    other = "other"


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: int | None = Field(default=None, primary_key=True)
    google_id: str = Field(index=True, unique=True)
    email: str = Field(index=True)
    name: str
    username: str = Field(index=True, unique=True)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


class Transaction(SQLModel, table=True):
    __tablename__ = "transaction"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    amount: Decimal = Field(sa_column=Column(Numeric(12, 2), nullable=False))
    category: Category = Field(index=True)
    payment_mode: PaymentMode = Field(index=True)
    note: str | None = Field(default=None)
    transaction_date: date = Field(default_factory=lambda: date.today(), index=True)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
