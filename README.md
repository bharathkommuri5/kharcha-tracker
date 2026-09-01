# Kharcha Tracker

Personal expense tracker. Google sign-in, log daily expenses (category · payment mode · amount),
see this month's transactions and charts (category-wise / day-wise), and email yourself a report.
Currency: **₹ INR** throughout.

## Stack
- **Backend**: Python 3.11+, FastAPI, SQLModel, Alembic. SQLite locally, Postgres on Render.
- **Frontend**: Vite + React, React Router, Axios, Recharts, Tailwind, `@react-oauth/google`.
- **Deploy**: Render — static site (frontend), web service (backend), managed Postgres.

## Repo layout
- `backend/` — FastAPI app + migrations + tests. See [backend/README.md](backend/README.md).
- `frontend/` — React app. See [frontend/README.md](frontend/README.md).
- `specs/` — spec-driven user stories, built one at a time. See [specs/README.md](specs/README.md).
- `docs/credentials-setup.md` — how to create the Google OAuth client and Gmail app password.

## Quick start
```powershell
# Backend
cd backend
python -m venv .venv; .venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env      # set JWT_SECRET
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
copy .env.example .env
npm run dev
```
Backend on `:8000`, frontend on `:5173`. With `DEV_AUTH=true` you can use the app without
Google/SMTP credentials (fake login, emails saved to `backend/outbox/`).

## Status
MVP feature-complete and live-tested locally (US-01…US-10). Deploy config (US-11) ready.
Track detail in [specs/README.md](specs/README.md).

| Area | State |
|---|---|
| Backend API (auth, config, transactions, analytics, reports) | ✅ 17 tests pass + live smoke |
| Frontend dashboard (two-panel, charts, modals) | ✅ live browser-tested |
| Real Gmail SMTP send | ✅ verified (report delivered to the configured address) |
| Real Google login (browser consent) | ✅ verified — signed in with a real account |
| Responsive UI (laptop + mobile) | ✅ modal-based Add Expense, mobile tabs + FAB, tested at 1440/390px |
| Render deployment | ⏳ `render.yaml` + [docs/deploy-render.md](docs/deploy-render.md) ready |

## Docs
- [docs/credentials-setup.md](docs/credentials-setup.md) — create Google OAuth + Gmail app password
- [docs/deploy-render.md](docs/deploy-render.md) — deploy to Render step by step
