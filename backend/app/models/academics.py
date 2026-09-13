from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModelMixin, SoftDeleteMixin

class Attendance(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "attendance"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(String(20), nullable=False) # e.g., Present, Absent, Late
    recorded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    student = relationship("Student")
    subject = relationship("Subject")


class AcademicPerformance(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "academic_performance"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    semester = Column(Integer, nullable=False)
    cgpa = Column(Float, nullable=True)
    sgpa = Column(Float, nullable=True)
    total_credits = Column(Integer, nullable=True)
    
    student = relationship("Student")


class Assessment(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "assessments"
    
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    date = Column(Date, nullable=False)
    max_marks = Column(Float, nullable=False)
    weightage = Column(Float, nullable=False)
    
    subject = relationship("Subject")


class Assignment(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "assignments"
    
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    given_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    max_marks = Column(Float, nullable=False)
    
    subject = relationship("Subject")


class Lab(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "labs"
    
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    location = Column(String(150), nullable=True)
    capacity = Column(Integer, nullable=True)
    
    subject = relationship("Subject")


class LabPerformance(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "lab_performance"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    lab_id = Column(Integer, ForeignKey("labs.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    experiment_name = Column(String(200), nullable=False)
    marks = Column(Float, nullable=False)
    
    student = relationship("Student")
    lab = relationship("Lab")
