# US-11 — Render deployment & end-to-end test

**As an** owner
**I want** the app deployed on Render
**So that** I can use it from anywhere.

## Design
- `render.yaml` at repo root:
  - **Postgres** free instance → provides `DATABASE_URL`.
  - **Web service** (backend): build `pip install -r backend/requirements.txt`, pre-deploy `cd backend && alembic upgrade head`, start `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Env: `DATABASE_URL` (from DB), `JWT_SECRET` (generate), `GOOGLE_CLIENT_ID`, `SMTP_HOST/PORT/USER/APP_PASSWORD/FROM`, `CORS_ORIGINS` (frontend URL), `DEV_AUTH=false`.
  - **Static site** (frontend): build `cd frontend && npm ci && npm run build`, publish `frontend/dist`. Env: `VITE_API_URL` (backend URL), `VITE_GOOGLE_CLIENT_ID`.
- Backend `DATABASE_URL`: translate `postgres://` → `postgresql+psycopg2://` at settings load. `psycopg2-binary` in requirements.
- Update Google OAuth authorized origins/redirects with the Render frontend URL.
- SPA routing: static site rewrite `/* → /index.html`.

## Acceptance criteria
- [ ] `render.yaml` deploys all three services.
- [ ] Migration runs on deploy; `/health` green on the live backend.
- [ ] Google login works on the live frontend.
- [ ] Full flow live: add expense → charts update → email report received.

## Implementation notes (2026-09-01)
- [`render.yaml`](../render.yaml) — `kharcha-db` (free Postgres), `kharcha-api` (web, `rootDir: backend`,
  `preDeployCommand: alembic upgrade head`), `kharcha-web` (static, `rootDir: frontend`, SPA rewrite).
- Cross-URLs (`CORS_ORIGINS`, `VITE_API_URL`) and Google/SMTP secrets are `sync: false` — set in the
  dashboard after the first deploy. Full walkthrough: [../docs/deploy-render.md](../docs/deploy-render.md).
- `app/config.sqlalchemy_url` rewrites Render's `postgresql://` → `postgresql+psycopg2://`.

## Status: 🟡 Config ready — not yet deployed (do after real Google/SMTP verified locally)
