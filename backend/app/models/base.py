from datetime import datetime
from sqlalchemy import Column, DateTime, Integer
from app.core.database import Base


class BaseModelMixin(object):
    """
    Mixin providing standard id and timestamp attributes for models.
    """
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SoftDeleteMixin(object):
    """
    Mixin for soft deletion support.
    """
    from sqlalchemy import String, ForeignKey
    deleted_at = Column(DateTime, nullable=True, index=True)
    deleted_by = Column(Integer, ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    deletion_reason = Column(String(255), nullable=True)
