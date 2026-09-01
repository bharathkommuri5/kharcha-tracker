"""Request/response DTOs — kept separate from the ORM models."""
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import Category, PaymentMode, TeamRole

# ------------------------------------------------------------------ auth


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(min_length=10)


class DevLoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    name: str | None = Field(default=None, max_length=120)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    username: str
    avatar_url: str | None = None
    is_superadmin: bool = False
    created_at: datetime


class UserBrief(BaseModel):
    """Lightweight user card for member pickers / team rows."""

    id: int
    name: str
    username: str
    email: str
    avatar_url: str | None = None


class UsernameUpdate(BaseModel):
    username: str = Field(min_length=2, max_length=40)

    @field_validator("username")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("username cannot be blank")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


# ------------------------------------------------------------------ transactions


class TransactionCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category: Category
    payment_mode: PaymentMode
    note: str | None = Field(default=None, max_length=280)
    transaction_date: date | None = None


class TransactionUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    category: Category | None = None
    payment_mode: PaymentMode | None = None
    note: str | None = Field(default=None, max_length=280)
    transaction_date: date | None = None


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: Decimal
    category: Category
    payment_mode: PaymentMode
    note: str | None
    transaction_date: date
    created_at: datetime


# ------------------------------------------------------------------ analytics


class NamedTotal(BaseModel):
    value: str
    label: str
    total: Decimal


class DailyTotal(BaseModel):
    date: date
    total: Decimal


class DateRange(BaseModel):
    start: date
    end: date


class AnalyticsSummary(BaseModel):
    range: DateRange
    total: Decimal
    transaction_count: int
    top_category: NamedTotal | None
    by_category: list[NamedTotal]
    by_payment_mode: list[NamedTotal]
    daily: list[DailyTotal]


# ------------------------------------------------------------------ reports


class ReportEmailRequest(BaseModel):
    start: date | None = None
    end: date | None = None


class ReportEmailResponse(BaseModel):
    status: str
    to: str
    range: DateRange
    dev: bool = False
    detail: str | None = None


# ------------------------------------------------------------------ teams


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=60)

    @field_validator("name")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Team name cannot be blank")
        return v


class TeamUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=60)


class AddMemberRequest(BaseModel):
    user_id: int
    role: TeamRole = TeamRole.member


class TeamRead(BaseModel):
    """Sidebar / list row."""

    id: int
    name: str
    avatar_url: str | None = None
    role: TeamRole
    member_count: int


class TeamMemberRead(BaseModel):
    user: UserBrief
    role: TeamRole


class TeamDetail(BaseModel):
    id: int
    name: str
    avatar_url: str | None = None
    my_role: TeamRole
    members: list[TeamMemberRead]


class MemberTotal(BaseModel):
    user_id: int
    name: str
    avatar_url: str | None = None
    total: Decimal


class TeamAnalyticsSummary(AnalyticsSummary):
    by_member: list[MemberTotal]


class TeamTransactionRead(TransactionRead):
    member: UserBrief
