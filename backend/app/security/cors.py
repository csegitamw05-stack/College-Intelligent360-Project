from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger


def setup_cors(app: FastAPI) -> None:
    origins = settings.CORS_ORIGINS
    if isinstance(origins, str):
        origins = [origins]

    logger.info(f"Setting up CORS origins: {origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
