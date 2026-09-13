from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.base import BaseModelMixin, SoftDeleteMixin

class RiskScore(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "risk_scores"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False) # e.g. High, Medium, Low
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    factors = Column(JSON, nullable=True) # Explanation of the risk
    
    student = relationship("Student")


class PredictionResult(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "prediction_results"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    target_metric = Column(String(100), nullable=False) # e.g. "Final CGPA", "Dropout Probability"
    predicted_value = Column(Float, nullable=False)
    confidence = Column(Float, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    student = relationship("Student")


class Recommendation(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "recommendations"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(100), nullable=False) # e.g. "Academic Support", "Attendance Warning"
    description = Column(String(500), nullable=False)
    priority = Column(String(50), nullable=False) # High, Medium, Low
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    student = relationship("Student")
