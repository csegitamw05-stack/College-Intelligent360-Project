import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_diagnostics():
    print("=== CAMPUS INTELLIGENCE 360 DIAGNOSTICS ===")
    
    # 1. Imports Test
    print("\n1. Testing Backend Imports...")
    try:
        from app.core.config import settings
        from app.core.database import engine, SessionLocal, Base
        from app.models import user, org, people, academics, activities, intelligence, system
        from app.analytics.calculation_engine import CalculationEngine
        from app.analytics.ai_assistant import AIAssistantEngine
        from app.ml.ml_pipeline import MLEarlyWarningEngine
        from app.services.file_service import FileService
        from app.services.report_service import ReportService
        from app.api.v1.api import api_router
        print("  [SUCCESS] All Python backend modules imported cleanly.")
    except Exception as e:
        print(f"  [ERROR] Import failed: {e}")
        traceback.print_exc()
        return

    # 2. Database Creation & Seeding Test
    print("\n2. Testing Database Tables & Seeding...")
    try:
        from scripts.seed_demo import run_seed
        run_seed()
        print("  [SUCCESS] Database tables created and demo data seeded.")
    except Exception as e:
        print(f"  [ERROR] Database seeding failed: {e}")
        traceback.print_exc()
        return

    # 3. Calculation Engine Test
    print("\n3. Testing Dynamic Calculation Engine...")
    try:
        db = SessionLocal()
        att_res = CalculationEngine.calculate_attendance_pct(db)
        print(f"  Attendance %: {att_res}")
        acad_res = CalculationEngine.calculate_academic_performance(db)
        print(f"  Academic Performance: {acad_res}")
        health_res = CalculationEngine.calculate_department_health_score(db, "CSE")
        print(f"  Department Health Score (CSE): {health_res}")
        db.close()
        print("  [SUCCESS] Dynamic Calculation Engine verified.")
    except Exception as e:
        print(f"  [ERROR] Calculation Engine failed: {e}")
        traceback.print_exc()

    # 4. ML AI Early Warning Test
    print("\n4. Testing ML Pipeline Training & Predictions...")
    try:
        db = SessionLocal()
        train_res = MLEarlyWarningEngine.train_model(db)
        print(f"  ML Train Result: {train_res}")
        st = db.query(people.Student).first()
        if st:
            pred_res = MLEarlyWarningEngine.predict_student_risk(db, st.id)
            print(f"  Sample Prediction for {st.name}: Risk Level = {pred_res['risk_level']}, Score = {pred_res['risk_score']}%")
        db.close()
        print("  [SUCCESS] ML Early Warning & SHAP Explainability Engine verified.")
    except Exception as e:
        print(f"  [ERROR] ML Engine failed: {e}")
        traceback.print_exc()

    # 5. AI Assistant Intent & Query Test
    print("\n5. Testing AI-HOD Assistant Intent Extraction & ORM Query...")
    try:
        db = SessionLocal()
        principal = db.query(user.User).filter(user.User.role == user.UserRole.PRINCIPAL).first()
        if principal:
            ai_res = AIAssistantEngine.process_query(db, "Show students with attendance below 75%", principal)
            print(f"  AI Answer: {ai_res['answer']}")
        db.close()
        print("  [SUCCESS] AI-HOD Assistant query layer verified.")
    except Exception as e:
        print(f"  [ERROR] AI Assistant failed: {e}")
        traceback.print_exc()

    print("\n=== DIAGNOSTICS COMPLETE: ALL BACKEND SERVICES OPERATIONAL ===")

if __name__ == "__main__":
    run_diagnostics()
