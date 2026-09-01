"""Serve avatar images by unguessable token (public — no auth)."""
from fastapi import APIRouter, HTTPException, Response, status
from sqlmodel import select

from app.deps import SessionDep
from app.models import Image

router = APIRouter(prefix="/images", tags=["images"])


@router.get("/{token}")
def get_image(token: str, session: SessionDep) -> Response:
    image = session.exec(select(Image).where(Image.token == token)).first()
    if image is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return Response(
        content=image.data,
        media_type=image.content_type,
        headers={"Cache-Control": "public, max-age=604800, immutable"},
    )
