# Deploying Kharcha Tracker (free tier)

**Stack:** Neon (Postgres, external) + Render **Blueprint** for the backend web service
(`kharcha-api`) and the static frontend (`kharcha-web`), both from [`render.yaml`](../render.yaml).

> **Free-tier notes**
> - **Neon** free Postgres is persistent (unlike Render's, which is deleted after 30 days).
> - Render free web services **sleep after ~15 min idle**; the first request then takes 30–50 s.
> - Static sites + 750 free web-service hours/month are plenty for personal use.

---

## 0. Prerequisites
- `dev` merged to `main` (Render deploys the `main` branch).
- Neon database created; connection string in hand (see `docs/credentials.local.md` §0).
- Google OAuth client + Gmail app password ready (`docs/credentials-setup.md`).

## 1. Create the Blueprint
1. <https://dashboard.render.com> → **New → Blueprint**.
2. Connect the `kharcha-tracker` repo, branch **`main`**. Render reads `render.yaml`.
3. **Apply** → it creates `kharcha-api` (web) and `kharcha-web` (static).
   - `kharcha-api` build: `pip install -r requirements.txt`;
     start: `alembic upgrade head && uvicorn …` — the schema is applied on first boot.
   - First deploy will be **unhealthy** until the env vars in step 3 are set.

## 2. Note the URLs
- API: `https://kharcha-api.onrender.com`
- Web: `https://kharcha-web.onrender.com`
  (Render may append a random suffix — use the real names.)

## 3. Set env vars

**`kharcha-api` → Environment:**

| Key | Value |
|---|---|
| `DATABASE_URL` | your full Neon connection string (`postgresql://…?sslmode=require&channel_binding=require`) |
| `GOOGLE_CLIENT_ID` | your `…apps.googleusercontent.com` |
| `SUPERADMIN_EMAILS` | `jogiswara2002@gmail.com` (comma-separate more) |
| `CORS_ORIGINS` | `https://kharcha-web.onrender.com` |
| `SMTP_USER` | sender Gmail |
| `SMTP_APP_PASSWORD` | 16-char app password, no spaces |
| `SMTP_FROM` | `Kharcha Tracker <your-sender@gmail.com>` |

(`JWT_SECRET` is auto-generated; `DEV_AUTH=false`, `SMTP_HOST/PORT`, `PYTHON_VERSION` are in the blueprint.)

**`kharcha-web` → Environment:**

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://kharcha-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | same Google client id |

Then **`kharcha-web` → Manual Deploy → Clear build cache & deploy** (Vite bakes env vars at build
time); `kharcha-api` redeploys automatically on save.

## 4. Update the Google OAuth client
Google Cloud Console → APIs & Services → Credentials → your web client →
**Authorized JavaScript origins** → add `https://kharcha-web.onrender.com` → Save.
Keep the consent screen in "Testing" and add each Google account you'll use as a Test user.

## 5. Test the live site
- Web URL → **Sign in with Google** → dashboard loads.
- Add an expense → charts update.
- Reports → **Send report** → check your inbox.
- `https://kharcha-api.onrender.com/health` → `{"status":"ok","db":"ok"}`.

---

## Fully-free alternatives for each piece
| Piece | Options |
|---|---|
| Frontend (static) | Render static · Netlify · Cloudflare Pages · Vercel |
| Backend (FastAPI) | Render free web service · Koyeb · Fly.io |
| Postgres | **Neon** (used here) · Supabase |

For Netlify/Vercel frontend: build `cd frontend && npm ci && npm run build`, publish
`frontend/dist`, SPA redirect `/* → /index.html` (200), set the two `VITE_` vars.

## Migrations later
`cd backend && alembic revision --autogenerate -m "..."`, commit, push to `main` — the start
command applies it on the next deploy.

## Notes
- `app/config.py` rewrites `postgresql://` → `postgresql+psycopg2://`; `sslmode` / `channel_binding`
  query params pass through to libpq unchanged.
- Migration `0002` creates Postgres `ENUM` types (`category`, `paymentmode`, `teamrole`).
- Avatar images live in Postgres (`image` table, bytes), so they survive redeploys.
- Verified locally against this Neon DB: health, transactions, analytics, teams (combined
  totals + `by_member`), avatar upload + serve, emailed report.
