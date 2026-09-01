"""Backend-driven dropdown options so new categories / payment modes need no frontend redeploy."""
from fastapi import APIRouter

from app.config_options import options_payload
from app.deps import CurrentUser

router = APIRouter(prefix="/config", tags=["config"])


@router.get("/options")
def get_options(_: CurrentUser) -> dict:
    return options_payload()
