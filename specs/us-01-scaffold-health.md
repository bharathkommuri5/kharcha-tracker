# US-01 — Project scaffold & health check

**As a** developer
**I want** a working monorepo skeleton for backend and frontend
**So that** every later story has a place to land and a way to run.

## Design

### Repo layout
```
kharcha-tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app, CORS, router registration
│   │   ├── config.py          # pydantic-settings Settings, reads .env
│   │   ├── database.py        # engine, get_session dependency, init_db
│   │   ├── models.py          # SQLModel tables (User, Transaction) — full schema up front
│   │   └── routers/
│   │       └── health.py      # GET /health
│   ├── alembic/               # migrations env
│   ├── alembic.ini
│   ├── tests/
│   │   └── test_health.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css         # tailwind directives
│   │   └── lib/api.js        # axios instance -> VITE_API_URL
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── README.md
├── docs/
│   └── credentials-setup.md
├── specs/
├── .gitignore
└── README.md
```

### Backend
- `Settings` fields: `DATABASE_URL` (default `sqlite:///./kharcha.db`), `JWT_SECRET`, `JWT_ALGORITHM=HS256`, `JWT_EXPIRE_MINUTES=10080`, `GOOGLE_CLIENT_ID`, `CORS_ORIGINS` (csv), `DEV_AUTH` (bool, default `false`), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_APP_PASSWORD`, `SMTP_FROM`.
- `models.py` defines the **complete** `User` and `Transaction` tables now (per §3 of instructions) so the first Alembic migration is the whole schema. Enums for `category` and `payment_mode` as `str, Enum`.
- `GET /health` → `{"status": "ok", "db": "ok"|"error"}` (runs `SELECT 1`).
- CORS configured from `CORS_ORIGINS`.
- Alembic wired to `Settings.DATABASE_URL` and `SQLModel.metadata`; generate initial migration `0001_initial`.

### Frontend
- Vite React app. Tailwind v3 configured. React Router installed (not yet routed).
- `src/lib/api.js`: axios instance with `baseURL: import.meta.env.VITE_API_URL`.
- `App.jsx`: minimal page that calls `GET /health` and shows the JSON — proves the wire works.
- `.env.example`: `VITE_API_URL=http://localhost:8000`, `VITE_GOOGLE_CLIENT_ID=`.

### Root
- `README.md`: what it is, local dev steps for both halves.
- `.gitignore`: python venv, `__pycache__`, `*.db`, `node_modules`, `dist`, `.env`.
- `docs/credentials-setup.md`: step-by-step to create Google OAuth client + Gmail app password.

## Acceptance criteria
- [x] `pip install -r requirements.txt` succeeds in a fresh venv.
- [x] `alembic upgrade head` creates `kharcha.db` with `user` and `transaction` tables.
- [x] `uvicorn app.main:app` runs; `GET http://localhost:8000/health` → `{"status":"ok","db":"ok"}`.
- [x] `pytest` passes (health test) — 2 passed.
- [x] `npm install` then `npm run dev` serves the frontend on `:5173`; `npm run build` clean.
- [x] Frontend page shows the health JSON fetched from the backend (CORS OK) — verified headless, 0 console errors.
- [x] `.env.example` present for both; `.env` gitignored, no real secrets committed.

## Live test steps
1. `cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`
2. `copy .env.example .env` → set `JWT_SECRET` to any string.
3. `alembic upgrade head` → confirm tables.
4. `uvicorn app.main:app --reload` → open `/docs`, hit `/health`.
5. `pytest`
6. `cd ../frontend && npm install && copy .env.example .env && npm run dev`
7. Open `http://localhost:5173` → health JSON renders.

## Status: 🟢 Done (tested 2026-09-01)
