# US-06 — Email report (SMTP app-password)

**As a** user
**I want** a monthly (or custom-range) expense report emailed to me
**So that** I have a record outside the app.

## Design
- `POST /reports/email` body `{start?, end?}` → default month-to-date → fetch transactions + reuse analytics aggregation → render Jinja2 HTML (summary table: totals, by-category, by-payment-mode, full transaction list) → send via `smtplib.SMTP_SSL` to `current_user.email`.
- Sender: shared Gmail account, `SMTP_USER` + `SMTP_APP_PASSWORD` (see docs/credentials-setup.md).
- **Dev-mode** (`DEV_AUTH=true` or missing SMTP creds): skip send, write the rendered HTML to `backend/outbox/<timestamp>.html` and log the path. Response still `{"status":"sent","to":...}` with `"dev":true`.
- Optional: PDF via `reportlab` — defer to v2, HTML email is fine for v1.
- Rate-limit lightly (e.g. max 1 per 60s per user) to avoid abuse — optional for v1.

## Acceptance criteria
- [ ] Dev-mode: file written to `outbox/`, opens in browser, numbers match analytics.
- [ ] Real creds: email arrives at the logged-in user's address, ₹ formatting, correct range.
- [ ] Bad range (start > end) → 422.

## Implementation notes (2026-09-01)
- `app/services/email.py` + `app/templates/report.html.j2` (KPIs, by-category, by-payment, full list).
- `app/formatting.format_inr` — Indian digit grouping (`₹12,34,567.89`).
- Dev fallback: when `DEV_AUTH=true` **or** SMTP creds missing → HTML written to `backend/outbox/`,
  response `{"status":"saved","dev":true}`. Real path uses `smtplib.SMTP_SSL` + app password.
- `start > end → 422` (via `resolve_range`). Send failures → 502 with detail.
- Tested: dev-mode (`tests/test_analytics_reports.py` + live modal) **and real Gmail SMTP send**
  verified 2026-09-01 (`status: sent`, message accepted by smtp.gmail.com using the app password).

## Status: 🟢 Done (dev + real SMTP both verified)
