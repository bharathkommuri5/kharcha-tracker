# Kharcha Tracker — Frontend (Vite + React)

## Local setup
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```
Opens http://localhost:5173. The scaffold page fetches `GET /health` from `VITE_API_URL`
and shows the JSON — confirms CORS + wiring.

## Build
```powershell
npm run build      # -> dist/
npm run preview
```

## Environment
See `.env.example`:
- `VITE_API_URL` — backend base URL
- `VITE_GOOGLE_CLIENT_ID` — from docs/credentials-setup.md
- `VITE_DEV_AUTH` — show dev-login form (pair with backend `DEV_AUTH=true`)
