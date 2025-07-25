from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.db.database import get_db
from app.models.orders import Order, OrderPriority, OrderStatus
from app.schemas.orders import (
    OrderCreate, 
    OrderUpdate, 
    OrderResponse, 
    OrderListResponse,
    OrderStatusUpdate,
    OrderFilter
)
from app.services.orders import OrderService

router = APIRouter()


@router.get("/", response_model=OrderListResponse)
async def get_orders(
    status: Optional[OrderStatus] = Query(None, description="Filter by order status"),
    client_name: Optional[str] = Query(None, description="Filter by client name (partial match)"),
    priority: Optional[OrderPriority] = Query(None, description="Filter by order priority"),
    search: Optional[str] = Query(None, description="Search in order number, client name, or product name"),
    overdue_only: Optional[bool] = Query(False, description="Show only overdue orders"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of orders with optional filters
    
    - **status**: Filter by order status (new, confirmed, planned, etc.)
    - **client_name**: Filter by client name (partial match)
    - **priority**: Filter by priority level (low, normal, high, urgent)
    - **search**: Search in order number, client name, or product name
    - **overdue_only**: Show only overdue orders
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 50, max: 100)
    """
    try:
        # Create filter object
        filter_data = OrderFilter(
            status=status,
            client_name=client_name,
            priority=priority,
            search=search,
            overdue_only=overdue_only
        )
        
        # Get orders using service
        order_service = OrderService(db)
        result = order_service.get_orders_with_filters(
            filters=filter_data,
            page=page,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving orders: {str(e)}"
        )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get specific order by ID
    
    - **order_id**: Unique order identifier (UUID)
    """
    try:
        order_service = OrderService(db)
        order = order_service.get_order_by_id(order_id)
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving order: {str(e)}"
        )


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    """
    Create new order
    
    - **order_data**: Order creation data
    - Order number will be auto-generated if not provided
    - Validates business rules and data constraints
    """
    try:
        order_service = OrderService(db)
        
        # Check if order number is already taken (if provided)
        if order_data.number:
            existing_order = order_service.get_order_by_number(order_data.number)
            if existing_order:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Order with number {order_data.number} already exists"
                )
        
        # Create order
        new_order = order_service.create_order(order_data)
        
        return new_order
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating order: {str(e)}"
        )


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: UUID,
    order_data: OrderUpdate,
    db: Session = Depends(get_db)
):
    """
    Update existing order
    
    - **order_id**: Unique order identifier (UUID)
    - **order_data**: Order update data (only provided fields will be updated)
    - Validates business rules for status changes
    """
    try:
        order_service = OrderService(db)
        
        # Check if order exists
        existing_order = order_service.get_order_by_id(order_id)
        if not existing_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        # Update order
        updated_order = order_service.update_order(order_id, order_data)
        
        return updated_order
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order: {str(e)}"
        )


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete order
    
    - **order_id**: Unique order identifier (UUID)
    - Only orders in 'new' or 'confirmed' status can be deleted
    """
    try:
        order_service = OrderService(db)
        
        # Check if order exists
        existing_order = order_service.get_order_by_id(order_id)
        if not existing_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        # Check if order can be deleted
        if existing_order.status not in [OrderStatus.NEW, OrderStatus.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete order in status '{existing_order.status}'. Only 'new' or 'confirmed' orders can be deleted."
            )
        
        # Delete order
        order_service.delete_order(order_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting order: {str(e)}"
        )


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update order status and progress
    
    - **order_id**: Unique order identifier (UUID)
    - **status_data**: New status and optional progress
    - Validates status transition rules
    """
    try:
        order_service = OrderService(db)
        
        # Check if order exists
        existing_order = order_service.get_order_by_id(order_id)
        if not existing_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        # Update status
        updated_order = order_service.update_order_status(
            order_id=order_id,
            new_status=status_data.status,
            progress=status_data.progress,
            notes=status_data.notes
        )
        
        return updated_order
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order status: {str(e)}"
        )


@router.get("/{order_id}/progress")
async def get_order_progress(
    order_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get order progress information
    
    - **order_id**: Unique order identifier (UUID)
    - Returns detailed progress information including status history
    """
    try:
        order_service = OrderService(db)
        
        # Check if order exists
        order = order_service.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        # Calculate progress
        progress_info = order_service.calculate_order_progress(order_id)
        
        return {
            "order_id": order_id,
            "order_number": order.number,
            "status": order.status,
            "progress": order.progress,
            "is_overdue": order.is_overdue,
            "days_until_due": order.days_until_due,
            "detailed_progress": progress_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving order progress: {str(e)}"
        )


@router.get("/summary/statistics")
async def get_orders_summary(
    db: Session = Depends(get_db)
):
    """
    Get orders summary statistics
    
    - Returns counts by status, priority, overdue orders, etc.
    """
    try:
        order_service = OrderService(db)
        summary = order_service.get_orders_summary()
        
        return summary
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving orders summary: {str(e)}"
        )


@router.get("/overdue/list", response_model=List[OrderResponse])
async def get_overdue_orders(
    db: Session = Depends(get_db)
):
    """
    Get list of overdue orders
    
    - Returns all orders that are past their due date and not completed/shipped
    """
    try:
        order_service = OrderService(db)
        overdue_orders = order_service.get_overdue_orders()
        
        return overdue_orders
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving overdue orders: {str(e)}"
        )


@router.get("/urgent/list", response_model=List[OrderResponse])
async def get_urgent_orders(
    db: Session = Depends(get_db)
):
    """
    Get list of urgent priority orders
    
    - Returns all orders with urgent priority
    """
    try:
        order_service = OrderService(db)
        urgent_orders = order_service.get_urgent_orders()
        
        return urgent_orders
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving urgent orders: {str(e)}"
        )