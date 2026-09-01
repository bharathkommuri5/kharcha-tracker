"""Avatar image handling: validate, resize, store in the DB, serve by token."""
import io
import uuid

from fastapi import HTTPException, UploadFile, status
from PIL import Image as PILImage
from PIL import UnidentifiedImageError
from sqlmodel import Session

from app.models import Image

MAX_UPLOAD_BYTES = 4 * 1024 * 1024
TARGET = 256


async def _read_capped(file: UploadFile) -> bytes:
    raw = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be 4 MB or smaller",
        )
    return raw


def _process(raw: bytes) -> tuple[bytes, str]:
    try:
        img = PILImage.open(io.BytesIO(raw))
        img.load()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="That file isn't a valid image",
        ) from None

    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
    img = img.convert("RGBA" if has_alpha else "RGB")

    # cover-crop to a square, then resize
    w, h = img.size
    side = min(w, h)
    img = img.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
    img = img.resize((TARGET, TARGET), PILImage.LANCZOS)

    buf = io.BytesIO()
    if has_alpha:
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue(), "image/png"
    img.save(buf, format="JPEG", quality=82, optimize=True)
    return buf.getvalue(), "image/jpeg"


async def store_avatar(session: Session, file: UploadFile) -> Image:
    raw = await _read_capped(file)
    data, content_type = _process(raw)
    image = Image(token=uuid.uuid4().hex, data=data, content_type=content_type)
    session.add(image)
    session.commit()
    session.refresh(image)
    return image


def delete_image(session: Session, image_id: int | None) -> None:
    if image_id is None:
        return
    obj = session.get(Image, image_id)
    if obj is not None:
        session.delete(obj)
        session.commit()


def image_url(token: str | None) -> str | None:
    return f"/images/{token}" if token else None
