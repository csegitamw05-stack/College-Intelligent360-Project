import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Enum, DateTime, Integer
from app.core.database import Base
from app.models.base import BaseModelMixin


class UserRole(str, enum.Enum):
    PRINCIPAL = "PRINCIPAL"
    HOD = "HOD"
    INCHARGE = "INCHARGE"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"


class User(Base, BaseModelMixin):
    """
    Authorized institutional user. No public registration.
    Accounts are created only via the secure seed/admin CLI.
    """
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    department = Column(String(150), nullable=True)  # Required for HOD/INCHARGE
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Security tracking
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    last_login_ip = Column(String(45), nullable=True)
