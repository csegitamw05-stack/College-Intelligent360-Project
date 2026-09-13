"""
JWT access token creation and verification.
Refresh tokens are opaque random strings stored as SHA-256 hashes in DB.
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings
from app.core.logging import logger

_ALGORITHM = settings.ALGORITHM
_SECRET_KEY = settings.SECRET_KEY


def create_access_token(subject: str | int, role: str, additional_data: dict | None = None) -> str:
    """
    Create a short-lived signed JWT access token.
    subject: user ID as string
    role: UserRole value
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    if additional_data:
        payload.update(additional_data)
    return jwt.encode(payload, _SECRET_KEY, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises ValueError with a generic message on any failure.
    """
    try:
        payload = jwt.decode(token, _SECRET_KEY, algorithms=[_ALGORITHM])
        if payload.get("type") != "access":
            raise ValueError("Invalid token type")
        return payload
    except JWTError as exc:
        logger.debug(f"JWT decode failure: {exc}")
        raise ValueError("Token is invalid or expired")


def generate_refresh_token() -> str:
    """Generate a cryptographically secure opaque refresh token (64 hex chars)."""
    return secrets.token_hex(32)
