"""
AI-HOD Assistant API Endpoint
"""
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.analytics.ai_assistant import AIAssistantEngine
from app.security.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/assistant", tags=["AI-HOD Assistant"])


class QueryRequest(BaseModel):
    question: str


@router.post("/query", summary="Execute AI-HOD Assistant Natural Language Query")
def query_assistant(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Translates natural language questions into safe ORM queries.
    Enforces role/department authorization and returns answers grounded in SQL records.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question prompt cannot be empty.")

    return AIAssistantEngine.process_query(db, request.question, current_user)
