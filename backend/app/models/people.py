from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModelMixin, SoftDeleteMixin

class Faculty(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "faculty"
    
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    designation = Column(String(100), nullable=True)
    
    user = relationship("User")
    department = relationship("Department")


class Student(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "students"
    
    enrollment_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
    batch = Column(String(20), nullable=False)
    status = Column(String(50), default="Active")
    
    department = relationship("Department")
    section = relationship("Section")
