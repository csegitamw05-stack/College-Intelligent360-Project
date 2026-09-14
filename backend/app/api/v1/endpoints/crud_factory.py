from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Type, List, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.repositories.base import BaseRepository
from app.security.dependencies import require_roles
from app.models.user import UserRole
from app.schemas.generic import PaginationSchema

def get_crud_router(
    model: Type[Any],
    create_schema: Type[BaseModel],
    update_schema: Type[BaseModel],
    response_schema: Type[BaseModel],
    prefix: str,
    tags: List[str]
) -> APIRouter:
    
    router = APIRouter(prefix=prefix, tags=tags)
    repository = BaseRepository(model)
    
    @router.get("/", response_model=PaginationSchema[response_schema])
    def read_all(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.INCHARGE, UserRole.SYSTEM_ADMIN))
    ):
        """
        Retrieve all active (non-soft-deleted) records.
        """
        query = db.query(model)
        
        # RBAC Filtering logic could go here based on current_user
        if current_user.role == UserRole.HOD and hasattr(model, 'department_id'):
            query = query.filter(model.department_id == current_user.department_id)
            
        if hasattr(model, "deleted_at"):
            query = query.filter(model.deleted_at.is_(None))
            
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        
        return {"items": items, "total": total, "skip": skip, "limit": limit}

    @router.get("/{id}", response_model=response_schema)
    def read_one(
        id: int,
        db: Session = Depends(get_db),
        current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.INCHARGE, UserRole.SYSTEM_ADMIN))
    ):
        obj = repository.get_by_id(db, id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
            
        # Optional: check RBAC scoping here
        if current_user.role == UserRole.HOD and hasattr(obj, 'department_id'):
            if obj.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="Not authorized to view this record")
                
        return obj

    @router.post("/", response_model=response_schema, status_code=201)
    def create(
        item_in: create_schema,
        db: Session = Depends(get_db),
        current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.SYSTEM_ADMIN))
    ):
        return repository.create(db, item_in.model_dump())

    @router.put("/{id}", response_model=response_schema)
    def update(
        id: int,
        item_in: update_schema,
        db: Session = Depends(get_db),
        current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.SYSTEM_ADMIN))
    ):
        obj = repository.get_by_id(db, id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
            
        if current_user.role == UserRole.HOD and hasattr(obj, 'department_id'):
            if obj.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="Not authorized to update this record")

        return repository.update(db, obj, item_in.model_dump(exclude_unset=True))

    @router.delete("/{id}", status_code=204)
    def delete(
        id: int,
        reason: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN))
    ):
        """
        Soft deletes the record. Only PRINCIPAL has generic delete authority.
        """
        obj = repository.get_by_id(db, id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
            
        repository.remove(db, id, user_id=current_user.id, reason=reason)
        return None

    return router
