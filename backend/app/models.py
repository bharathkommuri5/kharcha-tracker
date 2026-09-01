from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum

from sqlalchemy import Column, DateTime, LargeBinary, Numeric, UniqueConstraint
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


class TeamRole(str, Enum):
    admin = "admin"
    member = "member"


class Image(SQLModel, table=True):
    __tablename__ = "image"

    id: int | None = Field(default=None, primary_key=True)
    token: str = Field(index=True, unique=True)
    data: bytes = Field(sa_column=Column(LargeBinary, nullable=False))
    content_type: str
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: int | None = Field(default=None, primary_key=True)
    google_id: str = Field(index=True, unique=True)
    email: str = Field(index=True)
    name: str
    username: str = Field(index=True, unique=True)
    avatar_image_id: int | None = Field(default=None, foreign_key="image.id")
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


class Team(SQLModel, table=True):
    __tablename__ = "team"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    avatar_image_id: int | None = Field(default=None, foreign_key="image.id")
    created_by_user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


class TeamMembership(SQLModel, table=True):
    __tablename__ = "team_membership"
    __table_args__ = (UniqueConstraint("team_id", "user_id", name="uq_team_user"),)

    id: int | None = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: TeamRole = Field(default=TeamRole.member)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
