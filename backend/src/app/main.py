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
from app.db.database import create_database, check_db_health, get_db_info

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
    
    # Create database tables
    try:
        create_database()
        logger.info("✅ Database initialized successfully")
        
        # Log database info
        db_info = get_db_info()
        logger.info(f"Database type: {db_info['database_type']}")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    # Check database health
    if check_db_health():
        logger.info("✅ Database health check passed")
    else:
        logger.warning("⚠️ Database health check failed")
    
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
    return {
        "message": "Welcome to MPSYSTEM ERP Backend API",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": f"{settings.API_V1_STR}/docs",
        "status": "operational"
    }


# Health check endpoint
@app.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Comprehensive health check endpoint"""
    
    # Check database health
    db_healthy = check_db_health()
    
    # Get database info
    db_info = get_db_info()
    
    # Overall health status
    healthy = db_healthy
    
    health_data = {
        "status": "healthy" if healthy else "unhealthy",
        "timestamp": time.time(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "healthy": db_healthy,
            "type": db_info["database_type"],
        },
        "checks": {
            "database": "pass" if db_healthy else "fail",
        }
    }
    
    status_code = 200 if healthy else 503
    return JSONResponse(content=health_data, status_code=status_code)


# Database info endpoint
@app.get("/db-info", response_model=Dict[str, Any])
async def database_info():
    """Get database connection information"""
    if settings.DEBUG:
        return get_db_info()
    else:
        return {"message": "Database info only available in debug mode"}


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
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )