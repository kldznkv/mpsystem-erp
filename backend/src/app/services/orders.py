from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
import math

from app.models.orders import Order, OrderPriority, OrderStatus
from app.schemas.orders import (
    OrderCreate, 
    OrderUpdate, 
    OrderResponse, 
    OrderListResponse,
    OrderFilter,
    OrderSummary
)


class OrderService:
    """Service class for Order business logic and data operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_order_number(self) -> str:
        """Generate unique order number in format ZP-YYYY/NNNN"""
        current_year = datetime.now().year
        
        # Get the last order number for current year
        last_order = (
            self.db.query(Order)
            .filter(Order.number.like(f"ZP-{current_year}/%"))
            .order_by(desc(Order.number))
            .first()
        )
        
        if last_order:
            # Extract number part and increment
            try:
                number_part = int(last_order.number.split('/')[-1])
                next_number = number_part + 1
            except (ValueError, IndexError):
                next_number = 1
        else:
            next_number = 1
        
        return f"ZP-{current_year}/{next_number:04d}"
    
    def create_order(self, order_data: OrderCreate) -> OrderResponse:
        """Create new order with business logic validation"""
        
        # Generate order number if not provided
        if not order_data.number:
            order_number = self.generate_order_number()
        else:
            order_number = order_data.number
        
        # Validate business rules
        self._validate_order_creation(order_data)
        
        # Create order instance
        db_order = Order(
            number=order_number,
            client_id=order_data.client_id,
            client_name=order_data.client_name,
            product_id=order_data.product_id,
            product_name=order_data.product_name,
            quantity=order_data.quantity,
            unit=order_data.unit,
            due_date=order_data.due_date,
            priority=order_data.priority,
            status=OrderStatus.NEW,  # Always start as NEW
            value=order_data.value,
            margin=order_data.margin,
            progress=0,  # Always start at 0%
            special_requirements=order_data.special_requirements,
            created_by=order_data.created_by
        )
        
        try:
            self.db.add(db_order)
            self.db.commit()
            self.db.refresh(db_order)
            
            return OrderResponse.model_validate(db_order)
            
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to create order: {str(e)}")
    
    def get_order_by_id(self, order_id: UUID) -> Optional[OrderResponse]:
        """Get order by ID"""
        order = self.db.query(Order).filter(Order.id == order_id).first()
        
        if order:
            return OrderResponse.model_validate(order)
        return None
    
    def get_order_by_number(self, order_number: str) -> Optional[OrderResponse]:
        """Get order by number"""
        order = self.db.query(Order).filter(Order.number == order_number).first()
        
        if order:
            return OrderResponse.model_validate(order)
        return None
    
    def get_orders_with_filters(
        self, 
        filters: OrderFilter, 
        page: int = 1, 
        limit: int = 50
    ) -> OrderListResponse:
        """Get paginated orders with filters"""
        
        # Build query
        query = self.db.query(Order)
        
        # Apply filters
        if filters.status:
            query = query.filter(Order.status == filters.status)
        
        if filters.priority:
            query = query.filter(Order.priority == filters.priority)
        
        if filters.client_name:
            query = query.filter(Order.client_name.ilike(f"%{filters.client_name}%"))
        
        if filters.client_id:
            query = query.filter(Order.client_id == filters.client_id)
        
        if filters.product_id:
            query = query.filter(Order.product_id == filters.product_id)
        
        if filters.due_date_from:
            query = query.filter(Order.due_date >= filters.due_date_from)
        
        if filters.due_date_to:
            query = query.filter(Order.due_date <= filters.due_date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Order.number.ilike(search_term),
                    Order.client_name.ilike(search_term),
                    Order.product_name.ilike(search_term)
                )
            )
        
        if filters.overdue_only:
            query = query.filter(
                and_(
                    Order.due_date < date.today(),
                    Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.SHIPPED])
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        orders = query.order_by(desc(Order.created_at)).offset(offset).limit(limit).all()
        
        # Convert to response models
        order_responses = [OrderResponse.model_validate(order) for order in orders]
        
        # Calculate pagination info
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return OrderListResponse(
            items=order_responses,
            total=total,
            page=page,
            size=limit,
            pages=pages
        )
    
    def update_order(self, order_id: UUID, order_data: OrderUpdate) -> OrderResponse:
        """Update order with business logic validation"""
        
        # Get existing order
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise ValueError(f"Order with ID {order_id} not found")
        
        # Validate business rules for updates
        self._validate_order_update(db_order, order_data)
        
        # Update fields
        update_data = order_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_order, field):
                setattr(db_order, field, value)
        
        # Update timestamp
        db_order.updated_at = datetime.utcnow()
        
        try:
            self.db.commit()
            self.db.refresh(db_order)
            
            return OrderResponse.model_validate(db_order)
            
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to update order: {str(e)}")
    
    def update_order_status(
        self, 
        order_id: UUID, 
        new_status: OrderStatus, 
        progress: Optional[int] = None,
        notes: Optional[str] = None
    ) -> OrderResponse:
        """Update order status with validation of status transitions"""
        
        # Get existing order
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise ValueError(f"Order with ID {order_id} not found")
        
        # Validate status transition
        self._validate_status_transition(db_order.status, new_status)
        
        # Update status
        db_order.status = new_status
        db_order.updated_at = datetime.utcnow()
        
        # Update progress if provided
        if progress is not None:
            db_order.progress = progress
        else:
            # Auto-set progress based on status
            db_order.progress = self._get_default_progress_for_status(new_status)
        
        try:
            self.db.commit()
            self.db.refresh(db_order)
            
            return OrderResponse.model_validate(db_order)
            
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to update order status: {str(e)}")
    
    def delete_order(self, order_id: UUID) -> bool:
        """Delete order (soft delete logic can be implemented here)"""
        
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise ValueError(f"Order with ID {order_id} not found")
        
        try:
            self.db.delete(db_order)
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to delete order: {str(e)}")
    
    def calculate_order_progress(self, order_id: UUID) -> Dict[str, Any]:
        """Calculate detailed order progress information"""
        
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise ValueError(f"Order with ID {order_id} not found")
        
        # Calculate detailed progress
        progress_info = {
            "current_status": db_order.status.value,
            "current_progress": db_order.progress,
            "status_history": [
                {
                    "status": "new",
                    "completed": True,
                    "date": db_order.created_at.isoformat()
                }
            ],
            "estimated_completion": None,
            "next_milestone": self._get_next_milestone(db_order.status),
            "bottlenecks": [],
            "recommendations": []
        }
        
        # Add recommendations based on current state
        if db_order.is_overdue:
            progress_info["recommendations"].append(
                "Order is overdue - consider expediting or contacting client"
            )
        
        if db_order.priority == OrderPriority.URGENT:
            progress_info["recommendations"].append(
                "High priority order - ensure resources are allocated"
            )
        
        return progress_info
    
    def get_orders_summary(self) -> OrderSummary:
        """Get orders summary statistics"""
        
        # Get counts by status
        total_orders = self.db.query(Order).count()
        new_orders = self.db.query(Order).filter(Order.status == OrderStatus.NEW).count()
        in_production = self.db.query(Order).filter(Order.status == OrderStatus.IN_PRODUCTION).count()
        completed_orders = self.db.query(Order).filter(Order.status == OrderStatus.COMPLETED).count()
        
        # Get overdue orders count
        overdue_orders = self.db.query(Order).filter(
            and_(
                Order.due_date < date.today(),
                Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.SHIPPED])
            )
        ).count()
        
        # Get urgent orders count
        urgent_orders = self.db.query(Order).filter(Order.priority == OrderPriority.URGENT).count()
        
        # Calculate financial metrics
        total_value = self.db.query(func.sum(Order.value)).filter(Order.value.isnot(None)).scalar() or 0.0
        average_margin = self.db.query(func.avg(Order.margin)).filter(Order.margin.isnot(None)).scalar() or 0.0
        
        return OrderSummary(
            total_orders=total_orders,
            new_orders=new_orders,
            in_production=in_production,
            completed_orders=completed_orders,
            overdue_orders=overdue_orders,
            urgent_orders=urgent_orders,
            total_value=float(total_value),
            average_margin=float(average_margin)
        )
    
    def get_overdue_orders(self) -> List[OrderResponse]:
        """Get all overdue orders"""
        
        orders = self.db.query(Order).filter(
            and_(
                Order.due_date < date.today(),
                Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.SHIPPED])
            )
        ).order_by(asc(Order.due_date)).all()
        
        return [OrderResponse.model_validate(order) for order in orders]
    
    def get_urgent_orders(self) -> List[OrderResponse]:
        """Get all urgent priority orders"""
        
        orders = self.db.query(Order).filter(
            Order.priority == OrderPriority.URGENT
        ).order_by(asc(Order.due_date)).all()
        
        return [OrderResponse.model_validate(order) for order in orders]
    
    # Private helper methods
    
    def _validate_order_creation(self, order_data: OrderCreate) -> None:
        """Validate business rules for order creation"""
        
        # Check if client exists (placeholder - implement when client model exists)
        # if not self._client_exists(order_data.client_id):
        #     raise ValueError(f"Client {order_data.client_id} not found")
        
        # Check if product exists (placeholder - implement when product model exists)
        # if not self._product_exists(order_data.product_id):
        #     raise ValueError(f"Product {order_data.product_id} not found")
        
        # Validate due date
        if order_data.due_date < date.today():
            raise ValueError("Due date cannot be in the past")
        
        # Validate quantity
        if order_data.quantity <= 0:
            raise ValueError("Quantity must be positive")
    
    def _validate_order_update(self, existing_order: Order, update_data: OrderUpdate) -> None:
        """Validate business rules for order updates"""
        
        # Check if order can be modified based on status
        immutable_statuses = [OrderStatus.COMPLETED, OrderStatus.SHIPPED]
        if existing_order.status in immutable_statuses:
            raise ValueError(f"Cannot modify order in status '{existing_order.status}'")
        
        # If status is being changed, validate transition
        if update_data.status and update_data.status != existing_order.status:
            self._validate_status_transition(existing_order.status, update_data.status)
        
        # Validate due date if being changed
        if update_data.due_date and update_data.due_date < date.today():
            raise ValueError("Due date cannot be in the past")
    
    def _validate_status_transition(self, current_status: OrderStatus, new_status: OrderStatus) -> None:
        """Validate that status transition is allowed"""
        
        # Define allowed transitions
        allowed_transitions = {
            OrderStatus.NEW: [OrderStatus.CONFIRMED],
            OrderStatus.CONFIRMED: [OrderStatus.PLANNED, OrderStatus.NEW],
            OrderStatus.PLANNED: [OrderStatus.IN_PRODUCTION, OrderStatus.CONFIRMED],
            OrderStatus.IN_PRODUCTION: [OrderStatus.COMPLETED, OrderStatus.PLANNED],
            OrderStatus.COMPLETED: [OrderStatus.SHIPPED],
            OrderStatus.SHIPPED: []  # Final status
        }
        
        if new_status not in allowed_transitions.get(current_status, []):
            raise ValueError(
                f"Invalid status transition from '{current_status}' to '{new_status}'"
            )
    
    def _get_default_progress_for_status(self, status: OrderStatus) -> int:
        """Get default progress percentage for given status"""
        
        progress_map = {
            OrderStatus.NEW: 0,
            OrderStatus.CONFIRMED: 10,
            OrderStatus.PLANNED: 25,
            OrderStatus.IN_PRODUCTION: 50,
            OrderStatus.COMPLETED: 90,
            OrderStatus.SHIPPED: 100
        }
        
        return progress_map.get(status, 0)
    
    def _get_next_milestone(self, current_status: OrderStatus) -> Optional[str]:
        """Get next milestone for current status"""
        
        milestone_map = {
            OrderStatus.NEW: "Client confirmation",
            OrderStatus.CONFIRMED: "Production planning",
            OrderStatus.PLANNED: "Production start",
            OrderStatus.IN_PRODUCTION: "Production completion",
            OrderStatus.COMPLETED: "Shipment",
            OrderStatus.SHIPPED: None
        }
        
        return milestone_map.get(current_status)