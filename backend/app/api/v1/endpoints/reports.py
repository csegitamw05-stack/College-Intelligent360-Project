"""
Institutional Reports API Endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.report_service import ReportService
from app.security.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Institutional Reports"])


@router.get("/generate", summary="Generate Report Data Preview")
def generate_report(
    report_type: str = Query("department_performance", description="department_performance, attendance, student_risk, academic_performance, faculty_development, research, placement_readiness, institutional_intelligence"),
    department: Optional[str] = Query(None, description="Department code e.g. CSE, ECE"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generates structured report JSON preview based on real SQL records."""
    try:
        return ReportService.generate_report_data(db, current_user, report_type, department)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/export", summary="Export Report as CSV, Excel, or PDF")
def export_report(
    report_type: str = Query("department_performance"),
    export_format: str = Query("csv", description="csv, xlsx, pdf"),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Exports generated report directly as binary file download (CSV, Excel, or PDF)."""
    try:
        data = ReportService.generate_report_data(db, current_user, report_type, department)
        file_bytes, mime_type, filename = ReportService.export_report_bytes(data, export_format)

        return Response(
            content=file_bytes,
            media_type=mime_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
