from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserCreate(BaseModel):
    """Used only by the secure seed/admin CLI — never exposed via API."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    role: UserRole
    department: str | None = None
    password: str = Field(..., min_length=10, max_length=128)


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    department: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}
