import sys
sys.path.insert(0, 'backend')

from app.core.database import engine, Base
from sqlalchemy import text

tables = [
    "users", "departments", "sections", "subjects", "faculty", "students",
    "attendance", "academic_performance", "assessments", "assignments",
    "labs", "lab_performance", "student_engagement", "faculty_activities",
    "events", "placements", "research", "risk_scores", "prediction_results",
    "recommendations", "uploaded_files", "notifications"
]

with engine.connect() as conn:
    for t in tables:
        try:
            conn.execute(text(f"ALTER TABLE {t} ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;"))
            print(f"Added is_deleted to {t}")
        except Exception as e:
            print(f"Skipping {t}: {e}")
    conn.commit()

print("Schema migration complete!")
