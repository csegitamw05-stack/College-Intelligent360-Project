from fastapi import APIRouter, status
from app.schemas.health import SystemHealthResponse
from app.services.health_service import HealthService

router = APIRouter()


@router.get(
    "/health",
    response_model=SystemHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System and Database Health Check",
    description="Performs real-time checks on backend core services, database connection, latency, and environment configuration."
)
def get_health() -> SystemHealthResponse:
    return HealthService.get_system_health()
