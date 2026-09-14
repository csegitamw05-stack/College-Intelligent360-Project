from sqlalchemy import Column, String, Text, Boolean, JSON, Integer, ForeignKey
from sqlalchemy.orm import synonym
from app.core.database import Base
from app.models.base import BaseModelMixin, SoftDeleteMixin


class SystemSetting(Base, BaseModelMixin):
    __tablename__ = "system_settings"

    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String(255), nullable=True)
    is_encrypted = Column(Boolean, default=False, nullable=False)


class AuditLog(Base, BaseModelMixin):
    __tablename__ = "audit_logs"

    action = Column(String(100), index=True, nullable=False)
    actor_id = Column(String(100), index=True, nullable=True)
    entity_type = Column(String(100), index=True, nullable=True)
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)


class UploadedFile(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "uploaded_files"
    
    filename = Column(String(255), nullable=False) # UUID name
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    path = Column(String(500), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="Pending") # Pending, Processing, Completed, Failed
    import_summary = Column(JSON, nullable=True)
    uploaded_at = synonym("created_at")


class Notification(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "notifications"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
