from typing import Generator
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

db_url = settings.get_database_url()

# Configure SQLAlchemy Engine
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_size": 10,
    "max_overflow": 20,
}

if db_url.startswith("sqlite"):
    engine_kwargs = {"connect_args": {"check_same_thread": False}}

engine = create_engine(db_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """
    Checks real-time connection to the database.
    Returns status dict with latency, database type, and operational status.
    """
    start_time = time.time()
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
            latency_ms = round((time.time() - start_time) * 1000, 2)
            
            db_engine_name = engine.dialect.name
            return {
                "connected": True,
                "latency_ms": latency_ms,
                "dialect": db_engine_name,
                "message": f"Successfully connected to {db_engine_name} database."
            }
    except Exception as exc:
        latency_ms = round((time.time() - start_time) * 1000, 2)
        logger.warning(f"Database connection check failed: {str(exc)}")
        return {
            "connected": False,
            "latency_ms": latency_ms,
            "dialect": engine.dialect.name if hasattr(engine, 'dialect') else "unknown",
            "message": f"Database unreachable: {str(exc)}"
        }
