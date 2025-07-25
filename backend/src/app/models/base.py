from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from datetime import datetime
from typing import Optional, List
import enum

from app.db.base import BaseModel


# Enums for various statuses
class QualityStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    BLOCKED = "blocked"
    QUARANTINE = "quarantine"
    RELEASED = "released"


class OrderStatus(str, enum.Enum):
    NEW = "new"
    PLANNED = "planned"
    IN_PRODUCTION = "in_production"
    COMPLETED = "completed"
    SHIPPED = "shipped"
    CANCELLED = "cancelled"


class OrderPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class POStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    CONFIRMED = "confirmed"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class MaterialType(str, enum.Enum):
    GRANULATE_LDPE = "granulate_ldpe"
    GRANULATE_HDPE = "granulate_hdpe"
    GRANULATE_PP = "granulate_pp"
    INK_PRINTING = "ink_printing"
    ADHESIVE_PU = "adhesive_pu"
    ADHESIVE_ACRYLIC = "adhesive_acrylic"
    FILM_BASE_BOPP = "film_base_bopp"
    FILM_BASE_PET = "film_base_pet"
    SOLVENT = "solvent"
    ADDITIVE = "additive"


class WarehouseType(str, enum.Enum):
    RAW_MATERIALS = "raw_materials"
    ADR = "adr"
    PRODUCTION = "production"
    FINISHED_GOODS = "finished_goods"


class ProductionLineStatus(str, enum.Enum):
    IDLE = "idle"
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    ERROR = "error"