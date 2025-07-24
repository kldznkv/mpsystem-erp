from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from datetime import datetime
from typing import Optional, List

from app.db.base import BaseModel
from app.models.base import POStatus


class PurchaseOrder(BaseModel):
    """Purchase orders to suppliers"""
    __tablename__ = "purchase_orders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    po_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    
    # Order details
    order_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    requested_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    confirmed_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Status tracking
    status: Mapped[POStatus] = mapped_column(SQLEnum(POStatus), default=POStatus.DRAFT)
    
    # Financial
    total_amount: Mapped[Optional[float]] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    payment_terms: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Delivery terms
    delivery_terms: Mapped[Optional[str]] = mapped_column(String(100))  # DAP, FCA, etc.
    delivery_address: Mapped[Optional[str]] = mapped_column(Text)
    
    # Notes and comments
    notes: Mapped[Optional[str]] = mapped_column(Text)
    internal_notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # User who created the order
    created_by: Mapped[Optional[str]] = mapped_column(String(50))
    approved_by: Mapped[Optional[str]] = mapped_column(String(50))
    approved_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Relationships
    supplier: Mapped["Supplier"] = relationship(back_populates="purchase_orders")
    line_items: Mapped[List["PurchaseOrderLine"]] = relationship(back_populates="purchase_order", cascade="all, delete-orphan")


class PurchaseOrderLine(BaseModel):
    """Individual line items in purchase orders"""
    __tablename__ = "purchase_order_lines"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    purchase_order_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.id"), nullable=False)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False)
    
    line_number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Quantities
    quantity_ordered: Mapped[float] = mapped_column(Float, nullable=False)
    quantity_received: Mapped[float] = mapped_column(Float, default=0.0)
    quantity_remaining: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Pricing
    unit_price: Mapped[Optional[float]] = mapped_column(Float)
    total_price: Mapped[Optional[float]] = mapped_column(Float)
    
    # Delivery
    requested_delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Quality requirements
    quality_requirements: Mapped[Optional[str]] = mapped_column(Text)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="line_items")
    material: Mapped["Material"] = relationship()


class MRPRequirement(BaseModel):
    """Material Requirements Planning - automatic requirements generation"""
    __tablename__ = "mrp_requirements"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False)
    
    # Requirement details
    required_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    current_stock: Mapped[float] = mapped_column(Float, nullable=False)
    quantity_to_order: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Dates
    requirement_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Priority
    priority: Mapped[str] = mapped_column(String(20), nullable=False)  # critical, high, medium, low
    
    # Source of requirement
    source_type: Mapped[str] = mapped_column(String(50))  # PRODUCTION_ORDER, MIN_STOCK, FORECAST
    source_reference: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Status
    is_fulfilled: Mapped[bool] = mapped_column(Boolean, default=False)
    purchase_order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("purchase_orders.id"))
    
    # MRP calculation details
    safety_stock: Mapped[Optional[float]] = mapped_column(Float)
    lead_time_days: Mapped[Optional[int]] = mapped_column(Integer)
    
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    material: Mapped["Material"] = relationship()
    purchase_order: Mapped[Optional["PurchaseOrder"]] = relationship()


class SupplierContract(BaseModel):
    """Supplier contracts and pricing agreements"""
    __tablename__ = "supplier_contracts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    contract_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    
    # Contract periods
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Contract details
    contract_type: Mapped[str] = mapped_column(String(50))  # FRAME, SPOT, LONG_TERM
    payment_terms: Mapped[Optional[str]] = mapped_column(String(100))
    delivery_terms: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Financial
    total_value: Mapped[Optional[float]] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Document management
    contract_file_path: Mapped[Optional[str]] = mapped_column(String(500))
    
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    supplier: Mapped["Supplier"] = relationship()
    pricing_items: Mapped[List["ContractPricing"]] = relationship(back_populates="contract", cascade="all, delete-orphan")


class ContractPricing(BaseModel):
    """Pricing details within supplier contracts"""
    __tablename__ = "contract_pricing"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("supplier_contracts.id"), nullable=False)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False)
    
    # Pricing
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    
    # Validity
    valid_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    valid_to: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Minimum order quantities
    moq: Mapped[Optional[float]] = mapped_column(Float)  # Minimum Order Quantity
    moq_unit: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Discounts and escalations
    volume_discounts: Mapped[Optional[str]] = mapped_column(Text)  # JSON or text description
    price_escalation: Mapped[Optional[str]] = mapped_column(Text)
    
    # Lead times
    standard_lead_time_days: Mapped[Optional[int]] = mapped_column(Integer)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    contract: Mapped["SupplierContract"] = relationship(back_populates="pricing_items")
    material: Mapped["Material"] = relationship()


# Import to avoid circular imports
from app.models.warehouse import Supplier, Material