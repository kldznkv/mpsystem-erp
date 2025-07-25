from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import random
from datetime import datetime, timedelta

from app.db.database import get_db

router = APIRouter()


@router.get("/stats", response_model=Dict[str, Any])
async def get_planning_stats(db: AsyncSession = Depends(get_db)):
    """Get planning statistics for dashboard"""
    
    return {
        "new_orders": random.randint(20, 30),
        "production_queue": random.randint(15, 25),
        "in_progress": random.randint(10, 18),
        "completed_today": random.randint(8, 15),
        "optimization_savings": f"{random.randint(12, 25)}%",
        "avg_lead_time": f"{random.uniform(2.5, 4.5):.1f} дня"
    }


@router.get("/new-orders", response_model=List[Dict[str, Any]])
async def get_new_orders(db: AsyncSession = Depends(get_db)):
    """Get new orders requiring planning"""
    
    orders = [
        {
            "order_id": "ORD-2024-001",
            "customer": "ООО Упаковка Плюс",
            "product": "Пленка ПВД прозрачная 150мкм",
            "quantity": 2500,
            "unit": "кг",
            "priority": "critical",
            "delivery_date": "2024-01-22",
            "recommended_line": "EXTRUDER-1",
            "materials_status": "available",
            "estimated_time": 4.5
        },
        {
            "order_id": "ORD-2024-002", 
            "customer": "Агроупак ТД",
            "product": "Пакет с печатью красный",
            "quantity": 10000,
            "unit": "шт",
            "priority": "high",
            "delivery_date": "2024-01-25",
            "recommended_line": "PRINT-LINE-1",
            "materials_status": "partial",
            "estimated_time": 6.0
        }
    ]
    
    return orders


@router.get("/production-queue", response_model=List[Dict[str, Any]])
async def get_production_queue(db: AsyncSession = Depends(get_db)):
    """Get optimized production queue"""
    
    queue = [
        {
            "position": 1,
            "order_id": "ORD-2024-001",
            "product": "Пленка ПВД прозрачная 150мкм",
            "line": "EXTRUDER-1",
            "color_group": "transparent",
            "estimated_time": 4.5,
            "priority": "critical",
            "materials_ready": True
        },
        {
            "position": 2,
            "order_id": "ORD-2024-003",
            "product": "Пленка ПВД белая 120мкм", 
            "line": "EXTRUDER-1",
            "color_group": "white",
            "estimated_time": 3.8,
            "priority": "medium",
            "materials_ready": True
        }
    ]
    
    return queue


@router.post("/optimize-queue")
async def optimize_production_queue(db: AsyncSession = Depends(get_db)):
    """Optimize production queue to minimize changeovers"""
    
    # Simulate optimization process
    return {
        "status": "success",
        "message": "Очередь оптимизирована",
        "optimization_result": {
            "original_changeovers": 8,
            "optimized_changeovers": 3,
            "time_saved": "2.5 часа",
            "cost_saved": "15,000 ₽"
        }
    }


@router.post("/orders/{order_id}/plan")
async def plan_order(order_id: str, planning_data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Plan a specific order"""
    
    return {
        "status": "success",
        "message": f"Заказ {order_id} запланирован",
        "planning_details": {
            "order_id": order_id,
            "assigned_line": planning_data.get("line", "EXTRUDER-1"),
            "scheduled_start": planning_data.get("start_time"),
            "estimated_completion": planning_data.get("completion_time"),
            "materials_reserved": True
        }
    }