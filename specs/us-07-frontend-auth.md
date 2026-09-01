# US-07 — Frontend auth screen & protected routes

**As a** user
**I want** a sign-in landing page and a protected dashboard
**So that** I only see my data after logging in.

## Design
- `@react-oauth/google` `GoogleOAuthProvider` (clientId = `VITE_GOOGLE_CLIENT_ID`) wraps app.
- `LandingPage`: product blurb + `GoogleLogin` component → on success POST `id_token` to `/auth/google` → store `{token, user}` in `AuthContext` + `localStorage`.
- Dev-mode helper: if `VITE_DEV_AUTH=true`, show an extra "Dev login" form (email) → `/auth/dev-login`.
- `AuthContext`: `{user, token, login, logout}`. Axios request interceptor attaches `Authorization: Bearer`. 401 response interceptor → logout + redirect to `/`.
- Routes (React Router): `/` landing (redirects to `/app` if authed), `/app` dashboard (redirects to `/` if not).
- First login with no custom username → one-time modal "Welcome {name}! Set a display username (optional)" → `PATCH /auth/me`.

## Acceptance criteria
- [ ] Logged-out user hitting `/app` → redirected to `/`.
- [ ] Google login → lands on `/app`, refresh keeps session (localStorage).
- [ ] Logout clears storage, returns to `/`.
- [ ] 401 from API auto-logs-out.
- [ ] Username prompt shows once for new users.

## Implementation notes (2026-09-01)
- `context/AuthContext.jsx` — token in `localStorage` (`kharcha_token`), profile hydrated via `/auth/me`.
- `lib/api.js` axios interceptors: attach bearer; on 401 → `AuthContext.logout()`.
- `pages/LandingPage.jsx` — `GoogleLogin` (when `VITE_GOOGLE_CLIENT_ID` set) + dev-login form
  (when `VITE_DEV_AUTH=true`). `components/RequireAuth.jsx` guards `/app`.
- `components/UsernamePrompt.jsx` — one-time modal, `kharcha_username_prompt_seen` flag.
- Live-tested: dev-login → `/app`, refresh persists, logout, route guard. **Pending:** real Google button click-through.

## Status: 🟢 Done (dev path live-tested; real Google pending)
