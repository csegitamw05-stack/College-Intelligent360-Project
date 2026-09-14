from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import register_exception_handlers
from app.security.cors import setup_cors
from app.api.v1.api import api_router

# Global limiter instance
limiter = Limiter(key_func=get_remote_address, default_limits=[])


def create_application() -> FastAPI:
    logger.info(f"Initializing {settings.PROJECT_NAME} backend v{settings.VERSION} [{settings.ENVIRONMENT}]")

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=f"{settings.SUBTITLE}\n\n{settings.TAGLINE}",
        version=settings.VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    # Attach limiter state
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # Setup CORS
    setup_cors(app)

    # Register exception handlers
    register_exception_handlers(app)

    # Register versioned API
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
    def root():
        return {
            "title": settings.PROJECT_NAME,
            "subtitle": settings.SUBTITLE,
            "tagline": settings.TAGLINE,
            "version": settings.VERSION,
            "docs": "/docs",
            "health": f"{settings.API_V1_STR}/health",
        }

    @app.get("/favicon.ico", include_in_schema=False)
    def favicon():
        from fastapi import Response
        return Response(status_code=204)

    # Auto-seed database on startup if empty
    @app.on_event("startup")
    def startup_db_seed():
        try:
            from app.core.database import SessionLocal, engine, Base
            from app.models.user import User
            from scripts.seed_demo import run_seed
            
            # Ensure tables exist first
            Base.metadata.create_all(bind=engine)
            
            db = SessionLocal()
            if db.query(User).count() == 0:
                logger.info("Database is empty. Triggering automatic demo seeding...")
                run_seed()
            db.close()
        except Exception as e:
            logger.warning(f"Startup seeding check: {e}")

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
