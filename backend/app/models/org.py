from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModelMixin, SoftDeleteMixin

class Department(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "departments"
    
    name = Column(String(150), unique=True, index=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    head_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    head = relationship("User", foreign_keys=[head_id])
    sections = relationship("Section", back_populates="department")
    subjects = relationship("Subject", back_populates="department")


class Section(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "sections"
    
    name = Column(String(50), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    
    department = relationship("Department", back_populates="sections")


class Subject(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "subjects"
    
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    credits = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    
    department = relationship("Department", back_populates="subjects")
