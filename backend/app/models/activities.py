from sqlalchemy import Column, String, Integer, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModelMixin, SoftDeleteMixin

class StudentEngagement(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "student_engagement"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    points = Column(Integer, default=0)
    
    student = relationship("Student")


class FacultyActivity(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "faculty_activities"
    
    faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    
    faculty = relationship("Faculty")


class Event(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "events"
    
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    organizer_department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    
    department = relationship("Department")


class Placement(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "placements"
    
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(200), nullable=False)
    package = Column(String(50), nullable=True)
    date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False) # e.g. Offered, Accepted, Rejected
    
    student = relationship("Student")


class Research(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "research"
    
    faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    publication_date = Column(Date, nullable=True)
    journal = Column(String(200), nullable=True)
    status = Column(String(50), nullable=False) # e.g. Published, In Progress
    
    faculty = relationship("Faculty")
