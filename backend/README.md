# Kharcha Tracker — Backend (FastAPI)

## Local setup (Windows PowerShell)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env      # then edit JWT_SECRET
alembic upgrade head        # creates kharcha.db
uvicorn app.main:app --reload
```
- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health → `{"status":"ok","db":"ok"}`

## Tests
```powershell
pytest
```

## Migrations
```powershell
alembic revision --autogenerate -m "message"
alembic upgrade head
```

## Environment
See `.env.example`. While `DEV_AUTH=true`, Google/SMTP creds are not needed:
`/auth/dev-login` issues tokens and report emails are written to `outbox/`.
