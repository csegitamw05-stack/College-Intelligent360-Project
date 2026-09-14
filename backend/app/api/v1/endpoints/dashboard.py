"""
Role-specific dashboard endpoints.
Authorization enforced server-side via FastAPI dependencies.
Calculates live institutional and departmental metrics dynamically from SQL tables.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.security.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.auth import UserProfile
from app.analytics.intelligence_engine import IntelligenceEngine
from app.models.people import Student, Faculty
from app.models.org import Department
from app.models.intelligence import RiskScore
from app.models.academics import Attendance

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])


@router.get(
    "/principal",
    summary="Principal Dashboard — institution-wide overview",
    response_model=dict,
)
def principal_dashboard(
    current_user: User = Depends(require_roles(UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Institution-wide access — PRINCIPAL only.
    Computes real-time campus Digital Twin metrics across all departments.
    """
    digital_twin = IntelligenceEngine.get_digital_twin_overview(db)
    
    # Departmental comparison
    departments = ["CSE", "ECE", "ME", "IT"]
    dept_stats = []
    for d_code in departments:
        d_twin = IntelligenceEngine.get_digital_twin_overview(db, department_code=d_code)
        dept_stats.append({
            "department": d_code,
            "students": d_twin["total_students"],
            "attendance": d_twin["average_attendance"],
            "cgpa": d_twin["average_cgpa"],
            "at_risk": d_twin["high_risk_students"] + d_twin["medium_risk_students"],
            "health_index": d_twin["institutional_health_index"]
        })

    return {
        "dashboard": "principal",
        "user": UserProfile.model_validate(current_user).model_dump(),
        "access_scope": "institution_wide",
        "digital_twin": digital_twin,
        "department_comparison": dept_stats,
        "modules_available": [
            "attendance", "academic_performance", "assessments",
            "student_engagement", "faculty_activities", "labs",
            "events", "placements", "research"
        ],
        "message": "Institution Digital Twin online. Live SQL telemetry active.",
    }


@router.get(
    "/hod",
    summary="HOD Dashboard — department-scoped overview",
    response_model=dict,
)
def hod_dashboard(
    current_user: User = Depends(require_roles(UserRole.HOD, UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN)),
    db: Session = Depends(get_db),
):
    """Department-scoped access — HOD only."""
    dept_code = current_user.department or "CSE"
    digital_twin = IntelligenceEngine.get_digital_twin_overview(db, department_code=dept_code)
    
    dept_obj = db.query(Department).filter(Department.code == dept_code).first()
    dept_id = dept_obj.id if dept_obj else None

    # Department faculty
    fac_query = db.query(Faculty).filter(Faculty.is_deleted == False)
    if dept_id:
        fac_query = fac_query.filter(Faculty.department_id == dept_id)
    faculties = fac_query.limit(10).all()
    fac_list = [{"id": f.id, "name": f.name, "designation": f.designation} for f in faculties]

    # Department at-risk students
    risk_query = db.query(RiskScore, Student).join(Student, RiskScore.student_id == Student.id).filter(
        RiskScore.risk_level.in_(["High", "Medium"]),
        Student.is_deleted == False
    )
    if dept_id:
        risk_query = risk_query.filter(Student.department_id == dept_id)
    at_risk = risk_query.all()
    
    risk_list = []
    for rs, st in at_risk:
        risk_list.append({
            "student_id": st.id,
            "name": st.name,
            "enrollment_number": st.enrollment_number,
            "risk_level": rs.risk_level,
            "score": rs.score,
            "factors": rs.factors
        })

    return {
        "dashboard": "hod",
        "user": UserProfile.model_validate(current_user).model_dump(),
        "access_scope": "department",
        "department": dept_code,
        "digital_twin": digital_twin,
        "faculty_members": fac_list,
        "at_risk_students": risk_list,
        "modules_available": [
            "attendance", "academic_performance", "assessments",
            "student_engagement", "faculty_activities", "labs"
        ],
        "message": f"HOD dashboard initialized for {dept_code} department.",
    }


@router.get(
    "/incharge",
    summary="Incharge Dashboard — assigned module access",
    response_model=dict,
)
def incharge_dashboard(
    current_user: User = Depends(require_roles(UserRole.INCHARGE, UserRole.HOD, UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN)),
    db: Session = Depends(get_db),
):
    """Module-scoped access — INCHARGE only."""
    dept_code = current_user.department or "CSE"
    digital_twin = IntelligenceEngine.get_digital_twin_overview(db, department_code=dept_code)

    recent_attendance = db.query(Attendance).order_by(Attendance.date.desc()).limit(10).all()
    att_logs = []
    for a in recent_attendance:
        att_logs.append({
            "id": a.id,
            "student": a.student.name if a.student else "N/A",
            "subject": a.subject.name if a.subject else "N/A",
            "status": a.status,
            "date": a.date.isoformat() if a.date else None
        })

    return {
        "dashboard": "incharge",
        "user": UserProfile.model_validate(current_user).model_dump(),
        "access_scope": "assigned_module",
        "department": dept_code,
        "digital_twin": digital_twin,
        "recent_attendance_logs": att_logs,
        "message": f"Incharge dashboard initialized for {dept_code}.",
    }
