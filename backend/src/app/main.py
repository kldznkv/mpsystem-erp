from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time
from typing import Dict, Any

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.init_db import init_db, check_db_initialized, get_db_stats

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting MPSYSTEM ERP Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    try:
        # Initialize database
        logger.info("Initializing database...")
        init_db()
        logger.info("✅ Database initialization completed")
        
        # Get database statistics
        db_stats = get_db_stats()
        if db_stats["initialized"]:
            logger.info(f"✅ Database ready - Total records: {db_stats['total_records']}")
            for table, count in db_stats["tables"].items():
                logger.info(f"   - {table}: {count} records")
        else:
            logger.warning(f"⚠️ Database initialization issues: {db_stats.get('error', 'Unknown error')}")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        # Don't raise here - let the app start anyway for debugging
        logger.warning("⚠️ Starting application without database initialization")
    
    logger.info("✅ MPSYSTEM Backend started successfully")
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down MPSYSTEM ERP Backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MPSYSTEM - Material Production System ERP Backend API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info(f"CORS enabled for origins: {settings.BACKEND_CORS_ORIGINS}")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount static files (if needed)
# app.mount("/static", StaticFiles(directory="static"), name="static")


# Middleware for request logging and timing
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing information"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log request info
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    # Add timing header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response


# Root endpoint
@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with basic API information"""
    db_stats = get_db_stats()
    
    return {
        "message": "Welcome to MPSYSTEM ERP Backend API",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": f"{settings.API_V1_STR}/docs",
        "status": "operational",
        "database": {
            "initialized": db_stats["initialized"],
            "total_records": db_stats["total_records"],
            "tables": db_stats["tables"]
        }
    }


# Health check endpoint
@app.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Comprehensive health check endpoint"""
    
    # Check database health
    db_stats = get_db_stats()
    db_healthy = db_stats["initialized"]
    
    # Overall health status
    healthy = db_healthy
    
    health_data = {
        "status": "healthy" if healthy else "unhealthy",
        "timestamp": time.time(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "healthy": db_healthy,
            "initialized": db_stats["initialized"],
            "total_records": db_stats["total_records"],
            "tables": db_stats["tables"],
            "error": db_stats.get("error")
        },
        "checks": {
            "database": "pass" if db_healthy else "fail",
        }
    }
    
    status_code = 200 if healthy else 503
    return JSONResponse(content=health_data, status_code=status_code)


# Database management endpoints (debug only)
@app.get("/db-stats", response_model=Dict[str, Any])
async def database_stats():
    """Get detailed database statistics"""
    return get_db_stats()


@app.post("/db-init")
async def initialize_database():
    """Manually initialize database (debug endpoint)"""
    if not settings.DEBUG:
        return JSONResponse(
            content={"error": "Database initialization only available in debug mode"},
            status_code=403
        )
    
    try:
        init_db()
        db_stats = get_db_stats()
        
        return {
            "message": "Database initialized successfully",
            "stats": db_stats
        }
    except Exception as e:
        logger.error(f"Manual database initialization failed: {e}")
        return JSONResponse(
            content={"error": f"Database initialization failed: {str(e)}"},
            status_code=500
        )


# Configuration info endpoint  
@app.get("/config", response_model=Dict[str, Any])
async def config_info():
    """Get basic configuration information"""
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "api_v1_str": settings.API_V1_STR,
        "cors_origins": [str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    }


# Exception handler for general errors
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "timestamp": time.time(),
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )