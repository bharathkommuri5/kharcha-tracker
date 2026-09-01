# US-04 — Transaction CRUD

**As a** user
**I want** to add, edit, list and delete expenses
**So that** I can keep an accurate monthly record.

## Design
- `GET /transactions?start=YYYY-MM-DD&end=YYYY-MM-DD` — defaults to 1st-of-current-month → today. Returns list ordered by `transaction_date desc, created_at desc`. Scoped to `current_user.id`.
- `POST /transactions` body `{amount, category, payment_mode, note?, transaction_date?}` → 201 with created row. `amount > 0`. `transaction_date` defaults to today. Category/payment_mode validated against enums.
- `PATCH /transactions/{id}` — partial update, 404 if not owner.
- `DELETE /transactions/{id}` — 204, 404 if not owner.
- `amount` stored as `Numeric(12,2)` / Decimal; serialised as number.

## Acceptance criteria
- [ ] CRUD works; rows isolated per user (user B cannot GET/PATCH/DELETE user A's row → 404).
- [ ] Date-range filter inclusive on both ends; default range = month-to-date.
- [ ] amount <= 0 → 422; invalid enum → 422.
- [ ] Response amounts formatted to 2 decimals.

## Live test steps
1. dev-login as user A → POST 3 transactions across 2 dates.
2. GET default range → 3 rows. GET narrow range → subset.
3. PATCH amount, DELETE one. dev-login as user B → GET → empty; PATCH A's id → 404.

## Implementation notes (2026-09-01)
- `app/routers/transactions.py`; `_owned_or_404` enforces per-user scoping on PATCH/DELETE/GET-by-id.
- `app/daterange.resolve_range` — shared default (month-to-date) + `start > end → 422`.
- `amount` validated `gt=0`, 2 decimals; serialised as string decimal by Pydantic.
- Tested: `tests/test_transactions.py` (6 tests, incl. cross-user isolation) + live browser CRUD.

## Status: 🟢 Done (live-tested)
