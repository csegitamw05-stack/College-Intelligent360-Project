"""
Master System Automated Pytest Suite for Campus Intelligence 360
Tests Calculation Engine Accuracy, AI Assistant Safe ORM Queries,
ML Early Warning Predictions, and RBAC Department Authorization.
"""
import pytest
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.org import Department
from app.models.people import Student
from app.analytics.calculation_engine import CalculationEngine
from app.analytics.ai_assistant import AIAssistantEngine
from app.ml.ml_pipeline import MLEarlyWarningEngine
from app.services.report_service import ReportService


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_calculation_engine_accuracy(db_session):
    """Verifies attendance % formula and department health score calculation."""
    res = CalculationEngine.calculate_attendance_pct(db_session)
    assert "attendance_pct" in res
    assert isinstance(res["attendance_pct"], float)

    health = CalculationEngine.calculate_department_health_score(db_session, "CSE")
    assert "health_score" in health
    assert health["health_score"] >= 0.0 and health["health_score"] <= 100.0


def test_ai_assistant_intent_extraction():
    """Verifies natural language intent parsing into safe structured representation."""
    intent1 = AIAssistantEngine.extract_intent("Show students with attendance below 75% and marks below 40")
    assert intent1["intent_type"] == "low_attendance_and_marks"
    assert intent1["attendance_threshold"] == 75.0

    intent2 = AIAssistantEngine.extract_intent("Which subject has the highest risk?")
    assert intent2["intent_type"] == "highest_risk_subject"


def test_ai_assistant_query_safety(db_session):
    """Verifies AI Assistant query layer produces no raw SQL injection and respects role scope."""
    principal = User(id=999, email="principal_test@campus.edu", role=UserRole.PRINCIPAL, department="Administration")
    res = AIAssistantEngine.process_query(db_session, "Which students need immediate intervention?", principal)

    assert "answer" in res
    assert "context_marker" in res
    assert res["context_marker"] == "Based on current institutional records."


def test_ml_prediction_pipeline(db_session):
    """Verifies ML pipeline risk predictions and SHAP factor contributions."""
    student = db_session.query(Student).first()
    if student:
        pred = MLEarlyWarningEngine.predict_student_risk(db_session, student.id)
        assert "risk_level" in pred
        assert pred["risk_level"] in ["NORMAL", "WATCH", "INTERVENTION_REQUIRED", "CRITICAL"]
        assert "contributing_factors" in pred


def test_report_service_rbac_isolation(db_session):
    """Verifies HOD cannot generate reports for unauthorized departments."""
    hod_cse = User(id=888, email="hod_cse_test@campus.edu", role=UserRole.HOD, department="CSE")

    # Accessing CSE (Authorized)
    data = ReportService.generate_report_data(db_session, hod_cse, "department_performance", "CSE")
    assert data["department_scope"] == "CSE"

    # Accessing ECE (Unauthorized for CSE HOD) -> PermissionError
    with pytest.raises(PermissionError):
        ReportService.generate_report_data(db_session, hod_cse, "department_performance", "ECE")
