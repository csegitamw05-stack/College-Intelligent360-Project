from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.orm import Session
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base Repository pattern implementation providing generic CRUD methods.
    """
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get_by_id(self, db: Session, id: Any, include_deleted: bool = False) -> Optional[ModelType]:
        query = db.query(self.model).filter(self.model.id == id)
        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.filter(self.model.deleted_at.is_(None))
        return query.first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100, include_deleted: bool = False) -> List[ModelType]:
        query = db.query(self.model)
        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.filter(self.model.deleted_at.is_(None))
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, id: Any, user_id: Optional[int] = None, reason: Optional[str] = None, hard_delete: bool = False) -> Optional[ModelType]:
        obj = self.get_by_id(db, id, include_deleted=True)
        if obj:
            if hasattr(self.model, "deleted_at") and not hard_delete:
                # Soft delete
                from datetime import datetime
                setattr(obj, "deleted_at", datetime.utcnow())
                if hasattr(self.model, "deleted_by") and user_id is not None:
                    setattr(obj, "deleted_by", user_id)
                if hasattr(self.model, "deletion_reason") and reason is not None:
                    setattr(obj, "deletion_reason", reason)
                db.add(obj)
            else:
                # Hard delete
                db.delete(obj)
            db.commit()
        return obj
