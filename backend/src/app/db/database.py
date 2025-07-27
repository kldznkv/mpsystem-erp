from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool, StaticPool
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def create_database_engine():
    """Create database engine with appropriate configuration for the database type"""
    
    database_url = settings.DATABASE_URL
    connect_args = settings.DATABASE_CONNECT_ARGS.copy()
    
    if database_url.startswith("postgresql"):
        # PostgreSQL Production Configuration
        logger.info("🐘 Configuring PostgreSQL connection")
        
        engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            pool_timeout=settings.DB_POOL_TIMEOUT,
            pool_pre_ping=True,  # Validate connections before use
            pool_recycle=300,    # Recycle connections every 5 minutes
            connect_args=connect_args,
            echo=settings.DEBUG,
            echo_pool=settings.DEBUG
        )
        
        # PostgreSQL specific event listeners
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            # This is for PostgreSQL, no pragmas needed
            pass
            
    elif database_url.startswith("sqlite"):
        # SQLite Development Configuration
        logger.info("🗃️ Configuring SQLite connection")
        
        engine = create_engine(
            database_url,
            poolclass=StaticPool,
            connect_args=connect_args,
            echo=settings.DEBUG
        )
        
        # SQLite specific event listeners
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")  # Better concurrency
            cursor.close()
            
    else:
        # Fallback configuration
        logger.warning(f"⚠️ Unknown database type, using default configuration")
        engine = create_engine(
            database_url,
            connect_args=connect_args,
            echo=settings.DEBUG
        )
    
    return engine

# Create the engine
engine = create_database_engine()

# Create SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session():
    """Get database session (generator for dependency injection)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Alias for compatibility with endpoints
def get_db():
    """Get database session (alias for get_session)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_database():
    """Create all database tables"""
    # Import Base and all models here to avoid circular imports
    from app.db.base import Base
    
    # Import all models to register them with SQLAlchemy
    from app.models.orders import Order  # noqa: F401
    from app.models.warehouse import (  # noqa: F401
        Warehouse, Supplier, Material, Batch, InventoryItem, StockMovement
    )
    from app.models.production import (  # noqa: F401
        Customer, Product, BOM, BOMLine, ProductionOrder, ProductionOrderLine, ProductionLine, ProductionJob
    )
    from app.models.procurement import (  # noqa: F401
        PurchaseOrder, PurchaseOrderLine, MRPRequirement, SupplierContract, ContractPricing
    )
    
    try:
        Base.metadata.create_all(bind=engine)
        
        if settings.DATABASE_URL.startswith("postgresql"):
            logger.info("✅ PostgreSQL database tables created")
        else:
            logger.info("✅ SQLite database tables created")
            
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")
        raise

def test_database_connection():
    """Test database connection"""
    try:
        with SessionLocal() as session:
            session.execute("SELECT 1")
        logger.info("✅ Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection test failed: {e}")
        return False
