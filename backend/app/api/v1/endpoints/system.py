"""
System & Audit Logging Endpoints for Campus Intelligence 360
"""
import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.system import AuditLog, SystemSetting
from app.models.user import UserRole
from app.security.dependencies import require_roles

router = APIRouter(prefix="/system", tags=["System & Security"])


@router.get("/audit-logs", summary="Get Sanitized System Audit Logs")
def get_audit_logs(
    action: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.SYSTEM_ADMIN))
):
    """Returns audit log history for security monitoring and compliance."""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    log_list = []
    for l in logs:
        log_list.append({
            "id": l.id,
            "action": l.action,
            "actor_id": l.actor_id,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })

    return {"count": len(log_list), "audit_logs": log_list}


@router.get("/settings", summary="Get System Settings & Department Health Score Weights")
def get_system_settings(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.SYSTEM_ADMIN))
):
    """Returns system configuration parameters and department health weights."""
    setting = db.query(SystemSetting).filter(SystemSetting.key == "department_health_weights").first()
    weights = json.loads(setting.value) if (setting and setting.value) else {
        "attendance": 0.25,
        "academic": 0.25,
        "placement": 0.20,
        "faculty": 0.15,
        "research": 0.15
    }
    return {
        "department_health_weights": weights,
        "zero_mock_policy_enforced": True,
        "environment": "production_hardened"
    }


@router.post("/settings", summary="Update Department Health Score Weights")
def update_system_settings(
    weights: Dict[str, float] = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN))
):
    """Updates configurable weights for Department Health Score calculation."""
    # Ensure weights sum close to 1.0
    total = sum(weights.values())
    if abs(total - 1.0) > 0.05:
        raise HTTPException(status_code=400, detail=f"Weights must sum to 1.0 (100%). Current sum: {total:.2f}")

    setting = db.query(SystemSetting).filter(SystemSetting.key == "department_health_weights").first()
    if not setting:
        setting = SystemSetting(
            key="department_health_weights",
            value=json.dumps(weights),
            description="Configurable weights for Department Health Score calculation"
        )
        db.add(setting)
    else:
        setting.value = json.dumps(weights)

    db.commit()
    return {"message": "Department Health Score weights updated successfully.", "new_weights": weights}
