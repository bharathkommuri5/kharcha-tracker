import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analytics, auth, config, health, reports, transactions

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Kharcha Tracker API",
    version="0.1.0",
    description="Personal expense tracker — Google auth, transactions, analytics, emailed reports.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (health, auth, config, transactions, analytics, reports):
    app.include_router(module.router)


@app.get("/", tags=["health"])
def root() -> dict[str, str]:
    return {"name": "kharcha-tracker", "docs": "/docs", "dev_auth": str(settings.DEV_AUTH)}
