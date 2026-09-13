import time
from app.core.config import settings
from app.core.database import check_db_connection
from app.schemas.health import SystemHealthResponse, DatabaseHealthStatus


class HealthService:
    @staticmethod
    def get_system_health() -> SystemHealthResponse:
        db_health = check_db_connection()
        overall_status = "ok" if db_health["connected"] else "degraded"

        return SystemHealthResponse(
            status=overall_status,
            project_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            timestamp=time.time(),
            database=DatabaseHealthStatus(
                connected=db_health["connected"],
                latency_ms=db_health["latency_ms"],
                dialect=db_health["dialect"],
                message=db_health["message"]
            )
        )
