from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum, JSON
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from app.db.base import BaseModel
from app.models.base import OrderStatus, OrderPriority, ProductionLineStatus

if TYPE_CHECKING:
    from app.models.warehouse import Material, Warehouse


class Customer(BaseModel):
    """Customer information"""
    __tablename__ = "customers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_person: Mapped[Optional[str]] = mapped_column(String(100))
    email: Mapped[Optional[str]] = mapped_column(String(100))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    address: Mapped[Optional[str]] = mapped_column(Text)
    
    # Customer categorization
    category: Mapped[Optional[str]] = mapped_column(String(50))  # VIP, REGULAR, NEW
    payment_terms: Mapped[Optional[str]] = mapped_column(String(100))
    credit_limit: Mapped[Optional[float]] = mapped_column(Float)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    production_orders: Mapped[List["ProductionOrder"]] = relationship(back_populates="customer")


class Product(BaseModel):
    """Product catalog and specifications"""
    __tablename__ = "products"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Product specifications
    product_type: Mapped[str] = mapped_column(String(50))  # FILM, BAG, SLEEVE
    thickness_micron: Mapped[Optional[float]] = mapped_column(Float)
    width_mm: Mapped[Optional[float]] = mapped_column(Float)
    color: Mapped[Optional[str]] = mapped_column(String(50))
    transparency: Mapped[Optional[str]] = mapped_column(String(50))  # TRANSPARENT, OPAQUE, TRANSLUCENT
    
    # Manufacturing details
    standard_unit: Mapped[str] = mapped_column(String(20), default="kg")
    standard_cost: Mapped[Optional[float]] = mapped_column(Float)
    standard_selling_price: Mapped[Optional[float]] = mapped_column(Float)
    
    # BOM reference
    bom_id: Mapped[Optional[int]] = mapped_column(ForeignKey("boms.id"))
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    bom: Mapped[Optional["BOM"]] = relationship(back_populates="products")
    production_order_lines: Mapped[List["ProductionOrderLine"]] = relationship(back_populates="product")


class BOM(BaseModel):
    """Bill of Materials - Product recipes"""
    __tablename__ = "boms"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bom_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    
    # BOM details
    base_quantity: Mapped[float] = mapped_column(Float, default=1.0)
    base_unit: Mapped[str] = mapped_column(String(20), default="kg")
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Lifecycle
    effective_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    products: Mapped[List["Product"]] = relationship(back_populates="bom")
    bom_lines: Mapped[List["BOMLine"]] = relationship(back_populates="bom", cascade="all, delete-orphan")


class BOMLine(BaseModel):
    """Individual components in Bill of Materials"""
    __tablename__ = "bom_lines"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bom_id: Mapped[int] = mapped_column(ForeignKey("boms.id"), nullable=False)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False)
    
    line_number: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Usage details
    scrap_factor: Mapped[float] = mapped_column(Float, default=0.0)  # % additional for waste
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False)
    
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    bom: Mapped["BOM"] = relationship(back_populates="bom_lines")
    material: Mapped["Material"] = relationship()


class ProductionOrder(BaseModel):
    """Production orders from customers"""
    __tablename__ = "production_orders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    
    # Order details
    order_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    requested_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    confirmed_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Status and priority
    status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), default=OrderStatus.NEW)
    priority: Mapped[OrderPriority] = mapped_column(SQLEnum(OrderPriority), default=OrderPriority.MEDIUM)
    
    # Planning
    planned_start_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    planned_completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    actual_start_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    actual_completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Financial
    total_value: Mapped[Optional[float]] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    
    # Notes
    customer_notes: Mapped[Optional[str]] = mapped_column(Text)
    internal_notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # User tracking
    created_by: Mapped[Optional[str]] = mapped_column(String(50))
    assigned_planner: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Relationships
    customer: Mapped["Customer"] = relationship(back_populates="production_orders")
    order_lines: Mapped[List["ProductionOrderLine"]] = relationship(back_populates="production_order", cascade="all, delete-orphan")
    production_jobs: Mapped[List["ProductionJob"]] = relationship(back_populates="production_order", cascade="all, delete-orphan")


class ProductionOrderLine(BaseModel):
    """Individual products in production orders"""
    __tablename__ = "production_order_lines"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    production_order_id: Mapped[int] = mapped_column(ForeignKey("production_orders.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    
    line_number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Quantities
    quantity_ordered: Mapped[float] = mapped_column(Float, nullable=False)
    quantity_produced: Mapped[float] = mapped_column(Float, default=0.0)
    quantity_remaining: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Pricing
    unit_price: Mapped[Optional[float]] = mapped_column(Float)
    total_price: Mapped[Optional[float]] = mapped_column(Float)
    
    # Delivery
    requested_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Product specifications (can override product defaults)
    product_specs: Mapped[Optional[str]] = mapped_column(JSON)  # JSON with custom specs
    
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    production_order: Mapped["ProductionOrder"] = relationship(back_populates="order_lines")
    product: Mapped["Product"] = relationship(back_populates="production_order_lines")


class ProductionLine(BaseModel):
    """Production lines and equipment"""
    __tablename__ = "production_lines"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Line capabilities
    line_type: Mapped[str] = mapped_column(String(50))  # EXTRUDER, PRINTER, LAMINATOR, etc.
    warehouse_id: Mapped[Optional[int]] = mapped_column(ForeignKey("warehouses.id"))  # Associated warehouse
    
    # Technical specifications
    max_width_mm: Mapped[Optional[float]] = mapped_column(Float)
    min_width_mm: Mapped[Optional[float]] = mapped_column(Float)
    max_speed_mpm: Mapped[Optional[float]] = mapped_column(Float)  # meters per minute
    
    # Operational
    status: Mapped[ProductionLineStatus] = mapped_column(SQLEnum(ProductionLineStatus), default=ProductionLineStatus.IDLE)
    current_efficiency: Mapped[Optional[float]] = mapped_column(Float)  # Current efficiency %
    standard_efficiency: Mapped[Optional[float]] = mapped_column(Float, default=85.0)  # Standard efficiency %
    
    # Maintenance
    last_maintenance_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    next_maintenance_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    warehouse: Mapped[Optional["Warehouse"]] = relationship()
    production_jobs: Mapped[List["ProductionJob"]] = relationship(back_populates="production_line")


class ProductionJob(BaseModel):
    """Specific production jobs on production lines"""
    __tablename__ = "production_jobs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    production_order_id: Mapped[int] = mapped_column(ForeignKey("production_orders.id"), nullable=False)
    production_line_id: Mapped[int] = mapped_column(ForeignKey("production_lines.id"), nullable=False)
    
    # Job scheduling
    scheduled_start_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    scheduled_end_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    actual_start_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    actual_end_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Progress tracking
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED")  # SCHEDULED, RUNNING, COMPLETED, CANCELLED
    progress_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Production quantities
    target_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    produced_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    waste_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Production parameters
    setup_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    run_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    changeover_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Quality and efficiency
    quality_rating: Mapped[Optional[float]] = mapped_column(Float)
    efficiency_percentage: Mapped[Optional[float]] = mapped_column(Float)
    oee_percentage: Mapped[Optional[float]] = mapped_column(Float)  # Overall Equipment Effectiveness
    
    # Operator and notes
    primary_operator: Mapped[Optional[str]] = mapped_column(String(100))
    shift: Mapped[Optional[str]] = mapped_column(String(20))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    production_order: Mapped["ProductionOrder"] = relationship(back_populates="production_jobs")
    production_line: Mapped["ProductionLine"] = relationship(back_populates="production_jobs")