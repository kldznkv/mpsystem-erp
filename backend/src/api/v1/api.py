from fastapi import APIRouter

from app.api.v1.endpoints import (
    dashboard,
    planning,
    warehouse,
    procurement,
    production,
    quality,
    reports
)

api_router = APIRouter()

# Include all module routers
api_router.include_router(
    dashboard.router, 
    prefix="/dashboard", 
    tags=["📊 Dashboard"]
)

api_router.include_router(
    planning.router, 
    prefix="/planning", 
    tags=["📋 Production Planning"]
)

api_router.include_router(
    warehouse.router, 
    prefix="/warehouse", 
    tags=["📦 Warehouse Management"]
)

api_router.include_router(
    procurement.router, 
    prefix="/procurement", 
    tags=["🛒 Procurement & Purchasing"]
)

api_router.include_router(
    production.router, 
    prefix="/production", 
    tags=["🏭 Production Management"]
)

api_router.include_router(
    quality.router, 
    prefix="/quality", 
    tags=["🔍 Quality Control"]
)

api_router.include_router(
    reports.router, 
    prefix="/reports", 
    tags=["📈 Reports & Analytics"]
)