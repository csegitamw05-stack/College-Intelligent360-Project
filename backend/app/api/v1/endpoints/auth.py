"""
Authentication endpoints.
Rate limited to 5 login attempts/min per IP.
Refresh token delivered via HttpOnly, Secure, SameSite=Strict cookie.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.config import settings
from app.schemas.auth import LoginRequest, TokenResponse, UserProfile
from app.schemas.user import UserRead
from app.services.auth_service import AuthService
from app.security.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

_COOKIE_NAME = "campus_intel_refresh"
_COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # seconds


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=_COOKIE_NAME,
        value=raw_token,
        max_age=_COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="strict",
        path="/api/v1/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=_COOKIE_NAME,
        path="/api/v1/auth",
        httponly=True,
        samesite="strict",
    )


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain access token",
    description="Rate limited to 5 attempts/minute per IP. Returns JWT access token. Refresh token set as HttpOnly cookie.",
)
def login(
    request: Request,
    response: Response,
    body: LoginRequest,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)
    ua = request.headers.get("User-Agent", "")

    try:
        result = AuthService.login(db, body.email, body.password, ip=ip, user_agent=ua)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    _set_refresh_cookie(response, result["refresh_token"])

    return TokenResponse(
        access_token=result["access_token"],
        expires_in=result["expires_in"],
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token using HttpOnly cookie",
)
def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    campus_intel_refresh: Optional[str] = Cookie(default=None),
):
    if not campus_intel_refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token found. Please log in.",
        )
    try:
        result = AuthService.refresh(db, campus_intel_refresh)
    except ValueError as exc:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    _set_refresh_cookie(response, result["refresh_token"])

    return TokenResponse(
        access_token=result["access_token"],
        expires_in=result["expires_in"],
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout — revoke refresh token",
)
def logout(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    campus_intel_refresh: Optional[str] = Cookie(default=None),
):
    if campus_intel_refresh:
        AuthService.logout(db, campus_intel_refresh, user_id=current_user.id)
    _clear_refresh_cookie(response)


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get current authenticated user profile",
)
def get_me(current_user: User = Depends(get_current_active_user)) -> UserProfile:
    return UserProfile.model_validate(current_user)
