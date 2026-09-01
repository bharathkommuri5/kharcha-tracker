# US-02 — Google authentication & JWT sessions

**As a** user
**I want** to sign in with my Google account
**So that** my expenses are private to me.

## Design
- `POST /auth/google` body `{id_token}` → verify with `google.oauth2.id_token.verify_oauth2_token` against `GOOGLE_CLIENT_ID` → extract `sub`, `email`, `name` → upsert `User` (username defaults to name) → return `{access_token, token_type:"bearer", user}`.
- `GET /auth/me` → current user (from `Authorization: Bearer`).
- `PATCH /auth/me` body `{username}` → update, username unique (409 on clash).
- JWT: `python-jose`, HS256, `sub=user.id`, `exp` from settings. Dependency `get_current_user` decodes, loads user, 401 on failure.
- **Dev-mode**: when `DEV_AUTH=true`, `POST /auth/dev-login` body `{email, name?}` issues a JWT for a stub user without Google. Disabled (404) in prod.

## Acceptance criteria
- [ ] Real Google ID token → valid app JWT; new user row created once, reused after.
- [ ] Bad/expired token → 401.
- [ ] `GET /auth/me` returns profile; `PATCH` changes username; duplicate username → 409.
- [ ] `DEV_AUTH=true` dev-login works; with it false the route 404s.
- [ ] All existing protected routes reject missing/invalid bearer.

## Live test steps
1. Dev: `POST /auth/dev-login {email:"me@test.com"}` → copy token → `GET /auth/me` with bearer.
2. Real: follow docs/credentials-setup.md, set `GOOGLE_CLIENT_ID`, use frontend login (US-07) or a real id_token → `/auth/google`.

## Implementation notes (2026-09-01)
- `app/security.py` (JWT), `app/deps.py` (`get_current_user` via HTTPBearer), `app/routers/auth.py`.
- `_get_or_create_user` upserts by `google_id`; `_unique_username` slugifies name and appends a
  numeric suffix on collision. Google profile fields refreshed on each login.
- `POST /auth/dev-login` gated on `settings.DEV_AUTH` (404 otherwise).
- Tested: `tests/test_auth.py` (6 tests) + live browser dev-login.
- **Pending:** real Google `id_token` flow — verified only that it 503s when `GOOGLE_CLIENT_ID`
  is unset. Needs the frontend Google button + a real account (creds now in `.env`).

## Status: 🟢 Done (backend + dev path; real-Google verification pending)
