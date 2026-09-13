from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, dashboard, files, crud_factory, intelligence, modules, assistant, reports, system
from app.models.org import Department
from app.models.people import Student
from app.schemas.generic import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse,
    StudentCreate, StudentUpdate, StudentResponse
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["System & Health"])
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)

# AI Assistant Route
api_router.include_router(assistant.router)

# Reports Route
api_router.include_router(reports.router)

# System & Audit Logs Route
api_router.include_router(system.router)

# Intelligence & Digital Twin Routes
api_router.include_router(intelligence.router)

# 9 Domain Data Modules Routes
api_router.include_router(modules.router)

# Data Ingestion Route
api_router.include_router(files.router, prefix="/files", tags=["Data Import"])

# Auto-Generated CRUD Routes
departments_router = crud_factory.get_crud_router(
    model=Department,
    create_schema=DepartmentCreate,
    update_schema=DepartmentUpdate,
    response_schema=DepartmentResponse,
    prefix="/departments",
    tags=["Departments"]
)
api_router.include_router(departments_router)

students_router = crud_factory.get_crud_router(
    model=Student,
    create_schema=StudentCreate,
    update_schema=StudentUpdate,
    response_schema=StudentResponse,
    prefix="/students",
    tags=["Students"]
)
api_router.include_router(students_router)
