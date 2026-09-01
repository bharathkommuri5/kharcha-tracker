"""JWT issuing / verification for the app's own session tokens."""
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import settings


class TokenError(Exception):
    """Raised when a token is missing, malformed, or expired."""


def create_access_token(subject: str | int, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.JWT_EXPIRE_MINUTES
    )
    payload = {"sub": str(subject), "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    """Return the token subject (user id as str) or raise TokenError."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:  # noqa: BLE001
        raise TokenError(str(exc)) from exc
    subject = payload.get("sub")
    if subject is None:
        raise TokenError("token missing subject")
    return subject
