"""Human-facing labels/icons for the category & payment-mode enums.

v1: derived here. v2 path: move to `CategoryOption` / `PaymentModeOption` tables so
options can be edited without a redeploy (see specs/us-03).
"""
from app.models import Category, PaymentMode

CATEGORY_META: dict[Category, dict[str, str]] = {
    Category.food_beverages: {"label": "Food & Beverages", "icon": "🍔", "color": "#f97316"},
    Category.medical: {"label": "Medical", "icon": "💊", "color": "#ef4444"},
    Category.travel: {"label": "Travel", "icon": "✈️", "color": "#0ea5e9"},
    Category.shopping: {"label": "Shopping", "icon": "🛍️", "color": "#a855f7"},
    Category.bills: {"label": "Bills", "icon": "🧾", "color": "#14b8a6"},
    Category.entertainment: {"label": "Entertainment", "icon": "🎬", "color": "#ec4899"},
    Category.others: {"label": "Others", "icon": "📦", "color": "#64748b"},
}

PAYMENT_MODE_LABELS: dict[PaymentMode, str] = {
    PaymentMode.phonepe: "PhonePe",
    PaymentMode.gpay: "GPay",
    PaymentMode.supermoney: "Supermoney",
    PaymentMode.cred: "CRED",
    PaymentMode.credit_card: "Credit Card",
    PaymentMode.debit_card: "Debit Card",
    PaymentMode.cash: "Cash",
    PaymentMode.other: "Other",
}


def category_label(value: Category | str) -> str:
    return CATEGORY_META[Category(value)]["label"]


def payment_mode_label(value: PaymentMode | str) -> str:
    return PAYMENT_MODE_LABELS[PaymentMode(value)]


def options_payload() -> dict[str, list[dict[str, str]]]:
    return {
        "categories": [
            {"value": c.value, "label": m["label"], "icon": m["icon"], "color": m["color"]}
            for c, m in CATEGORY_META.items()
        ],
        "payment_modes": [
            {"value": p.value, "label": label} for p, label in PAYMENT_MODE_LABELS.items()
        ],
    }
