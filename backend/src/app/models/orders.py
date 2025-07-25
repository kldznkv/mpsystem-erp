from sqlalchemy import Column, String, Float, Integer, Text, DateTime, Date, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
import enum

from app.db.database import Base


class OrderPriority(str, enum.Enum):
    """Order priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class OrderStatus(str, enum.Enum):
    """Order status workflow"""
    NEW = "new"
    CONFIRMED = "confirmed"
    PLANNED = "planned"
    IN_PRODUCTION = "in_production"
    COMPLETED = "completed"
    SHIPPED = "shipped"


class OrderUnit(str, enum.Enum):
    """Units of measurement"""
    PCS = "pcs"      # pieces
    KG = "kg"        # kilograms
    M2 = "m2"        # square meters
    M = "m"          # meters
    L = "l"          # liters
    TON = "ton"      # tons


class Order(Base):
    """
    Order model for MPSYSTEM
    
    Represents customer orders with full lifecycle tracking
    from creation to shipment.
    """
    __tablename__ = "orders"

    # Primary identifier
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment="Unique order identifier"
    )
    
    # Order identification
    number = Column(
        String(50), 
        unique=True, 
        nullable=False,
        index=True,
        comment="Order number in format ZP-YYYY/NNNN"
    )
    
    # Client information
    client_id = Column(
        String(50), 
        nullable=False,
        index=True,
        comment="Client identifier"
    )
    client_name = Column(
        String(255), 
        nullable=False,
        comment="Client company name"
    )
    
    # Product information
    product_id = Column(
        String(50), 
        nullable=False,
        index=True,
        comment="Product/material identifier"
    )
    product_name = Column(
        String(255), 
        nullable=False,
        comment="Product/material name"
    )
    
    # Quantity and units
    quantity = Column(
        Float, 
        nullable=False,
        comment="Ordered quantity"
    )
    unit = Column(
        SQLEnum(OrderUnit), 
        nullable=False,
        comment="Unit of measurement"
    )
    
    # Dates and scheduling
    due_date = Column(
        Date, 
        nullable=False,
        index=True,
        comment="Required delivery date"
    )
    
    # Order management
    priority = Column(
        SQLEnum(OrderPriority), 
        nullable=False, 
        default=OrderPriority.NORMAL,
        index=True,
        comment="Order priority level"
    )
    status = Column(
        SQLEnum(OrderStatus), 
        nullable=False, 
        default=OrderStatus.NEW,
        index=True,
        comment="Current order status"
    )
    
    # Financial information
    value = Column(
        Float, 
        nullable=True,
        comment="Total order value in currency"
    )
    margin = Column(
        Float, 
        nullable=True,
        comment="Margin percentage (0-100)"
    )
    
    # Progress tracking
    progress = Column(
        Integer, 
        nullable=False, 
        default=0,
        comment="Production progress percentage (0-100)"
    )
    
    # Additional information
    special_requirements = Column(
        Text, 
        nullable=True,
        comment="Special requirements or notes"
    )
    
    # Audit fields
    created_by = Column(
        String(100), 
        nullable=False,
        comment="User who created the order"
    )
    created_at = Column(
        DateTime, 
        nullable=False, 
        default=datetime.utcnow,
        comment="Order creation timestamp"
    )
    updated_at = Column(
        DateTime, 
        nullable=False, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow,
        comment="Last update timestamp"
    )
    
    # Additional computed fields for business logic
    @property
    def is_overdue(self) -> bool:
        """Check if order is overdue"""
        return self.due_date < date.today() and self.status not in [OrderStatus.COMPLETED, OrderStatus.SHIPPED]
    
    @property
    def days_until_due(self) -> int:
        """Calculate days until due date"""
        return (self.due_date - date.today()).days
    
    @property
    def is_urgent_priority(self) -> bool:
        """Check if order has urgent priority"""
        return self.priority == OrderPriority.URGENT
    
    @property
    def status_display(self) -> str:
        """Human-readable status"""
        status_map = {
            OrderStatus.NEW: "Новый",
            OrderStatus.CONFIRMED: "Подтвержден",
            OrderStatus.PLANNED: "Запланирован",
            OrderStatus.IN_PRODUCTION: "В производстве",
            OrderStatus.COMPLETED: "Завершен",
            OrderStatus.SHIPPED: "Отгружен"
        }
        return status_map.get(self.status, self.status.value)
    
    @property
    def priority_display(self) -> str:
        """Human-readable priority"""
        priority_map = {
            OrderPriority.LOW: "Низкий",
            OrderPriority.NORMAL: "Обычный",
            OrderPriority.HIGH: "Высокий",
            OrderPriority.URGENT: "Срочный"
        }
        return priority_map.get(self.priority, self.priority.value)
    
    def __repr__(self):
        return f"<Order(number='{self.number}', client='{self.client_name}', status='{self.status}')>"
    
    def __str__(self):
        return f"Заказ {self.number} - {self.client_name} ({self.status_display})"


# Future relationships (commented for now, will be uncommented when related models are created)
"""
class OrderItem(Base):
    Order items/materials for production planning
    __tablename__ = "order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    material_id = Column(String(50), nullable=False)  # ForeignKey to materials table
    quantity_required = Column(Float, nullable=False)
    quantity_reserved = Column(Float, default=0)
    unit = Column(SQLEnum(OrderUnit), nullable=False)
    
    # Relationship
    order = relationship("Order", back_populates="items")

# Add to Order model:
# items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
"""