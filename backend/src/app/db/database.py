from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# SQLite engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Alias for compatibility with endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_database():
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
    
    Base.metadata.create_all(bind=engine)
    logger.info("SQLite database created")
