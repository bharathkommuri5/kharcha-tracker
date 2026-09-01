# US-08 — Left panel: transaction list + add-expense form

**As a** user
**I want** to see this month's expenses and quickly add one
**So that** logging spend is fast.

## Design
- **Header**: `◀  September 2026  ▶` — month nav changes the `{start,end}` range (1st→last day of that month, or today if current month) and refetches `/transactions` + `/analytics/summary`.
- **List**: scrollable, each row = date · category icon+label · payment mode · **₹amount** (right-aligned). Row actions on hover: edit, delete (confirm).
- **"+ Add Expense"** at top toggles inline form:
  - Category — `<select>` from `/config/options`
  - Payment Mode — `<select>` from `/config/options`
  - Amount — **range + number combined**: `<input type="range" min=0 max=5000 step=50>` and `<input type="number" min=0 step=0.01>` bound to one state value; dragging updates number, typing updates slider (slider clamps display but number keeps exact/large values).
  - Note — optional text
  - Save → `POST /transactions` → optimistic prepend + refetch summary; reset form.
- ₹ formatting helper `formatINR(n)` → `₹1,234.56` (`Intl.NumberFormat('en-IN')`).
- State via a `useTransactions(range)` hook (or React Query if added).

## Acceptance criteria
- [ ] List shows current month by default, ordered newest first.
- [ ] Month nav loads other months' data.
- [ ] Slider and number field stay in sync both directions; number accepts values > 5000.
- [ ] Save adds the row and updates the charts/cards.
- [ ] Edit and delete work and refresh totals.
- [ ] All amounts show `₹`, en-IN grouping, never `$`.

## Implementation notes (2026-09-01)
- `context/DashboardContext.jsx` — single source of truth: `range`, `options`, `transactions`,
  `summary`, `loading`, `error`, plus `addTransaction/updateTransaction/deleteTransaction/goToMonth/refresh`.
  Stale-response guard via a request-id ref. Left + right panels share it.
- `components/MonthNav.jsx` (◀ label ▶, next disabled on current month),
  `LeftPanel.jsx`, `AddExpenseForm.jsx`, `EditExpenseModal.jsx`, `TransactionList.jsx` (hover edit/delete + confirm).
- `components/AmountInput.jsx` — `range` (0–5000, step 50) + `number` bound to one state;
  slider clamps display, number keeps exact/larger values.
- `lib/format.formatINR` via `Intl.NumberFormat('en-IN', {currency:'INR'})`.
- Live-tested: add (×2 categories/dates), edit (₹→₹), delete (row count + total update), month nav.

## UI revision (2026-09-01, per user feedback)
- **Add Expense is now a modal** (`AddExpenseModal`), opened from a primary button in the top
  `DashboardHeader` (desktop) and a floating `＋` button (mobile) — no longer inline in the left panel.
- Month nav moved into the header. Left panel (`TransactionsPanel`) is now list-only with a slim
  total/entries strip.
- Form redesigned: category **chips** (color-coded) instead of a dropdown, quick-amount chips
  (₹100–₹2000), ₹-prefixed number field + slider + live formatted value.
- Responsive: desktop = two columns (sticky left rail); mobile = `SegmentedControl` (Overview /
  Transactions) + FAB. Modal becomes a bottom sheet on mobile.
- Re-tested live at 1440px and 390px.

## Status: 🟢 Done (redesigned + live-tested desktop & mobile)
