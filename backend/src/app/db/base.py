from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func
from datetime import datetime
from typing import Optional


class Base(DeclarativeBase):
    """Base class for all database models"""
    pass


class TimestampMixin:
    """Mixin for adding timestamp fields to models"""
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )


class BaseModel(Base, TimestampMixin):
    """Base model with timestamps for all tables"""
    __abstract__ = True


# Import all the models, so that Base has them before being
# imported by Alembic migrations
from app.db.database import Base  # noqa

# Import all models to ensure they're registered with SQLAlchemy
from app.models.warehouse import *  # noqa
from app.models.production import *  # noqa  
from app.models.procurement import *  # noqa
from app.models.orders import Order  # noqa

# The Base class is now aware of all models and will create their tables