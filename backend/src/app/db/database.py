from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Determine if we're using PostgreSQL or SQLite
use_postgresql = settings.DATABASE_URL is not None

if use_postgresql:
    # PostgreSQL configuration
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=settings.DEBUG,
    )
    logger.info("Using PostgreSQL database")
else:
    # SQLite configuration for development
    engine = create_engine(
        settings.SQLITE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG,
    )
    logger.info("Using SQLite database (development mode)")

# Create SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create Base class for models
Base = declarative_base()


# Dependency to get DB session
def get_db():
    """
    Dependency that creates a database session and ensures it's properly closed.
    Use this in FastAPI route dependencies.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


# Database connection utilities
def create_database():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def drop_database():
    """Drop all database tables"""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping database tables: {e}")
        raise


def get_db_info():
    """Get database connection information"""
    return {
        "database_type": "PostgreSQL" if use_postgresql else "SQLite",
        "database_url": settings.database_url if not use_postgresql else "PostgreSQL connection",
        "engine_info": str(engine.url),
        "pool_size": engine.pool.size() if hasattr(engine.pool, 'size') else "N/A",
    }


# Health check for database
def check_db_health():
    """Check if database connection is healthy"""
    try:
        db = SessionLocal()
        # Try to execute a simple query
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False