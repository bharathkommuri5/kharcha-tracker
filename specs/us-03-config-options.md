# US-03 — Config options endpoint

**As a** frontend
**I want** category and payment-mode lists from the backend
**So that** new options can be added without a frontend redeploy.

## Design
- `GET /config/options` (auth optional or required — keep required for consistency) →
```json
{
  "categories": [{"value":"food_beverages","label":"Food & Beverages","icon":"🍔"}, ...],
  "payment_modes": [{"value":"phonepe","label":"PhonePe"}, ...]
}
```
- v1: derived from the Python enums + a label/icon map in `app/config_options.py`.
- v2 path noted only: move to `CategoryOption`/`PaymentModeOption` tables.

### Category labels/icons
food_beverages 🍔 · medical 💊 · travel ✈️ · shopping 🛍️ · bills 🧾 · entertainment 🎬 · others 📦

### Payment mode labels
phonepe PhonePe · gpay GPay · supermoney Supermoney · cred CRED · credit_card Credit Card · debit_card Debit Card · cash Cash · other Other

## Acceptance criteria
- [ ] Endpoint returns both lists with value/label (and icon for categories).
- [ ] Values exactly match the enum values used by `Transaction`.

## Implementation notes (2026-09-01)
- `app/config_options.py` holds label/icon/color; `GET /config/options` (auth required).
- Categories also carry a `color` (hex) reused by the frontend charts + list icons.
- Live-tested via curl and consumed by the dashboard dropdowns/charts.

## Status: 🟢 Done
