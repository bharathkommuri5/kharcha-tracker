# Credentials Setup

You need two sets of credentials for full live testing. Until you have them, run with
`DEV_AUTH=true` (backend) and `VITE_DEV_AUTH=true` (frontend) — fake login works and emails
are written to `backend/outbox/` instead of being sent.

---

## A. Google OAuth Client ID (for "Sign in with Google")

1. Go to <https://console.cloud.google.com/> and sign in.
2. Top bar → project dropdown → **New Project** → name it `kharcha-tracker` → **Create**. Select it.
3. Left menu → **APIs & Services → OAuth consent screen**.
   - User type: **External** → **Create**.
   - App name: `Kharcha Tracker`. User support email: your email. Developer contact: your email.
   - **Save and Continue** through Scopes (add nothing) and Test users:
   - Under **Test users** click **Add users** and add every Google account you'll log in with
     (consent screen stays in "Testing" mode — that's fine).
   - **Save and Continue** → **Back to Dashboard**.
4. Left menu → **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: `kharcha-web`.
   - **Authorized JavaScript origins** → Add URI:
     - `http://localhost:5173`
     - `http://localhost:5174` (Vite's fallback port)
     - (later) your Render frontend URL, e.g. `https://kharcha-tracker-web.onrender.com`
   - **Authorized redirect URIs**: not required for `@react-oauth/google` implicit/ID-token flow,
     but add `http://localhost:5173` if Google asks.
   - **Create**.
5. Copy the **Client ID** (looks like `xxxxx.apps.googleusercontent.com`).
   You can ignore the Client Secret for the ID-token verification flow.

**Give me:**
```
GOOGLE_CLIENT_ID = <the client id>
```
It goes into `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

---

## B. Gmail App Password (for emailed reports)

Requires a Google account with **2-Step Verification ON**. Use a dedicated/less-important
account if you prefer — reports are sent *from* this account *to* whichever user requests one.

1. Go to <https://myaccount.google.com/security>.
2. Enable **2-Step Verification** if not already on (required for app passwords).
3. Visit <https://myaccount.google.com/apppasswords>.
4. App name: `kharcha-tracker` → **Create**.
5. Copy the 16-character password shown (remove spaces).

**Give me:**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 465
SMTP_USER = <the-sender-gmail-address>
SMTP_APP_PASSWORD = <16-char app password, no spaces>
SMTP_FROM = Kharcha Tracker <the-sender-gmail-address>
```

---

## C. How to hand them over

Paste the values in chat, or fill them into `backend/.env` and `frontend/.env` yourself
(copy from the `.env.example` files). Never commit `.env` — it's gitignored.

Once set: restart the backend with `DEV_AUTH=false`, rebuild the frontend, and real Google
login + real email sending are active.
