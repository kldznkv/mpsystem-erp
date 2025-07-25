from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.database import get_session
from app.services.dashboard import DashboardService
from app.schemas.dashboard import (
    DashboardMetrics,
    ProductionLineStatus,
    CriticalAlert,
    DashboardOverview
)

router = APIRouter()


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    session: AsyncSession = Depends(get_session)
) -> DashboardMetrics:
    """
    🏭 Get MPSYSTEM key metrics for dashboard
    
    Returns the 4 main metrics cards:
    - Active Orders count
    - Production Capacity utilization
    - Overall Equipment Effectiveness (OEE)
    - Quality Pass Rate
    """
    service = DashboardService(session)
    return await service.get_dashboard_metrics()


@router.get("/production-lines", response_model=List[ProductionLineStatus])
async def get_production_lines_status(
    session: AsyncSession = Depends(get_session)
) -> List[ProductionLineStatus]:
    """
    ⚙️ Get real-time status of all production lines
    
    Returns grouped production lines:
    - 🔄 Extrusion (4 lines + 2 cutting + laboratory)
    - 📄 Lamination (1 line + cutting)
    - 🎨 Printing (2 lines)
    """
    service = DashboardService(session)
    return await service.get_production_lines_status()


@router.get("/alerts", response_model=List[CriticalAlert])
async def get_critical_alerts(
    session: AsyncSession = Depends(get_session),
    limit: int = 10
) -> List[CriticalAlert]:
    """
    🚨 Get critical alerts and notifications
    
    Returns prioritized alerts:
    - Low stock warnings
    - Overdue orders
    - Quality control requirements
    - Maintenance schedules
    """
    service = DashboardService(session)
    return await service.get_critical_alerts(limit=limit)


@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    session: AsyncSession = Depends(get_session)
) -> DashboardOverview:
    """
    📊 Get complete dashboard overview
    
    Returns all dashboard data in one request:
    - Key metrics
    - Production lines status
    - Critical alerts
    """
    service = DashboardService(session)
    
    metrics = await service.get_dashboard_metrics()
    lines = await service.get_production_lines_status()
    alerts = await service.get_critical_alerts(limit=5)
    
    return DashboardOverview(
        metrics=metrics,
        production_lines=lines,
        critical_alerts=alerts,
        last_updated=datetime.now()
    )


@router.post("/line/{line_id}/action")
async def execute_line_action(
    line_id: str,
    action: str,
    session: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    🎮 Execute action on production line
    
    Available actions:
    - pause: Pause production line
    - start: Start production line
    - priority: Adjust priority
    - maintenance: Schedule maintenance
    """
    service = DashboardService(session)
    
    valid_actions = ["pause", "start", "priority", "maintenance", "stop"]
    if action not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action. Must be one of: {valid_actions}"
        )
    
    result = await service.execute_line_action(line_id, action)
    return {
        "success": True,
        "message": f"Action '{action}' executed on line {line_id}",
        "result": result
    }


@router.post("/alert/{alert_id}/action")
async def execute_alert_action(
    alert_id: int,
    action: str,
    session: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    🚨 Execute action on critical alert
    
    Available actions:
    - order_material: Order low stock material
    - escalate_order: Escalate overdue order
    - schedule_qc: Schedule quality control
    - prepare_maintenance: Prepare maintenance
    """
    service = DashboardService(session)
    
    valid_actions = [
        "order_material", "escalate_order", 
        "schedule_qc", "prepare_maintenance", "acknowledge"
    ]
    if action not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action. Must be one of: {valid_actions}"
        )
    
    result = await service.execute_alert_action(alert_id, action)
    return {
        "success": True,
        "message": f"Action '{action}' executed on alert {alert_id}",
        "result": result
    }


@router.get("/system/status")
async def get_system_status() -> Dict[str, Any]:
    """
    🖥️ Get MPSYSTEM backend status
    """
    return {
        "status": "online",
        "system": "MPSYSTEM Production ERP",
        "version": "1.0.0",
        "timestamp": datetime.now(),
        "uptime": "Available",
        "database": "Connected",
        "environment": "Production Ready"
    }