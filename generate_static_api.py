#!/usr/bin/env python3
"""
🏭 MPSYSTEM Static API Generator for GitHub Pages

This script generates static JSON files that mimic the FastAPI backend
for deployment on GitHub Pages where dynamic backend is not supported.
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.services.dashboard import DashboardService
from app.db.database import AsyncSessionLocal


async def generate_static_api():
    """Generate static API files for GitHub Pages"""
    
    print("🏗️ Generating static API files for GitHub Pages...")
    
    # Create API directory structure
    api_dir = Path("api/v1/dashboard")
    api_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Initialize database session
        async with AsyncSessionLocal() as session:
            service = DashboardService(session)
            
            print("📊 Generating dashboard metrics...")
            # Generate metrics.json
            metrics = await service.get_dashboard_metrics()
            with open(api_dir / "metrics.json", 'w', encoding='utf-8') as f:
                json.dump(metrics.dict(), f, indent=2, ensure_ascii=False)
            
            print("⚙️ Generating production lines data...")
            # Generate production-lines.json
            lines = await service.get_production_lines_status()
            with open(api_dir / "production-lines.json", 'w', encoding='utf-8') as f:
                json.dump([line.dict() for line in lines], f, indent=2, ensure_ascii=False)
            
            print("🚨 Generating critical alerts...")
            # Generate alerts.json
            alerts = await service.get_critical_alerts()
            with open(api_dir / "alerts.json", 'w', encoding='utf-8') as f:
                json.dump([alert.dict() for alert in alerts], f, indent=2, ensure_ascii=False, default=str)
            
            print("📋 Generating overview...")
            # Generate overview.json
            overview = {
                'metrics': metrics.dict(),
                'production_lines': [line.dict() for line in lines],
                'critical_alerts': [alert.dict() for alert in alerts[:5]],
                'last_updated': '2024-01-20T10:00:00Z',
                'auto_refresh_seconds': 30
            }
            with open(api_dir / "overview.json", 'w', encoding='utf-8') as f:
                json.dump(overview, f, indent=2, ensure_ascii=False, default=str)
            
            print("🔍 Generating system status...")
            # Generate system status
            status = {
                "status": "online",
                "system": "MPSYSTEM Production ERP",
                "version": "1.0.0",
                "timestamp": "2024-01-20T10:00:00Z",
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
                
    except Exception as e:
        print(f"❌ Error generating static API: {e}")
        sys.exit(1)


def create_cors_headers():
    """Create .htaccess file for CORS headers (for Apache servers)"""
    
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

| File | Endpoint Simulation | Description |
|------|---------------------|-------------|
| `metrics.json` | `GET /api/v1/dashboard/metrics` | Key dashboard metrics |
| `production-lines.json` | `GET /api/v1/dashboard/production-lines` | Production line status |
| `alerts.json` | `GET /api/v1/dashboard/alerts` | Critical alerts |
| `overview.json` | `GET /api/v1/dashboard/overview` | Complete dashboard data |
| `status.json` | `GET /api/v1/dashboard/system/status` | System status |

## 🔄 Auto-Generation

These files are automatically generated by GitHub Actions on each deployment.

## 🌐 Usage

Frontend accesses these files as:
```javascript
const response = await fetch('./api/v1/dashboard/metrics.json');
const data = await response.json();
```

## 🔧 Manual Regeneration

To regenerate locally:
```bash
python generate_static_api.py
```
"""
    
    api_dir = Path("api")
    api_dir.mkdir(exist_ok=True)
    
    with open(api_dir / "README.md", 'w', encoding='utf-8') as f:
        f.write(api_readme)
    
    print("📚 Created API directory README")


if __name__ == "__main__":
    print("🏭 MPSYSTEM Static API Generator")
    print("=" * 50)
    
    # Generate static API files
    asyncio.run(generate_static_api())
    
    # Create CORS headers
    create_cors_headers()
    
    # Create README
    create_readme()
    
    print("=" * 50)
    print("🎯 GitHub Pages static backend ready!")
    print("🔗 Access at: https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/")