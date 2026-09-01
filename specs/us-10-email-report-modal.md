# US-10 — Email report modal

**As a** user
**I want** a button to email myself the report for a chosen range
**So that** I can get records on demand.

## Design
- "✉️ Email me this report" button in the right panel header.
- Modal: range defaults to **1st of current month → today**. Two `<input type="date">` for custom start/end. Validation: start ≤ end.
- Submit → `POST /reports/email {start,end}` → loading state → success toast "Report sent to {email}" (or "saved to outbox (dev mode)").
- Close on backdrop click / Esc.

## Acceptance criteria
- [ ] Default range correct on open.
- [ ] Custom range submits and backend receives those dates.
- [ ] Success + error toasts shown; modal closes on success.
- [ ] Dev-mode message differs from real-send message.

## Implementation notes (2026-09-01)
- `components/EmailReportModal.jsx`, opened from the right-panel header button.
- Range defaults to `currentMonthRange()` (1st → today); two `<input type=date>` with min/max wiring.
- Client-side `start > end` guard + toast; server also enforces 422.
- Success toast differs for dev (`saved to the server outbox`) vs real (`sent to <email>`).
- `Modal` closes on Esc / backdrop.
- Live-tested: opened, submitted default range, dev toast shown, outbox file written.

## Status: 🟢 Done (dev-mode live-tested)
