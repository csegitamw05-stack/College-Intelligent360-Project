"""
Audit logging service.
Wraps the existing AuditLog model for structured, searchable event logging.
Never logs passwords or tokens.
"""
from typing import Optional, Any
from sqlalchemy.orm import Session

from app.models.system import AuditLog
from app.core.logging import logger


class AuditService:

    # Action constants
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    LOGOUT = "LOGOUT"
    TOKEN_REFRESH = "TOKEN_REFRESH"
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED"

    @staticmethod
    def log(
        db: Session,
        action: str,
        actor_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        details: Optional[dict] = None,
    ) -> None:
        """
        Persist an audit event.
        Sensitive fields (passwords, tokens) must never be passed in details.
        """
        try:
            entry = AuditLog(
                action=action,
                actor_id=str(actor_id) if actor_id else None,
                entity_type=entity_type,
                entity_id=str(entity_id) if entity_id else None,
                details=details,
                ip_address=ip_address,
            )
            db.add(entry)
            db.commit()
            logger.info(f"AUDIT [{action}] actor={actor_id} ip={ip_address} details={details}")
        except Exception as exc:
            logger.error(f"Failed to write audit log: {exc}")
            db.rollback()

    @staticmethod
    def log_action(db: Session, action: str, actor_id: Optional[str] = None, ip_address: Optional[str] = None, entity_type: Optional[str] = None, entity_id: Optional[str] = None, details: Optional[dict] = None) -> None:
        """Alias for log."""
        AuditService.log(db, action, actor_id, ip_address, entity_type, entity_id, details)
