from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.database import engine
from app.db.base import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting MPSYSTEM ERP Backend...")
    
    # Create database tables
    async with engine.begin() as conn:
        # In production, use Alembic migrations instead
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created")
    yield
    
    # Shutdown
    print("🔄 Shutting down MPSYSTEM ERP Backend...")


app = FastAPI(
    title="MPSYSTEM Production ERP API",
    description="""
    🏭 **MPSYSTEM Production ERP** - Comprehensive Manufacturing Resource Planning System
    
    ## Features
    
    ### 📋 Production Planning
    * **MRP (Material Requirements Planning)** - Automatic material requirements calculation
    * **Production Queue Optimization** - Minimize changeovers (transparent → white → light → dark)
    * **Real-time Production Monitoring** - Track progress across all production lines
    * **Order Planning and Scheduling** - Optimal resource allocation
    
    ### 📦 Warehouse Management
    * **Multi-warehouse System** - MAG 1-9 warehouse structure
    * **Full Traceability** - From raw material to finished product and back
    * **Quality Control** - Document management (CoA, TDS, SDS, DoC)
    * **Inventory Management** - Real-time stock levels and reservations
    
    ### 🛒 Procurement & Purchasing  
    * **Supplier Management** - Comprehensive supplier evaluation system
    * **Automatic Purchase Recommendations** - Based on MRP requirements
    * **Contract & Pricing Management** - Price monitoring and contract lifecycle
    * **Delivery Tracking** - Full order lifecycle from PO to receipt
    
    ### 🔍 Advanced Features
    * **Complete Traceability** - Bidirectional material tracking
    * **Document Management** - Automatic document verification
    * **Quality Assurance** - Batch approval workflows
    * **Cost Calculation** - Real-time production costing
    
    ---
    **Developed for polymer film production industry** 🎬
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Static files for frontend
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Serve frontend
@app.get("/")
async def serve_frontend():
    """Serve the main frontend application"""
    frontend_path = os.path.join(static_dir, "index.html")
    if os.path.exists(frontend_path):
        return FileResponse(frontend_path)
    return {"message": "MPSYSTEM ERP API is running! 🏭", "docs": "/api/docs"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "MPSYSTEM ERP Backend is running",
        "version": "1.0.0"
    }

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )