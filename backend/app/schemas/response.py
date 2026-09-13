from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    status: str = "success"
    message: str = "Operation completed successfully"
    data: Optional[T] = None
