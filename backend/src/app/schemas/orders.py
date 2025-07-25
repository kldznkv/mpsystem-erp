from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

from app.models.orders import OrderPriority, OrderStatus, OrderUnit


class OrderBase(BaseModel):
    """Base Order schema with common fields"""
    
    client_id: str = Field(..., min_length=1, max_length=50, description="Client identifier")
    client_name: str = Field(..., min_length=1, max_length=255, description="Client company name")
    product_id: str = Field(..., min_length=1, max_length=50, description="Product identifier")
    product_name: str = Field(..., min_length=1, max_length=255, description="Product name")
    quantity: float = Field(..., gt=0, description="Order quantity (must be positive)")
    unit: OrderUnit = Field(..., description="Unit of measurement")
    due_date: date = Field(..., description="Required delivery date")
    priority: OrderPriority = Field(default=OrderPriority.NORMAL, description="Order priority")
    value: Optional[float] = Field(None, ge=0, description="Order value (must be non-negative)")
    margin: Optional[float] = Field(None, ge=0, le=100, description="Margin percentage (0-100)")
    special_requirements: Optional[str] = Field(None, max_length=2000, description="Special requirements")

    @validator('due_date')
    def validate_due_date(cls, v):
        """Validate that due date is not in the past"""
        if v < date.today():
            raise ValueError('Due date cannot be in the past')
        return v

    @validator('quantity')
    def validate_quantity(cls, v):
        """Validate quantity is positive and reasonable"""
        if v <= 0:
            raise ValueError('Quantity must be positive')
        if v > 1000000:  # Reasonable upper limit
            raise ValueError('Quantity is too large')
        return v

    @validator('margin')
    def validate_margin(cls, v):
        """Validate margin percentage"""
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Margin must be between 0 and 100 percent')
        return v


class OrderCreate(OrderBase):
    """Schema for creating new orders"""
    
    number: Optional[str] = Field(None, max_length=50, description="Order number (auto-generated if not provided)")
    created_by: str = Field(..., min_length=1, max_length=100, description="User creating the order")

    @validator('number')
    def validate_order_number(cls, v):
        """Validate order number format if provided"""
        if v is not None:
            # Expected format: ZP-YYYY/NNNN
            if not v.startswith('ZP-') or len(v) != 12:
                raise ValueError('Order number must be in format ZP-YYYY/NNNN')
        return v


class OrderUpdate(BaseModel):
    """Schema for updating existing orders"""
    
    client_id: Optional[str] = Field(None, min_length=1, max_length=50)
    client_name: Optional[str] = Field(None, min_length=1, max_length=255)
    product_id: Optional[str] = Field(None, min_length=1, max_length=50)
    product_name: Optional[str] = Field(None, min_length=1, max_length=255)
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[OrderUnit] = None
    due_date: Optional[date] = None
    priority: Optional[OrderPriority] = None
    status: Optional[OrderStatus] = None
    value: Optional[float] = Field(None, ge=0)
    margin: Optional[float] = Field(None, ge=0, le=100)
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage (0-100)")
    special_requirements: Optional[str] = Field(None, max_length=2000)

    @validator('due_date')
    def validate_due_date(cls, v):
        """Validate that due date is not in the past"""
        if v is not None and v < date.today():
            raise ValueError('Due date cannot be in the past')
        return v

    @validator('quantity')
    def validate_quantity(cls, v):
        """Validate quantity if provided"""
        if v is not None:
            if v <= 0:
                raise ValueError('Quantity must be positive')
            if v > 1000000:
                raise ValueError('Quantity is too large')
        return v

    @validator('progress')
    def validate_progress(cls, v):
        """Validate progress percentage"""
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Progress must be between 0 and 100 percent')
        return v


class OrderResponse(OrderBase):
    """Schema for order responses"""
    
    id: UUID = Field(..., description="Order unique identifier")
    number: str = Field(..., description="Order number")
    status: OrderStatus = Field(..., description="Current order status")
    progress: int = Field(..., ge=0, le=100, description="Production progress percentage")
    created_by: str = Field(..., description="User who created the order")
    created_at: datetime = Field(..., description="Order creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Computed fields
    is_overdue: bool = Field(..., description="Whether order is overdue")
    days_until_due: int = Field(..., description="Days until due date")
    is_urgent_priority: bool = Field(..., description="Whether order has urgent priority")
    status_display: str = Field(..., description="Human-readable status")
    priority_display: str = Field(..., description="Human-readable priority")

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    """Schema for paginated order lists"""
    
    items: List[OrderResponse] = Field(..., description="List of orders")
    total: int = Field(..., description="Total number of orders")
    page: int = Field(..., description="Current page number")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total number of pages")


class OrderSummary(BaseModel):
    """Schema for order summary statistics"""
    
    total_orders: int = Field(..., description="Total number of orders")
    new_orders: int = Field(..., description="Number of new orders")
    in_production: int = Field(..., description="Number of orders in production")
    completed_orders: int = Field(..., description="Number of completed orders")
    overdue_orders: int = Field(..., description="Number of overdue orders")
    urgent_orders: int = Field(..., description="Number of urgent priority orders")
    total_value: float = Field(..., description="Total value of all orders")
    average_margin: float = Field(..., description="Average margin percentage")


class OrderStatusUpdate(BaseModel):
    """Schema for updating order status"""
    
    status: OrderStatus = Field(..., description="New order status")
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage")
    notes: Optional[str] = Field(None, max_length=500, description="Status change notes")

    @validator('progress')
    def validate_progress(cls, v):
        """Validate progress percentage"""
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Progress must be between 0 and 100 percent')
        return v


class OrderFilter(BaseModel):
    """Schema for filtering orders"""
    
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    product_id: Optional[str] = None
    status: Optional[OrderStatus] = None
    priority: Optional[OrderPriority] = None
    due_date_from: Optional[date] = None
    due_date_to: Optional[date] = None
    overdue_only: Optional[bool] = False
    search: Optional[str] = Field(None, max_length=255, description="Search in order number, client name, or product name")

    @validator('due_date_to')
    def validate_date_range(cls, v, values):
        """Validate that due_date_to is after due_date_from"""
        if v is not None and 'due_date_from' in values and values['due_date_from'] is not None:
            if v < values['due_date_from']:
                raise ValueError('due_date_to must be after due_date_from')
        return v


# Export all schemas
__all__ = [
    'OrderBase',
    'OrderCreate', 
    'OrderUpdate',
    'OrderResponse',
    'OrderListResponse',
    'OrderSummary',
    'OrderStatusUpdate',
    'OrderFilter'
]