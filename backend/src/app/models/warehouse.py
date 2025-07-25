from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from datetime import datetime
from typing import Optional, List

from app.db.base import BaseModel
from app.models.base import QualityStatus, MaterialType, WarehouseType


class Warehouse(BaseModel):
    """Warehouse locations (MAG-1, MAG-1.1, MAG-2, etc.)"""
    __tablename__ = "warehouses"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # MAG-1, MAG-1.1
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[WarehouseType] = mapped_column(SQLEnum(WarehouseType), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    inventory_items: Mapped[List["InventoryItem"]] = relationship(back_populates="warehouse", cascade="all, delete-orphan")


class Supplier(BaseModel):
    """Supplier information"""
    __tablename__ = "suppliers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_person: Mapped[Optional[str]] = mapped_column(String(100))
    email: Mapped[Optional[str]] = mapped_column(String(100))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    address: Mapped[Optional[str]] = mapped_column(Text)
    
    # Supplier evaluation metrics
    rating_delivery: Mapped[Optional[float]] = mapped_column(Float)  # Delivery timeliness (40%)
    rating_quality: Mapped[Optional[float]] = mapped_column(Float)   # Quality compliance (30%)
    rating_documents: Mapped[Optional[float]] = mapped_column(Float) # Document completeness (20%)
    rating_cooperation: Mapped[Optional[float]] = mapped_column(Float) # Cooperation flexibility (10%)
    overall_rating: Mapped[Optional[float]] = mapped_column(Float)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    materials: Mapped[List["Material"]] = relationship(back_populates="primary_supplier")
    batches: Mapped[List["Batch"]] = relationship(back_populates="supplier")
    purchase_orders: Mapped[List["PurchaseOrder"]] = relationship(back_populates="supplier")


class Material(BaseModel):
    """Materials and products catalog"""
    __tablename__ = "materials"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    type: Mapped[MaterialType] = mapped_column(SQLEnum(MaterialType), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)  # kg, m, m2, l, pcs
    
    # Inventory management
    min_stock_level: Mapped[Optional[float]] = mapped_column(Float)
    max_stock_level: Mapped[Optional[float]] = mapped_column(Float)
    reorder_point: Mapped[Optional[float]] = mapped_column(Float)
    
    # Cost information
    standard_cost: Mapped[Optional[float]] = mapped_column(Float)
    last_purchase_price: Mapped[Optional[float]] = mapped_column(Float)
    
    # Supplier information
    primary_supplier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("suppliers.id"))
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    primary_supplier: Mapped[Optional["Supplier"]] = relationship(back_populates="materials")
    batches: Mapped[List["Batch"]] = relationship(back_populates="material", cascade="all, delete-orphan")
    inventory_items: Mapped[List["InventoryItem"]] = relationship(back_populates="material", cascade="all, delete-orphan")


class Batch(BaseModel):
    """Material batches for traceability"""
    __tablename__ = "batches"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    
    # Quantities
    received_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    available_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    reserved_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Dates
    production_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    received_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Quality control
    quality_status: Mapped[QualityStatus] = mapped_column(SQLEnum(QualityStatus), default=QualityStatus.PENDING)
    quality_notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Document tracking
    has_coa: Mapped[bool] = mapped_column(Boolean, default=False)  # Certificate of Analysis
    has_tds: Mapped[bool] = mapped_column(Boolean, default=False)  # Technical Data Sheet
    has_sds: Mapped[bool] = mapped_column(Boolean, default=False)  # Safety Data Sheet
    has_doc: Mapped[bool] = mapped_column(Boolean, default=False)  # Declaration of Compliance
    has_cmr: Mapped[bool] = mapped_column(Boolean, default=False)  # CMR transport document
    
    # Relationships
    material: Mapped["Material"] = relationship(back_populates="batches")
    supplier: Mapped["Supplier"] = relationship(back_populates="batches")
    inventory_items: Mapped[List["InventoryItem"]] = relationship(back_populates="batch", cascade="all, delete-orphan")


class InventoryItem(BaseModel):
    """Current inventory levels by warehouse and batch"""
    __tablename__ = "inventory_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), nullable=False)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False)
    batch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("batches.id"))
    
    # Quantities
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    reserved_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    available_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Location
    location_code: Mapped[Optional[str]] = mapped_column(String(50))  # A1-05-02, C2-12-01
    
    # Dates
    last_movement_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Relationships
    warehouse: Mapped["Warehouse"] = relationship(back_populates="inventory_items")
    material: Mapped["Material"] = relationship(back_populates="inventory_items")
    batch: Mapped[Optional["Batch"]] = relationship(back_populates="inventory_items")


class StockMovement(BaseModel):
    """Track all stock movements for audit trail"""
    __tablename__ = "stock_movements"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_items.id"), nullable=False)
    
    movement_type: Mapped[str] = mapped_column(String(50), nullable=False)  # RECEIVE, ISSUE, TRANSFER, ADJUST
    quantity: Mapped[float] = mapped_column(Float, nullable=False)  # Can be negative for issues
    
    # Reference information
    reference_type: Mapped[Optional[str]] = mapped_column(String(50))  # PO, PRODUCTION_ORDER, ADJUSTMENT
    reference_id: Mapped[Optional[str]] = mapped_column(String(50))
    
    notes: Mapped[Optional[str]] = mapped_column(Text)
    user_id: Mapped[Optional[str]] = mapped_column(String(50))  # Who made the movement
    
    # Relationships
    inventory_item: Mapped["InventoryItem"] = relationship()


# Import from procurement models
from app.models.procurement import PurchaseOrder