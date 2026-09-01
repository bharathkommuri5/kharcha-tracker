# Deploying Kharcha Tracker (free tier)

Recommended: **Render Blueprint** (uses [`render.yaml`](../render.yaml)) — one repo, three
services created together: Postgres, FastAPI web service (`kharcha-api`), static site
(`kharcha-web`).

> **Free-tier caveats**
> - Render's **free Postgres is deleted after 30 days**. For something longer-lived, swap in a
>   free **Neon** database (see "Option B" below) — the rest stays identical.
> - Free web services **sleep after ~15 min idle**; the first request then takes 30–50 s.
> - Static sites and the 750 free web-service hours/month are enough for personal use.

---

## 0. Prerequisites
- The `dev` branch is pushed and merged to `main` (Render deploys a branch — use `main`).
- Google OAuth client + Gmail app password ready (see [credentials-setup.md](credentials-setup.md)).

## 1. Create the Blueprint
1. <https://dashboard.render.com> → **New → Blueprint**.
2. Connect the `kharcha-tracker` GitHub repo. Render reads `render.yaml`.
3. Pick branch **`main`**. **Apply**. It provisions `kharcha-db`, `kharcha-api`, `kharcha-web`.
   - `kharcha-api` build runs `pip install -r requirements.txt`; its start command runs
     `alembic upgrade head` then uvicorn, so the schema is created on first boot.
   - First deploy of `kharcha-api` will be **unhealthy** until you set the env vars in step 3.

## 2. Note the URLs
After the services exist you'll have (names may get a random suffix):
- API: `https://kharcha-api.onrender.com`
- Web: `https://kharcha-web.onrender.com`

## 3. Set env vars

**`kharcha-api` → Environment** (Add for each `sync: false` key):

| Key | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | your `…apps.googleusercontent.com` |
| `SUPERADMIN_EMAILS` | `jogiswara2002@gmail.com` (comma-separate more) |
| `CORS_ORIGINS` | `https://kharcha-web.onrender.com` |
| `SMTP_USER` | your sender Gmail |
| `SMTP_APP_PASSWORD` | 16-char app password, no spaces |
| `SMTP_FROM` | `Kharcha Tracker <your-sender@gmail.com>` |

**`kharcha-web` → Environment**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://kharcha-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | same Google client id |

Then: **`kharcha-web` → Manual Deploy → Clear build cache & deploy** (Vite bakes env vars at
build time), and **Save** on `kharcha-api` (it redeploys automatically).

## 4. Update the Google OAuth client
Google Cloud Console → APIs & Services → Credentials → your `kharcha-web` client →
**Authorized JavaScript origins** → add `https://kharcha-web.onrender.com` → Save.
(Consent screen can stay in "Testing" — add each Google account you'll log in with as a Test user.)

## 5. Test the live site
- Open the web URL → **Sign in with Google** → dashboard loads.
- Add an expense → charts update.
- **Reports → Send report** → check your inbox.
- `https://kharcha-api.onrender.com/health` → `{"status":"ok","db":"ok"}`.

---

## Option B — free Neon Postgres instead of Render's

1. <https://neon.tech> → new project → copy the **pooled** connection string
   (`postgresql://user:pass@…-pooler.neon.tech/neondb?sslmode=require`).
2. In `render.yaml`, delete the `databases:` block and the `DATABASE_URL` `fromDatabase` entry;
   add `DATABASE_URL` as `sync: false` instead. Re-apply the blueprint (or just add the var).
3. Paste the Neon string as `kharcha-api` → `DATABASE_URL`. The app rewrites `postgresql://` →
   `postgresql+psycopg2://` automatically.

## Fully-free alternative split
- **Frontend** → Netlify / Cloudflare Pages / Vercel (build `cd frontend && npm ci && npm run build`,
  publish `frontend/dist`, SPA redirect `/* /index.html 200`, set the two `VITE_` vars).
- **Backend** → Render free web service (as above) or Koyeb / Fly.io.
- **Postgres** → Neon or Supabase (both have real free tiers).

## Migrations later
Add a revision locally (`cd backend && alembic revision --autogenerate -m "..."`), commit, push to
`main` — the start command applies it on the next deploy.

## Notes
- `DATABASE_URL` from Render is `postgresql://…`; `app/config.py` rewrites it to
  `postgresql+psycopg2://…`.
- Migration `0002` creates Postgres `ENUM` types for `category` / `payment_mode`; a full
  `alembic downgrade base` leaves those behind (harmless).
- Avatar images are stored **in Postgres**, so they survive redeploys.
