"""
Models package - imports all models so SQLAlchemy Base metadata registers every table.
"""
from app.core.database import Base
from app.models.user import User, UserRole
from app.models.auth import RefreshToken
from app.models.org import Department, Section, Subject
from app.models.people import Student, Faculty
from app.models.academics import Attendance, AcademicPerformance, Assessment, Assignment, Lab, LabPerformance
from app.models.activities import StudentEngagement, FacultyActivity, Event, Placement, Research
from app.models.intelligence import RiskScore, PredictionResult, Recommendation
from app.models.system import SystemSetting, AuditLog, UploadedFile, Notification

__all__ = [
    "Base",
    "User", "UserRole",
    "RefreshToken",
    "Department", "Section", "Subject",
    "Student", "Faculty",
    "Attendance", "AcademicPerformance", "Assessment", "Assignment", "Lab", "LabPerformance",
    "StudentEngagement", "FacultyActivity", "Event", "Placement", "Research",
    "RiskScore", "PredictionResult", "Recommendation",
    "SystemSetting", "AuditLog", "UploadedFile", "Notification"
]
