# Kharcha Tracker — Specs

Spec-driven development. Each user story is a self-contained file: **design → implement → live test → check off**.
Work them in order; do not start a story until the previous one is tested and merged.

| #  | Story | Status |
|----|-------|--------|
| [US-01](us-01-scaffold-health.md) | Project scaffold & health check | 🟢 Done |
| [US-02](us-02-google-auth.md) | Google authentication & JWT sessions | 🟢 Done (real Google login verified 2026-09-01) |
| [US-03](us-03-config-options.md) | Config options endpoint (categories, payment modes) | 🟢 Done |
| [US-04](us-04-transaction-crud.md) | Transaction CRUD | 🟢 Done (live-tested) |
| [US-05](us-05-analytics-summary.md) | Analytics summary endpoint | 🟢 Done (live-tested) |
| [US-06](us-06-email-report.md) | Email report (SMTP app-password) | 🟢 Done (dev + real Gmail SMTP verified) |
| [US-07](us-07-frontend-auth.md) | Frontend auth screen & protected routes | 🟢 Done (real Google sign-in verified) |
| [US-08](us-08-left-panel.md) | Left panel — transaction list + add-expense form | 🟢 Done (live-tested) |
| [US-09](us-09-right-panel-charts.md) | Right panel — summary cards + charts | 🟢 Done (live-tested) |
| [US-10](us-10-email-report-modal.md) | Email report modal (default/custom range) | 🟢 Done (dev-mode live-tested) |
| [US-11](us-11-render-deploy.md) | Render deployment & end-to-end test | 🟡 Config ready — deploy pending |

Legend: ⚪ Not started · 🟡 In progress · 🟢 Done (tested) · 🔵 Deployed

## Branding
Logomark = a ₹ over a spend-trend line, indigo→violet. Source: `frontend/public/favicon.svg`;
React version `frontend/src/components/BrandMark.jsx` (used in header + landing). Raster assets
(`favicon-16/32.png`, `apple-touch-icon.png`, `icon-192/512.png`) + `manifest.webmanifest` for
installable PWA. Regenerate rasters from the SVG if it changes.

## Conventions
- Currency is **₹ INR** everywhere. Never render `$`.
- Backend: Python 3.11+, FastAPI, SQLModel, Alembic. SQLite locally, Postgres in prod.
- Frontend: Vite + React + React Router + Axios + Recharts + Tailwind.
- Category/payment-mode lists are **backend-driven** via `GET /config/options`.
- All data endpoints require `Authorization: Bearer <app-JWT>` and are scoped to `current_user.id`.
- Dev-mode fallback: when `DEV_AUTH=true` the backend accepts a fake login and email sends are logged, not sent — so stories can be tested before real Google/SMTP credentials exist. See [../docs/credentials-setup.md](../docs/credentials-setup.md).

## Live testing
Each story lists concrete manual test steps. Run backend (`uvicorn app.main:app --reload`) and frontend (`npm run dev`) locally and verify before checking the box.
