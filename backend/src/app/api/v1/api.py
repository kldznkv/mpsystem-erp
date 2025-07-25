from fastapi import APIRouter

from app.api.v1.endpoints import dashboard, warehouse, orders

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(warehouse.router, prefix="/warehouse", tags=["warehouse"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])