"""
Intelligence API Endpoints for Campus Intelligence 360.
Provides Early Warning Risk Metrics, Digital Twin State, What-If Simulator,
and Scikit-Learn ML Predictions with SHAP Explainability.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.analytics.intelligence_engine import IntelligenceEngine
from app.ml.ml_pipeline import MLEarlyWarningEngine
from app.models.intelligence import RiskScore
from app.models.people import Student
from app.models.user import UserRole
from app.security.dependencies import require_roles

router = APIRouter(prefix="/intelligence", tags=["AI Intelligence & Digital Twin"])


@router.get("/digital-twin", summary="Get Campus / Department Digital Twin State")
def get_digital_twin_state(
    department: Optional[str] = Query(None, description="Department Code e.g. CSE, ECE"),
    db: Session = Depends(get_db)
):
    """Returns dynamic Digital Twin health index, attendance, performance, and risk metrics."""
    return IntelligenceEngine.get_digital_twin_overview(db, department_code=department)


@router.get("/risk-scores", summary="Get Early Warning At-Risk Student Matrix")
def get_risk_matrix(
    risk_level: Optional[str] = Query(None, description="High, Medium, Low"),
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns list of student early warning risk scores with factor explanations."""
    query = db.query(RiskScore, Student).join(Student, RiskScore.student_id == Student.id).filter(Student.is_deleted == False)

    if risk_level:
        query = query.filter(RiskScore.risk_level == risk_level)
    if department_id:
        query = query.filter(Student.department_id == department_id)

    results = query.all()
    matrix = []
    for rs, st in results:
        matrix.append({
            "student_id": st.id,
            "enrollment_number": st.enrollment_number,
            "name": st.name,
            "email": st.email,
            "department": st.department.name if st.department else "N/A",
            "department_code": st.department.code if st.department else "N/A",
            "batch": st.batch,
            "score": rs.score,
            "risk_level": rs.risk_level,
            "factors": rs.factors,
            "calculated_at": rs.calculated_at.isoformat() if rs.calculated_at else None
        })

    return {
        "count": len(matrix),
        "risk_scores": matrix
    }


@router.get("/ml-risk-profiles", summary="Get Machine Learning AI Early Warning Risk Profiles with SHAP Explainability")
def get_ml_risk_profiles(
    risk_level: Optional[str] = Query(None, description="NORMAL, WATCH, INTERVENTION_REQUIRED, CRITICAL"),
    db: Session = Depends(get_db)
):
    """
    Returns student risk predictions computed via Scikit-Learn ML pipeline.
    Includes 4 risk levels (NORMAL, WATCH, INTERVENTION_REQUIRED, CRITICAL),
    trend, SHAP factor contributions, and recommended actions.
    """
    students = db.query(Student).filter(Student.is_deleted == False).all()
    profiles = []

    for st in students:
        prof = MLEarlyWarningEngine.predict_student_risk(db, st.id)
        if risk_level and prof.get("risk_level") != risk_level:
            continue
        profiles.append(prof)

    # Count breakdown
    counts = {
        "CRITICAL": len([p for p in profiles if p.get("risk_level") == "CRITICAL"]),
        "INTERVENTION_REQUIRED": len([p for p in profiles if p.get("risk_level") == "INTERVENTION_REQUIRED"]),
        "WATCH": len([p for p in profiles if p.get("risk_level") == "WATCH"]),
        "NORMAL": len([p for p in profiles if p.get("risk_level") == "NORMAL"])
    }

    meta = MLEarlyWarningEngine.get_model_metadata()

    return {
        "total_students_analyzed": len(students),
        "counts_by_risk_level": counts,
        "active_model_info": meta if meta else {"status": "Deterministic Statistical Indicator (Train ML model to activate v1.0.0)"},
        "profiles": profiles
    }


@router.post("/train-ml-model", summary="Train ML Early Warning Model on Actual DB Records")
def train_ml_model(db: Session = Depends(get_db)):
    """Triggers ML training pipeline on real SQL database records with data sufficiency safeguard."""
    res = MLEarlyWarningEngine.train_model(db)
    return res


@router.get("/ml-model-info", summary="Get Active ML Model Version & Evaluation Metrics")
def get_ml_model_info():
    """Returns active model metadata, accuracy, F1 score, feature set, and training date."""
    meta = MLEarlyWarningEngine.get_model_metadata()
    if not meta:
        return {
            "model_active": False,
            "message": "No custom ML model trained yet. System is operating on verified deterministic statistical indicators."
        }
    return {"model_active": True, "metadata": meta}


@router.post("/recalculate-risk/{student_id}", summary="Recalculate Early Warning Risk Score for a Student")
def recalculate_risk(student_id: int, db: Session = Depends(get_db)):
    """Triggers real-time intelligence calculation for a specific student."""
    res = IntelligenceEngine.calculate_student_risk(db, student_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/simulator", summary="Interactive What-If Policy Simulator")
def run_policy_simulator(
    attendance_threshold: float = Body(75.0, embed=True),
    cgpa_threshold: float = Body(6.0, embed=True),
    db: Session = Depends(get_db)
):
    """Simulates how changing attendance/CGPA policy standards affects student risk counts across campus."""
    return IntelligenceEngine.simulate_what_if(db, attendance_threshold, cgpa_threshold)
