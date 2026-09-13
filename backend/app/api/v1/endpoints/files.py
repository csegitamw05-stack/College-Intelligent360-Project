"""
Secure File Ingestion & Institutional Data Import Router
"""
import os
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Body, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.services.file_service import FileService
from app.models.system import UploadedFile
from app.models.user import UserRole
from app.security.dependencies import require_roles

router = APIRouter()


class ValidateRequest(BaseModel):
    file_id: int
    entity_type: str
    column_mapping: Dict[str, str]


class ImportRequest(BaseModel):
    file_id: int
    entity_type: str
    column_mapping: Dict[str, str]


@router.post("/upload", summary="Securely Upload Institutional Data File")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.INCHARGE, UserRole.SYSTEM_ADMIN))
):
    """
    Secure file upload supporting CSV, XLSX, XLS, PDF, DOCX, TXT, JSON, PNG, JPG, ZIP.
    Validates extension, MIME type, runs security scan, and stores file in private repository.
    """
    db_file = await FileService.process_upload(file, current_user.id, db)
    return {
        "id": db_file.id,
        "original_filename": db_file.original_filename,
        "size": db_file.size,
        "mime_type": db_file.mime_type,
        "status": db_file.status,
        "message": "File uploaded securely and passed security validation."
    }


@router.get("/list", summary="Get Uploaded Files Management List")
def list_uploaded_files(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.INCHARGE, UserRole.SYSTEM_ADMIN))
):
    """Returns list of uploaded files with metadata, status, size, and import summary."""
    files = db.query(UploadedFile).order_by(UploadedFile.uploaded_at.desc()).all()
    file_list = []
    for f in files:
        file_list.append({
            "id": f.id,
            "filename": f.filename,
            "original_filename": f.original_filename,
            "mime_type": f.mime_type,
            "size": f.size,
            "size_formatted": f"{f.size / 1024:.1f} KB" if f.size < 1024 * 1024 else f"{f.size / (1024 * 1024):.2f} MB",
            "uploaded_by": f.user.full_name if hasattr(f, 'user') and f.user else f"User #{f.uploaded_by}",
            "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
            "status": f.status,
            "import_summary": f.import_summary
        })
    return {"files": file_list, "total": len(file_list)}


@router.get("/{file_id}/preview", summary="Preview Column Structure / Content of File")
def preview_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.INCHARGE, UserRole.SYSTEM_ADMIN))
):
    """Detects structure, column headers, preview rows, or text content of uploaded file."""
    db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File record not found")

    ext = db_file.original_filename.rsplit('.', 1)[1].lower()
    try:
        preview = FileService.get_file_preview(db_file.path, ext)
        preview["file_id"] = db_file.id
        preview["original_filename"] = db_file.original_filename
        return preview
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate", summary="Validate Mapped Rows Before Import")
def validate_file_mapping(
    request: ValidateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.SYSTEM_ADMIN))
):
    """Validates rows against target entity schema, reporting valid rows, invalid rows, duplicates, and missing fields."""
    db_file = db.query(UploadedFile).filter(UploadedFile.id == request.file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File record not found")

    ext = db_file.original_filename.rsplit('.', 1)[1].lower()
    try:
        val_result = FileService.validate_mapped_rows(db_file.path, ext, request.column_mapping, request.entity_type)
        return val_result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/import", summary="Execute Import into Relational DB & Trigger Telemetry Recalculation")
def import_file_data(
    request: ImportRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.SYSTEM_ADMIN))
):
    """Executes database insertion for validated rows and triggers analytics recalculation."""
    return FileService.execute_import(db, request.file_id, request.entity_type, request.column_mapping)


@router.get("/{file_id}/download", summary="Secure Authenticated File Download")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.HOD, UserRole.INCHARGE, UserRole.SYSTEM_ADMIN))
):
    """Securely streams requested file from private storage with proper headers."""
    db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not db_file or not os.path.exists(db_file.path):
        raise HTTPException(status_code=404, detail="File not found in private repository")

    return FileResponse(
        path=db_file.path,
        filename=db_file.original_filename,
        media_type=db_file.mime_type or "application/octet-stream"
    )


@router.delete("/{file_id}/delete", summary="Delete / Soft-Delete Uploaded File")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN))
):
    """Deletes uploaded file record and removes private storage copy."""
    db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File record not found")

    if os.path.exists(db_file.path):
        try:
            os.remove(db_file.path)
        except Exception:
            pass

    db.delete(db_file)
    db.commit()

    return {"message": f"File '{db_file.original_filename}' deleted successfully."}
