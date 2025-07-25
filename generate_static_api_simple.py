#!/usr/bin/env python3
"""
🏭 MPSYSTEM Simple Static API Generator for GitHub Pages

This script generates static JSON files without backend dependencies.
"""

import json
import os
from pathlib import Path
from datetime import datetime


def generate_static_api():
    """Generate static API files for GitHub Pages"""
    
    print("🏗️ Generating static API files for GitHub Pages...")
    
    # Create API directory structure
    api_dir = Path("api/v1/dashboard")
    api_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate metrics.json
    print("📊 Generating dashboard metrics...")
    metrics = {
        "orders_active": 847,
        "production_capacity": 94.2,
        "oee_efficiency": 87.3,
        "quality_pass_rate": 99.1
    }
    
    with open(api_dir / "metrics.json", 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    
    # Generate production-lines.json
    print("⚙️ Generating production lines data...")
    production_lines = [
        {
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
        },
        {
            "line_id": "extrusion-2",
            "line_name": "Экструзия-2 (пакеты)",
            "line_group": "extrusion",
            "status": "running",
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
            "line_group": "extrusion",
            "status": "running",
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
            "line_group": "extrusion",
            "status": "idle",
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
            "line_group": "extrusion",
            "status": "running",
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
            "line_group": "extrusion",
            "status": "maintenance",
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
            "line_group": "extrusion",
            "status": "running",
            "current_order": "Тест партии №245",
            "progress_percent": 60,
            "time_remaining": "30мин осталось",
            "oee_percent": 95.0,
            "queue_count": 3,
            "operator": "Лаборант В.В."
        },
        {
            "line_id": "lamination-1",
            "line_name": "Ламинация-1",
            "line_group": "lamination",
            "status": "running",
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
            "line_group": "lamination",
            "status": "idle",
            "current_order": None,
            "progress_percent": 0,
            "time_remaining": None,
            "oee_percent": 0.0,
            "queue_count": 5,
            "operator": "Ожидание ламинации"
        },
        {
            "line_id": "printing-1",
            "line_name": "Флексопечать-1",
            "line_group": "printing",
            "status": "running",
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
            "line_group": "printing",
            "status": "running",
            "current_order": "ORD-250015",
            "progress_percent": 20,
            "time_remaining": "1ч 45мин осталось",
            "oee_percent": 78.0,
            "queue_count": 2,
            "operator": "Оператор Е.Е."
        }
    ]
    
    with open(api_dir / "production-lines.json", 'w', encoding='utf-8') as f:
        json.dump(production_lines, f, indent=2, ensure_ascii=False)
    
    # Generate alerts.json
    print("🚨 Generating critical alerts...")
    alerts = [
        {
            "alert_id": 1,
            "alert_type": "critical",
            "icon": "⚠️",
            "title": "Низкий остаток материала",
            "message": "Гранулы PE (осталось 50кг)",
            "time_ago": "5 мин назад",
            "action_available": True,
            "action_label": "Заказать",
            "action_endpoint": "/api/v1/procurement/emergency-order",
            "module": "warehouse",
            "created_at": "2024-01-20T10:30:00Z"
        },
        {
            "alert_id": 2,
            "alert_type": "warning",
            "icon": "⏰",
            "title": "Просрочен заказ",
            "message": "ORD-249987 (опоздание: 2 дня)",
            "time_ago": "1 час назад",
            "action_available": True,
            "action_label": "Эскалация",
            "action_endpoint": "/api/v1/orders/escalate",
            "module": "orders",
            "created_at": "2024-01-20T09:30:00Z"
        },
        {
            "alert_id": 3,
            "alert_type": "info",
            "icon": "🔬",
            "title": "Требуется контроль качества",
            "message": "Партии №243",
            "time_ago": "30 мин назад",
            "action_available": True,
            "action_label": "Запланировать",
            "action_endpoint": "/api/v1/quality/schedule",
            "module": "quality",
            "created_at": "2024-01-20T10:00:00Z"
        },
        {
            "alert_id": 4,
            "alert_type": "warning",
            "icon": "🔧",
            "title": "Плановое ТО",
            "message": "Экструзия-2 через 2 часа",
            "time_ago": "10 мин назад",
            "action_available": True,
            "action_label": "Подготовить",
            "action_endpoint": "/api/v1/maintenance/prepare",
            "module": "maintenance",
            "created_at": "2024-01-20T10:20:00Z"
        }
    ]
    
    with open(api_dir / "alerts.json", 'w', encoding='utf-8') as f:
        json.dump(alerts, f, indent=2, ensure_ascii=False)
    
    # Generate overview.json
    print("📋 Generating overview...")
    overview = {
        "metrics": metrics,
        "production_lines": production_lines,
        "critical_alerts": alerts[:5],
        "last_updated": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "auto_refresh_seconds": 30
    }
    
    with open(api_dir / "overview.json", 'w', encoding='utf-8') as f:
        json.dump(overview, f, indent=2, ensure_ascii=False)
    
    # Generate system status
    print("🔍 Generating system status...")
    status = {
        "status": "online",
        "system": "MPSYSTEM Production ERP",
        "version": "1.0.0",
        "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "uptime": "GitHub Pages Static API",
        "database": "Static JSON Files",
        "environment": "GitHub Pages"
    }
    
    with open(api_dir / "status.json", 'w', encoding='utf-8') as f:
        json.dump(status, f, indent=2, ensure_ascii=False)
    
    print("✅ Static API files generated successfully!")
    print(f"📁 Files created in: {api_dir.absolute()}")
    print("📄 Generated files:")
    for file in api_dir.glob("*.json"):
        print(f"  - {file.name}")


def create_cors_headers():
    """Create .htaccess file for CORS headers"""
    
    htaccess_content = """# MPSYSTEM CORS Headers for API access
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Set JSON files MIME type
<Files "*.json">
    ForceType application/json
    Header set Content-Type "application/json; charset=utf-8"
</Files>
"""
    
    with open(".htaccess", 'w') as f:
        f.write(htaccess_content)
    
    print("📄 Created .htaccess for CORS support")


def create_readme():
    """Create README for API directory"""
    
    api_readme = """# 🏭 MPSYSTEM Static API

This directory contains static JSON files that provide API data for the MPSYSTEM frontend when deployed on GitHub Pages.

## 📊 Available Endpoints

| File | URL | Description |
|------|-----|-------------|
| `metrics.json` | `/api/v1/dashboard/metrics.json` | Key dashboard metrics |
| `production-lines.json` | `/api/v1/dashboard/production-lines.json` | Production line status |
| `alerts.json` | `/api/v1/dashboard/alerts.json` | Critical alerts |
| `overview.json` | `/api/v1/dashboard/overview.json` | Complete dashboard data |
| `status.json` | `/api/v1/dashboard/status.json` | System status |

## 🌐 Live Access

```
https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/metrics.json
https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/production-lines.json
https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/alerts.json
```

## 🔄 Auto-Generation

These files are automatically generated by GitHub Actions on each deployment.
"""
    
    api_dir = Path("api")
    api_dir.mkdir(exist_ok=True)
    
    with open(api_dir / "README.md", 'w', encoding='utf-8') as f:
        f.write(api_readme)
    
    print("📚 Created API directory README")


if __name__ == "__main__":
    print("🏭 MPSYSTEM Simple Static API Generator")
    print("=" * 50)
    
    # Generate static API files
    generate_static_api()
    
    # Create CORS headers
    create_cors_headers()
    
    # Create README
    create_readme()
    
    print("=" * 50)
    print("🎯 GitHub Pages static backend ready!")
    print("🔗 Access at: https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/")