from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.security.password import hash_password
from app.core.config import settings


class UserRepository:

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower().strip()).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create(
        db: Session,
        email: str,
        full_name: str,
        role: UserRole,
        plain_password: str,
        department: Optional[str] = None,
    ) -> User:
        user = User(
            email=email.lower().strip(),
            full_name=full_name,
            role=role,
            department=department,
            hashed_password=hash_password(plain_password),
            is_active=True,
            failed_attempts=0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def record_successful_login(db: Session, user: User, ip: str) -> None:
        user.failed_attempts = 0
        user.locked_until = None
        user.last_login = datetime.now(timezone.utc)
        user.last_login_ip = ip
        db.commit()

    @staticmethod
    def record_failed_attempt(db: Session, user: User) -> None:
        from datetime import timedelta
        user.failed_attempts = (user.failed_attempts or 0) + 1
        if user.failed_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=settings.LOCKOUT_MINUTES)
        db.commit()

    @staticmethod
    def is_locked(user: User) -> bool:
        if user.locked_until is None:
            return False
        return datetime.now(timezone.utc) < user.locked_until.replace(tzinfo=timezone.utc)
