"""
FastAPI dependency functions for authentication and role-based authorization.
These dependencies are used in endpoint signatures — enforced server-side.
"""
from typing import Callable
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.logging import logger
from app.security.jwt import decode_access_token
from app.models.user import User, UserRole

_bearer = HTTPBearer(auto_error=False)


def _get_token_payload(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """Extract and validate Bearer token from Authorization header."""
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    payload: dict = Depends(_get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    """Validate token and return the corresponding active User record."""
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Alias — ensures user is active (re-checked)."""
    return current_user


def require_roles(*roles: UserRole) -> Callable:
    """
    Factory that returns a FastAPI dependency enforcing role membership.
    Usage: `Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD))`
    Authorization is enforced in the backend — frontend routing is secondary.
    """
    def _role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            logger.warning(
                f"Authorization denied: user {current_user.id} (role={current_user.role}) "
                f"attempted to access resource requiring {roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )
        return current_user
    return _role_checker
