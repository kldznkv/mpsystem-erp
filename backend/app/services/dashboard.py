from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

from app.schemas.dashboard import (
    DashboardMetrics,
    ProductionLineStatus,
    CriticalAlert,
    LineStatus,
    AlertType
)
from app.core.config import settings


class DashboardService:
    """Dashboard business logic service for MPSYSTEM"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_dashboard_metrics(self) -> DashboardMetrics:
        """
        Get the 4 key metrics for MPSYSTEM dashboard
        In real implementation, these would be calculated from database
        """
        
        # TODO: Replace with real database queries
        # For now, returning realistic simulated data matching ТЗ
        
        return DashboardMetrics(
            orders_active=847,  # Count of active orders
            production_capacity=94.2,  # Production capacity utilization %
            oee_efficiency=87.3,  # Overall Equipment Effectiveness
            quality_pass_rate=99.1  # Quality pass rate
        )
    
    async def get_production_lines_status(self) -> List[ProductionLineStatus]:
        """
        Get status of all production lines grouped by type
        Returns data matching the ТЗ structure
        """
        
        lines = []
        
        # 🔄 Extrusion group (4 lines + 2 cutting + laboratory)
        extrusion_lines = [
            {
                "line_id": "extrusion-1",
                "line_name": "Экструзия-1 (рукава)",
                "status": LineStatus.RUNNING,
                "current_order": "ORD-250001",
                "progress_percent": 65,
                "time_remaining": "2ч 30мин осталось",
                "oee_percent": 89.0,
                "queue_count": 3,
                "operator": "Иванов И.И."
            },
            {
                "line_id": "extrusion-2",
                "line_name": "Экструзия-2 (пакеты)",
                "status": LineStatus.RUNNING,
                "current_order": "ORD-250003",
                "progress_percent": 30,
                "time_remaining": "4ч 15мин осталось",
                "oee_percent": 92.0,
                "queue_count": 5,
                "operator": "Петров П.П."
            },
            {
                "line_id": "extrusion-3",
                "line_name": "Экструзия-3",
                "status": LineStatus.RUNNING,
                "current_order": "ORD-250008",
                "progress_percent": 85,
                "time_remaining": "45мин осталось",
                "oee_percent": 94.0,
                "queue_count": 2,
                "operator": "Сидоров С.С."
            },
            {
                "line_id": "extrusion-4",
                "line_name": "Экструзия-4",
                "status": LineStatus.IDLE,
                "current_order": None,
                "progress_percent": 0,
                "time_remaining": None,
                "oee_percent": 0.0,
                "queue_count": 1,
                "operator": "Ожидание материала"
            },
            {
                "line_id": "cutting-1",
                "line_name": "Резка-1",
                "status": LineStatus.RUNNING,
                "current_order": "Резка ORD-250001",
                "progress_percent": 40,
                "time_remaining": "1ч 20мин осталось",
                "oee_percent": 88.0,
                "queue_count": 4,
                "operator": "Резчик А.А."
            },
            {
                "line_id": "cutting-2",
                "line_name": "Резка-2",
                "status": LineStatus.MAINTENANCE,
                "current_order": "Смена ножей",
                "progress_percent": 70,
                "time_remaining": "20мин осталось",
                "oee_percent": 0.0,
                "queue_count": 2,
                "operator": "Техник Б.Б."
            },
            {
                "line_id": "laboratory",
                "line_name": "Лаборатория",
                "status": LineStatus.RUNNING,
                "current_order": "Тест партии №245",
                "progress_percent": 60,
                "time_remaining": "30мин осталось",
                "oee_percent": 95.0,
                "queue_count": 3,
                "operator": "Лаборант В.В."
            }
        ]
        
        # 📄 Lamination group (1 line + cutting)
        lamination_lines = [
            {
                "line_id": "lamination-1",
                "line_name": "Ламинация-1",
                "status": LineStatus.RUNNING,
                "current_order": "ORD-250009",
                "progress_percent": 55,
                "time_remaining": "3ч 45мин осталось",
                "oee_percent": 82.0,
                "queue_count": 7,
                "operator": "Ламинатор Г.Г."
            },
            {
                "line_id": "lamination-cutting",
                "line_name": "Резка ламинации",
                "status": LineStatus.IDLE,
                "current_order": None,
                "progress_percent": 0,
                "time_remaining": None,
                "oee_percent": 0.0,
                "queue_count": 5,
                "operator": "Ожидание ламинации"
            }
        ]
        
        # 🎨 Printing group (2 lines)
        printing_lines = [
            {
                "line_id": "printing-1",
                "line_name": "Флексопечать-1",
                "status": LineStatus.RUNNING,
                "current_order": "ORD-250012",
                "progress_percent": 45,
                "time_remaining": "3ч 10мин осталось",
                "oee_percent": 85.0,
                "queue_count": 4,
                "operator": "Печатник Д.Д."
            },
            {
                "line_id": "printing-2",
                "line_name": "Цифровая печать",
                "status": LineStatus.RUNNING,
                "current_order": "ORD-250015",
                "progress_percent": 20,
                "time_remaining": "1ч 45мин осталось",
                "oee_percent": 78.0,
                "queue_count": 2,
                "operator": "Оператор Е.Е."
            }
        ]
        
        # Combine all lines with group information
        for line_data in extrusion_lines:
            lines.append(ProductionLineStatus(
                line_group="extrusion",
                **line_data
            ))
        
        for line_data in lamination_lines:
            lines.append(ProductionLineStatus(
                line_group="lamination",
                **line_data
            ))
        
        for line_data in printing_lines:
            lines.append(ProductionLineStatus(
                line_group="printing",
                **line_data
            ))
        
        return lines
    
    async def get_critical_alerts(self, limit: int = 10) -> List[CriticalAlert]:
        """
        Get critical alerts matching the ТЗ specification
        """
        
        # TODO: Replace with real database queries
        alerts_data = [
            {
                "alert_id": 1,
                "alert_type": AlertType.CRITICAL,
                "icon": "⚠️",
                "title": "Низкий остаток материала",
                "message": "Гранулы PE (осталось 50кг)",
                "time_ago": "5 мин назад",
                "action_available": True,
                "action_label": "Заказать",
                "action_endpoint": "/api/v1/procurement/emergency-order",
                "module": "warehouse"
            },
            {
                "alert_id": 2,
                "alert_type": AlertType.WARNING,
                "icon": "⏰",
                "title": "Просрочен заказ",
                "message": "ORD-249987 (опоздание: 2 дня)",
                "time_ago": "1 час назад",
                "action_available": True,
                "action_label": "Эскалация",
                "action_endpoint": "/api/v1/orders/escalate",
                "module": "orders"
            },
            {
                "alert_id": 3,
                "alert_type": AlertType.INFO,
                "icon": "🔬",
                "title": "Требуется контроль качества",
                "message": "Партии №243",
                "time_ago": "30 мин назад",
                "action_available": True,
                "action_label": "Запланировать",
                "action_endpoint": "/api/v1/quality/schedule",
                "module": "quality"
            },
            {
                "alert_id": 4,
                "alert_type": AlertType.WARNING,
                "icon": "🔧",
                "title": "Плановое ТО",
                "message": "Экструзия-2 через 2 часа",
                "time_ago": "10 мин назад",
                "action_available": True,
                "action_label": "Подготовить",
                "action_endpoint": "/api/v1/maintenance/prepare",
                "module": "maintenance"
            }
        ]
        
        alerts = []
        for alert_data in alerts_data[:limit]:
            alerts.append(CriticalAlert(
                created_at=datetime.now() - timedelta(minutes=random.randint(5, 120)),
                **alert_data
            ))
        
        return alerts
    
    async def execute_line_action(self, line_id: str, action: str) -> Dict[str, Any]:
        """
        Execute action on production line
        """
        
        # TODO: Implement real line control logic
        action_map = {
            "pause": "поставлена на паузу",
            "start": "запущена",
            "stop": "остановлена",
            "priority": "приоритет изменен",
            "maintenance": "переведена в режим обслуживания"
        }
        
        message = action_map.get(action, "действие выполнено")
        
        return {
            "line_id": line_id,
            "action": action,
            "status": f"Линия {line_id} {message}",
            "timestamp": datetime.now(),
            "estimated_completion": datetime.now() + timedelta(minutes=30)
        }
    
    async def execute_alert_action(self, alert_id: int, action: str) -> Dict[str, Any]:
        """
        Execute action on critical alert
        """
        
        # TODO: Implement real alert action logic
        action_map = {
            "order_material": "Заказ материала отправлен",
            "escalate_order": "Заказ эскалирован",
            "schedule_qc": "Контроль качества запланирован",
            "prepare_maintenance": "Подготовка к ТО начата",
            "acknowledge": "Уведомление принято"
        }
        
        message = action_map.get(action, "Действие выполнено")
        
        return {
            "alert_id": alert_id,
            "action": action,
            "status": message,
            "timestamp": datetime.now(),
            "user": "system"  # TODO: Get from auth context
        }