from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import random
from datetime import datetime, timedelta

from app.db.database import get_db

router = APIRouter()


@router.get("/kpi", response_model=Dict[str, Any])
async def get_kpi_metrics(db: AsyncSession = Depends(get_db)):
    """
    Get Key Performance Indicators for dashboard
    
    Returns real-time production metrics including:
    - Production efficiency
    - Order fulfillment rate  
    - Quality metrics
    - Equipment utilization
    """
    
    # In a real application, these would be calculated from database
    # For now, we'll return simulated data
    
    kpi_data = {
        "production_efficiency": {
            "value": round(random.uniform(85, 98), 1),
            "unit": "%",
            "trend": random.choice(["+", "-"]) + str(round(random.uniform(0.1, 2.5), 1)),
            "target": 95.0,
            "status": "good"
        },
        "order_fulfillment": {
            "value": round(random.uniform(88, 99), 1),
            "unit": "%", 
            "trend": random.choice(["+", "-"]) + str(round(random.uniform(0.1, 1.8), 1)),
            "target": 95.0,
            "status": "excellent"
        },
        "quality_rate": {
            "value": round(random.uniform(96, 99.9), 1),
            "unit": "%",
            "trend": random.choice(["+", "-"]) + str(round(random.uniform(0.1, 0.5), 1)),
            "target": 98.0,
            "status": "good"
        },
        "equipment_oee": {
            "value": round(random.uniform(78, 92), 1),
            "unit": "%",
            "trend": random.choice(["+", "-"]) + str(round(random.uniform(0.5, 3.0), 1)),
            "target": 85.0,
            "status": "warning"
        },
        "daily_production": {
            "value": round(random.uniform(45, 75), 1),
            "unit": "т",
            "trend": random.choice(["+", "-"]) + str(round(random.uniform(1, 8), 1)),
            "target": 65.0,
            "status": "good"
        },
        "inventory_turnover": {
            "value": round(random.uniform(8, 15), 1),
            "unit": "дней",
            "trend": random.choice(["+", "-"]) + str(round(random.uniform(0.2, 1.5), 1)),
            "target": 12.0,
            "status": "good"
        }
    }
    
    return {
        "timestamp": datetime.now().isoformat(),
        "kpi": kpi_data,
        "last_updated": datetime.now().strftime("%H:%M:%S")
    }


@router.get("/production-overview", response_model=Dict[str, Any])
async def get_production_overview(db: AsyncSession = Depends(get_db)):
    """
    Get production overview with line status and current orders
    """
    
    production_lines = [
        {
            "line_id": "EXTRUDER-1",
            "name": "Экструдер №1",
            "status": "active",
            "current_order": "#ORD-2024-015",
            "product": "Пленка ПВД прозрачная 120мкм",
            "progress": random.randint(45, 95),
            "estimated_completion": (datetime.now() + timedelta(hours=random.randint(1, 8))).strftime("%H:%M"),
            "efficiency": round(random.uniform(85, 98), 1),
            "speed": round(random.uniform(80, 120), 0),
            "operator": "Иванов И.И."
        },
        {
            "line_id": "EXTRUDER-2", 
            "name": "Экструдер №2",
            "status": "maintenance",
            "current_order": None,
            "product": None,
            "progress": 0,
            "estimated_completion": "16:30",
            "efficiency": 0,
            "speed": 0,
            "operator": "Техническое обслуживание"
        },
        {
            "line_id": "PRINT-LINE-1",
            "name": "Печатная машина №1", 
            "status": "active",
            "current_order": "#ORD-2024-012",
            "product": "Пакет с печатью 4+0",
            "progress": random.randint(20, 80),
            "estimated_completion": (datetime.now() + timedelta(hours=random.randint(2, 6))).strftime("%H:%M"),
            "efficiency": round(random.uniform(88, 96), 1),
            "speed": round(random.uniform(90, 110), 0),
            "operator": "Петров П.П."
        },
        {
            "line_id": "LAMINATOR-1",
            "name": "Ламинатор №1",
            "status": "idle",
            "current_order": None,
            "product": None,
            "progress": 0,
            "estimated_completion": None,
            "efficiency": 0,
            "speed": 0,
            "operator": "Ожидание заказа"
        }
    ]
    
    return {
        "timestamp": datetime.now().isoformat(),
        "production_lines": production_lines,
        "total_lines": len(production_lines),
        "active_lines": len([line for line in production_lines if line["status"] == "active"]),
        "idle_lines": len([line for line in production_lines if line["status"] == "idle"]),
        "maintenance_lines": len([line for line in production_lines if line["status"] == "maintenance"])
    }


@router.get("/recent-activities", response_model=List[Dict[str, Any]])
async def get_recent_activities(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """
    Get recent system activities and alerts
    """
    
    activities = [
        {
            "id": 1,
            "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
            "type": "order_completed",
            "title": "Заказ #ORD-2024-014 завершен",
            "description": "Произведено 2,500 кг пленки ПВД прозрачной",
            "user": "Система",
            "severity": "info",
            "module": "production"
        },
        {
            "id": 2,
            "timestamp": (datetime.now() - timedelta(minutes=12)).isoformat(),
            "type": "quality_alert",
            "title": "Требуется контроль качества",
            "description": "Партия 240119-001 ожидает проверки",
            "user": "Качество",
            "severity": "warning",
            "module": "quality"
        },
        {
            "id": 3,
            "timestamp": (datetime.now() - timedelta(minutes=18)).isoformat(),
            "type": "delivery_received",
            "title": "Поставка принята",
            "description": "Dow Chemical: 5,000 кг гранулята ПВД",
            "user": "Склад",
            "severity": "success",
            "module": "warehouse"
        },
        {
            "id": 4,
            "timestamp": (datetime.now() - timedelta(minutes=25)).isoformat(),
            "type": "purchase_order",
            "title": "Новый заказ поставщику",
            "description": "PO-2024-0158 отправлен Siegwerk",
            "user": "Закупки",
            "severity": "info",
            "module": "procurement"
        },
        {
            "id": 5,
            "timestamp": (datetime.now() - timedelta(minutes=32)).isoformat(),
            "type": "maintenance_scheduled",
            "title": "Плановое ТО назначено",
            "description": "Экструдер №2 - замена фильтров",
            "user": "Техслужба",
            "severity": "info",
            "module": "maintenance"
        }
    ]
    
    return activities[:limit]


@router.get("/chart-data/production", response_model=Dict[str, Any])
async def get_production_chart_data(
    period: str = "7d",  # 7d, 30d, 90d
    db: AsyncSession = Depends(get_db)
):
    """
    Get production chart data for dashboard visualization
    """
    
    if period == "7d":
        days = 7
    elif period == "30d":
        days = 30
    elif period == "90d":
        days = 90
    else:
        days = 7
    
    # Generate sample data
    dates = []
    production_data = []
    quality_data = []
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-1-i)
        dates.append(date.strftime("%Y-%m-%d"))
        
        # Simulate production data (tons per day)
        base_production = 50
        variation = random.uniform(-10, 15)
        production_data.append(round(base_production + variation, 1))
        
        # Simulate quality data (percentage)
        base_quality = 97
        quality_variation = random.uniform(-2, 2)
        quality_data.append(round(base_quality + quality_variation, 1))
    
    return {
        "period": period,
        "dates": dates,
        "production": {
            "label": "Производство (т/день)",
            "data": production_data,
            "color": "#3B82F6"
        },
        "quality": {
            "label": "Качество (%)",
            "data": quality_data,
            "color": "#10B981"
        },
        "summary": {
            "total_production": round(sum(production_data), 1),
            "avg_quality": round(sum(quality_data) / len(quality_data), 1),
            "best_day": {
                "date": dates[production_data.index(max(production_data))],
                "production": max(production_data)
            }
        }
    }


@router.get("/alerts", response_model=List[Dict[str, Any]])
async def get_system_alerts(db: AsyncSession = Depends(get_db)):
    """
    Get current system alerts and notifications
    """
    
    alerts = [
        {
            "id": 1,
            "type": "critical",
            "title": "Критическая нехватка материала",
            "message": "Гранулят ПВД: остаток 200 кг (мин. 1000 кг)",
            "module": "inventory",
            "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
            "action_required": True,
            "action_url": "/api/v1/procurement/create-emergency-order"
        },
        {
            "id": 2,
            "type": "warning", 
            "title": "Задержка поставки",
            "message": "PO-2024-0154 задерживается на 3 дня",
            "module": "procurement",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "action_required": True,
            "action_url": "/api/v1/procurement/escalate-order"
        },
        {
            "id": 3,
            "type": "info",
            "title": "Плановое техобслуживание",
            "message": "Экструдер №2 будет остановлен на ТО в 16:00",
            "module": "maintenance",
            "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
            "action_required": False,
            "action_url": None
        }
    ]
    
    return alerts


@router.get("/system-status", response_model=Dict[str, Any])
async def get_system_status(db: AsyncSession = Depends(get_db)):
    """
    Get overall system health and status
    """
    
    return {
        "timestamp": datetime.now().isoformat(),
        "overall_status": "healthy",
        "services": {
            "database": {
                "status": "healthy",
                "response_time": round(random.uniform(1, 15), 1),
                "connections": random.randint(5, 25)
            },
            "api": {
                "status": "healthy", 
                "response_time": round(random.uniform(50, 200), 1),
                "requests_per_minute": random.randint(100, 500)
            },
            "production_lines": {
                "status": "operational",
                "active_lines": 2,
                "total_lines": 4,
                "efficiency": round(random.uniform(85, 95), 1)
            },
            "warehouse": {
                "status": "operational",
                "capacity_used": round(random.uniform(65, 85), 1),
                "pending_receipts": random.randint(2, 8)
            }
        },
        "performance": {
            "cpu_usage": round(random.uniform(15, 45), 1),
            "memory_usage": round(random.uniform(35, 65), 1),
            "disk_usage": round(random.uniform(40, 70), 1)
        }
    }