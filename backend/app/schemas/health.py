from pydantic import BaseModel, Field
from typing import Dict, Any


class DatabaseHealthStatus(BaseModel):
    connected: bool = Field(..., description="Whether database is reachable")
    latency_ms: float = Field(..., description="Connection ping latency in milliseconds")
    dialect: str = Field(..., description="Database engine dialect (postgresql, sqlite, etc.)")
    message: str = Field(..., description="Health status message")


class SystemHealthResponse(BaseModel):
    status: str = Field("ok", description="Overall system health status")
    project_name: str = Field(..., description="Application name")
    version: str = Field(..., description="Application version")
    environment: str = Field(..., description="Deployment environment")
    timestamp: float = Field(..., description="Current server timestamp")
    database: DatabaseHealthStatus = Field(..., description="Database connectivity breakdown")
