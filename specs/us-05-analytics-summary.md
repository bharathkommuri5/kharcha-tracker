# US-05 — Analytics summary endpoint

**As a** user
**I want** aggregated spend numbers for a date range
**So that** the dashboard charts and cards have data.

## Design
- `GET /analytics/summary?start=...&end=...` — same default range as transactions.
- Response:
```json
{
  "range": {"start":"2026-09-01","end":"2026-09-30"},
  "total": 12345.67,
  "transaction_count": 42,
  "top_category": {"value":"food_beverages","label":"Food & Beverages","total":5000.00},
  "by_category": [{"value":"...","label":"...","total":0.0}, ...],
  "by_payment_mode": [{"value":"...","label":"...","total":0.0}, ...],
  "daily": [{"date":"2026-09-01","total":0.0}, ...]
}
```
- Aggregation via SQL `group by`. `daily` includes only days with spend (frontend fills gaps) — or fill server-side across range; decide during impl, document choice.
- All money rounded to 2 decimals. Scoped to `current_user.id`.

## Acceptance criteria
- [ ] Totals match sum of matching transactions.
- [ ] `by_category` / `by_payment_mode` cover only non-zero groups, sorted desc by total.
- [ ] `top_category` is null when no data; endpoint returns zeros, not 500, on empty range.

## Implementation notes (2026-09-01)
- `app/services/analytics.py` aggregates **in Python** (identical on SQLite/Postgres; personal
  data volume is tiny). `summarize()` returns `(summary, transactions)` so the report reuses it.
- **Decision:** `daily` is filled for **every day in the range** (zero-spend days included) so the
  frontend trend chart has a continuous axis with no client-side gap-filling.
- `by_category` / `by_payment_mode`: non-zero groups only, sorted desc. Empty range → zeros, `top_category: null`.
- Tested: `tests/test_analytics_reports.py` + live dashboard.

## Status: 🟢 Done (live-tested)
