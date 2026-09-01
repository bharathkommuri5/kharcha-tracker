# Deploying Kharcha Tracker to Render

Uses [`render.yaml`](../render.yaml) (a Blueprint): 1 free Postgres, 1 FastAPI web
service (`kharcha-api`), 1 static site (`kharcha-web`).

## 1. Push the repo to GitHub
```powershell
git add .
git commit -m "Kharcha Tracker MVP"
git push origin main
```

## 2. Create the Blueprint
1. Render dashboard → **New → Blueprint**.
2. Connect the `kharcha-tracker` repo. Render reads `render.yaml`.
3. **Apply** — it provisions `kharcha-db`, `kharcha-api`, `kharcha-web`.
   The first backend deploy runs `alembic upgrade head` automatically (preDeployCommand).

## 3. Set the secrets & cross-URLs
After the services exist you'll have two URLs, e.g.
- API: `https://kharcha-api.onrender.com`
- Web: `https://kharcha-web.onrender.com`

**On `kharcha-api` → Environment:**
| Key | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | your `…apps.googleusercontent.com` |
| `CORS_ORIGINS` | `https://kharcha-web.onrender.com` |
| `SMTP_USER` | your sender Gmail |
| `SMTP_APP_PASSWORD` | 16-char app password (no spaces) |
| `SMTP_FROM` | `Kharcha Tracker <your-sender@gmail.com>` |

**On `kharcha-web` → Environment:**
| Key | Value |
|---|---|
| `VITE_API_URL` | `https://kharcha-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | same Google client id |

`DEV_AUTH` / `VITE_DEV_AUTH` are already `false` in the blueprint — the dev-login
route 404s in production.

After setting these, **Manual Deploy → Clear build cache & deploy** on `kharcha-web`
(Vite bakes env vars at build time) and **Save, rebuild** on `kharcha-api`.

## 4. Update the Google OAuth client
Google Cloud Console → APIs & Services → Credentials → `kharcha-web` client →
**Authorized JavaScript origins** → add `https://kharcha-web.onrender.com`.

## 5. End-to-end test on the live site
- Open the web URL → **Sign in with Google** → dashboard loads.
- Add an expense → list + charts update.
- **Email me this report** → check your inbox.
- `GET https://kharcha-api.onrender.com/health` → `{"status":"ok","db":"ok"}`.

## Notes
- **Free tier** spins the API down after 15 min idle; first request then takes ~30–50 s.
- **DB migrations later:** add a revision locally (`alembic revision --autogenerate -m "..."`),
  commit, push — the preDeployCommand applies it on the next deploy.
- The initial migration creates Postgres `ENUM` types for `category` / `payment_mode`;
  a full `alembic downgrade base` leaves those types behind (harmless; drop manually if re-running).
- `DATABASE_URL` from Render is `postgresql://…`; the app rewrites it to
  `postgresql+psycopg2://…` at startup (`app/config.py`).
