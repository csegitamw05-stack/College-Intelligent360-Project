from pydantic import BaseModel, ConfigDict
from typing import Optional, Generic, TypeVar, List
from datetime import datetime

T = TypeVar('T')

class PaginationSchema(BaseModel, Generic[T]):
    items: List[T]
    total: int
    skip: int
    limit: int

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class SoftDeleteSchema(BaseSchema):
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[int] = None
    deletion_reason: Optional[str] = None

# Specific standard schemas
class DepartmentBase(BaseSchema):
    name: str
    code: str
    head_id: Optional[int] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseSchema):
    name: Optional[str] = None
    code: Optional[str] = None
    head_id: Optional[int] = None

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime


class StudentBase(BaseSchema):
    enrollment_number: str
    name: str
    email: Optional[str] = None
    department_id: int
    section_id: Optional[int] = None
    batch: str
    status: str = "Active"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseSchema):
    name: Optional[str] = None
    email: Optional[str] = None
    department_id: Optional[int] = None
    section_id: Optional[int] = None
    batch: Optional[str] = None
    status: Optional[str] = None

class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
