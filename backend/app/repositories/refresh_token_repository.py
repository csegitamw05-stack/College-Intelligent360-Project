from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.auth import RefreshToken


class RefreshTokenRepository:

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        raw_token: str,
        expires_days: int,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id,
            token_hash=RefreshToken.hash_token(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=expires_days),
            revoked=False,
            ip_address=ip,
            user_agent=user_agent,
        )
        db.add(token)
        db.commit()
        db.refresh(token)
        return token

    @staticmethod
    def get_by_raw_token(db: Session, raw_token: str) -> Optional[RefreshToken]:
        token_hash = RefreshToken.hash_token(raw_token)
        return (
            db.query(RefreshToken)
            .filter(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked == False,
            )
            .first()
        )

    @staticmethod
    def revoke(db: Session, token: RefreshToken) -> None:
        token.revoked = True
        db.commit()

    @staticmethod
    def revoke_all_for_user(db: Session, user_id: int) -> None:
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False,
        ).update({"revoked": True})
        db.commit()

    @staticmethod
    def is_valid(token: RefreshToken) -> bool:
        if token.revoked:
            return False
        expires_at = token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) < expires_at
