from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class LineStatus(str, Enum):
    RUNNING = "running"
    IDLE = "idle"
    MAINTENANCE = "maintenance"
    STOPPED = "stopped"


class AlertType(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class DashboardMetrics(BaseModel):
    """Key metrics for MPSYSTEM dashboard"""
    
    orders_active: int = Field(..., description="Number of active orders")
    production_capacity: float = Field(..., description="Production capacity utilization %")
    oee_efficiency: float = Field(..., description="Overall Equipment Effectiveness %")
    quality_pass_rate: float = Field(..., description="Quality pass rate %")
    
    class Config:
        json_schema_extra = {
            "example": {
                "orders_active": 847,
                "production_capacity": 94.2,
                "oee_efficiency": 87.3,
                "quality_pass_rate": 99.1
            }
        }


class ProductionLineStatus(BaseModel):
    """Production line status for dashboard"""
    
    line_id: str = Field(..., description="Line identifier")
    line_name: str = Field(..., description="Display name")
    line_group: str = Field(..., description="Group: extrusion, lamination, printing")
    status: LineStatus = Field(..., description="Current status")
    
    current_order: Optional[str] = Field(None, description="Current order number")
    progress_percent: int = Field(0, description="Progress percentage 0-100")
    time_remaining: Optional[str] = Field(None, description="Estimated time remaining")
    
    oee_percent: float = Field(0.0, description="OEE for this line")
    queue_count: int = Field(0, description="Orders in queue")
    
    operator: Optional[str] = Field(None, description="Current operator")
    
    class Config:
        json_schema_extra = {
            "example": {
                "line_id": "extrusion-1",
                "line_name": "Экструзия-1 (рукава)",
                "line_group": "extrusion",
                "status": "running",
                "current_order": "ORD-250001",
                "progress_percent": 65,
                "time_remaining": "2ч 30мин осталось",
                "oee_percent": 89.0,
                "queue_count": 3,
                "operator": "Иванов И.И."
            }
        }


class CriticalAlert(BaseModel):
    """Critical alert for dashboard"""
    
    alert_id: int = Field(..., description="Alert ID")
    alert_type: AlertType = Field(..., description="Alert severity")
    icon: str = Field(..., description="Icon for display")
    
    title: str = Field(..., description="Alert title")
    message: str = Field(..., description="Alert message")
    time_ago: str = Field(..., description="Time since alert")
    
    action_available: bool = Field(False, description="Has actionable button")
    action_label: Optional[str] = Field(None, description="Action button label")
    action_endpoint: Optional[str] = Field(None, description="API endpoint for action")
    
    module: str = Field(..., description="Module that generated alert")
    created_at: datetime = Field(..., description="Alert creation time")
    
    class Config:
        json_schema_extra = {
            "example": {
                "alert_id": 1,
                "alert_type": "critical",
                "icon": "⚠️",
                "title": "Низкий остаток: Гранулы PE",
                "message": "Осталось 50кг (мин. остаток: 1000кг)",
                "time_ago": "5 мин назад",
                "action_available": True,
                "action_label": "Заказать",
                "action_endpoint": "/api/v1/procurement/emergency-order",
                "module": "warehouse",
                "created_at": "2024-01-20T10:30:00"
            }
        }


class DashboardOverview(BaseModel):
    """Complete dashboard overview"""
    
    metrics: DashboardMetrics = Field(..., description="Key performance metrics")
    production_lines: List[ProductionLineStatus] = Field(..., description="All production lines")
    critical_alerts: List[CriticalAlert] = Field(..., description="Recent critical alerts")
    
    last_updated: datetime = Field(..., description="Last update timestamp")
    auto_refresh_seconds: int = Field(30, description="Refresh interval per ТЗ")
    
    class Config:
        json_schema_extra = {
            "example": {
                "metrics": {
                    "orders_active": 847,
                    "production_capacity": 94.2,
                    "oee_efficiency": 87.3,
                    "quality_pass_rate": 99.1
                },
                "production_lines": [],
                "critical_alerts": [],
                "last_updated": "2024-01-20T10:35:00",
                "auto_refresh_seconds": 30
            }
        }


# Action schemas
class LineActionRequest(BaseModel):
    """Request to execute action on production line"""
    
    action: str = Field(..., description="Action to execute")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Action parameters")
    reason: Optional[str] = Field(None, description="Reason for action")
    
    class Config:
        json_schema_extra = {
            "example": {
                "action": "pause",
                "reason": "Material shortage",
                "parameters": {"priority": "high"}
            }
        }


class AlertActionRequest(BaseModel):
    """Request to execute action on alert"""
    
    action: str = Field(..., description="Action to execute")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Action parameters")
    user_id: Optional[str] = Field(None, description="User executing action")
    
    class Config:
        json_schema_extra = {
            "example": {
                "action": "order_material",
                "parameters": {"quantity": 2000, "urgent": True},
                "user_id": "user123"
            }
        }


class ActionResponse(BaseModel):
    """Response from action execution"""
    
    success: bool = Field(..., description="Action success status")
    message: str = Field(..., description="Result message")
    action_id: Optional[str] = Field(None, description="Action tracking ID")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Линия успешно поставлена на паузу",
                "action_id": "ACT-20240120-001",
                "estimated_completion": "2024-01-20T11:00:00"
            }
        }