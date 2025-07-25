# Import all schemas here for easy access
from .dashboard import *
from .warehouse import *
from .orders import (
    OrderBase,
    OrderCreate, 
    OrderUpdate,
    OrderResponse,
    OrderListResponse,
    OrderSummary,
    OrderStatusUpdate,
    OrderFilter
)

# Export all schemas
__all__ = [
    # Orders
    "OrderBase",
    "OrderCreate", 
    "OrderUpdate",
    "OrderResponse",
    "OrderListResponse",
    "OrderSummary",
    "OrderStatusUpdate",
    "OrderFilter",
    # Add other schemas when they're created
]