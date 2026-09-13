"""
Authentication service — orchestrates login, refresh, logout flows.
All error messages are deliberately generic to prevent user enumeration.
"""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.security.password import verify_password
from app.security.jwt import create_access_token, generate_refresh_token
from app.services.audit_service import AuditService


_GENERIC_AUTH_ERROR = "Invalid credentials. Please check your email and password."


class AuthService:

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> dict:
        """
        Authenticate a user.
        Returns access token and raw refresh token on success.
        Raises ValueError with a safe generic message on failure.
        """
        # Always look up to avoid timing attack on enumeration
        user: Optional[User] = UserRepository.get_by_email(db, email)

        # Check lockout before verifying password
        if user and UserRepository.is_locked(user):
            AuditService.log(
                db, AuditService.ACCOUNT_LOCKED,
                actor_id=user.id, ip_address=ip,
                details={"email_domain": email.split("@")[-1] if "@" in email else "unknown"},
            )
            # Generic message — don't reveal lockout specifically
            raise ValueError(_GENERIC_AUTH_ERROR)

        password_correct = False
        if user:
            password_correct = verify_password(password, user.hashed_password)

        if not user or not password_correct:
            if user:
                UserRepository.record_failed_attempt(db, user)
                AuditService.log(
                    db, AuditService.LOGIN_FAILED,
                    actor_id=user.id, ip_address=ip,
                    details={"attempts": user.failed_attempts},
                )
            else:
                # Still call a hash to maintain constant time
                verify_password(password, "$argon2id$v=19$m=65536,t=3,p=2$placeholder$placeholder")
                AuditService.log(
                    db, AuditService.LOGIN_FAILED,
                    ip_address=ip,
                    details={"reason": "user_not_found"},
                )
            raise ValueError(_GENERIC_AUTH_ERROR)

        if not user.is_active:
            AuditService.log(db, AuditService.LOGIN_FAILED, actor_id=user.id, ip_address=ip,
                             details={"reason": "inactive_account"})
            raise ValueError(_GENERIC_AUTH_ERROR)

        # Successful authentication
        access_token = create_access_token(subject=user.id, role=user.role.value)
        raw_refresh = generate_refresh_token()

        RefreshTokenRepository.create(
            db,
            user_id=user.id,
            raw_token=raw_refresh,
            expires_days=settings.REFRESH_TOKEN_EXPIRE_DAYS,
            ip=ip,
            user_agent=user_agent,
        )

        UserRepository.record_successful_login(db, user, ip or "")

        AuditService.log(
            db, AuditService.LOGIN_SUCCESS,
            actor_id=user.id, ip_address=ip,
            entity_type="User", entity_id=str(user.id),
            details={"role": user.role.value},
        )

        return {
            "access_token": access_token,
            "refresh_token": raw_refresh,
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    def refresh(db: Session, raw_refresh_token: str) -> dict:
        """Issue a new access token using a valid refresh token."""
        token_record = RefreshTokenRepository.get_by_raw_token(db, raw_refresh_token)

        if not token_record or not RefreshTokenRepository.is_valid(token_record):
            raise ValueError("Refresh token is invalid or expired. Please log in again.")

        user = UserRepository.get_by_id(db, token_record.user_id)
        if not user or not user.is_active:
            raise ValueError("Session is no longer valid.")

        # Rotate: revoke old, issue new
        RefreshTokenRepository.revoke(db, token_record)
        new_access = create_access_token(subject=user.id, role=user.role.value)
        new_raw_refresh = generate_refresh_token()

        RefreshTokenRepository.create(
            db,
            user_id=user.id,
            raw_token=new_raw_refresh,
            expires_days=settings.REFRESH_TOKEN_EXPIRE_DAYS,
            ip=token_record.ip_address,
            user_agent=token_record.user_agent,
        )

        AuditService.log(db, AuditService.TOKEN_REFRESH, actor_id=user.id,
                         entity_type="User", entity_id=str(user.id))

        return {
            "access_token": new_access,
            "refresh_token": new_raw_refresh,
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    def logout(db: Session, raw_refresh_token: str, user_id: Optional[int] = None) -> None:
        """Revoke the current refresh token (current device logout)."""
        token_record = RefreshTokenRepository.get_by_raw_token(db, raw_refresh_token)
        if token_record:
            RefreshTokenRepository.revoke(db, token_record)
            AuditService.log(db, AuditService.LOGOUT, actor_id=user_id or token_record.user_id,
                             entity_type="User", entity_id=str(token_record.user_id))

    @staticmethod
    def logout_all(db: Session, user_id: int) -> None:
        """Revoke all refresh tokens for this user (logout from all devices)."""
        RefreshTokenRepository.revoke_all_for_user(db, user_id)
        AuditService.log(db, AuditService.LOGOUT, actor_id=user_id,
                         details={"scope": "all_devices"})
