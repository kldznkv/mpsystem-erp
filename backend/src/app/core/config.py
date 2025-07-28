from typing import Any, Dict, List, Optional, Union
from pydantic_settings import BaseSettings
import os
from functools import lru_cache

class Settings(BaseSettings):
    # App Info
    PROJECT_NAME: str = "MPSYSTEM"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Server
    SERVER_NAME: str = "MPSYSTEM Backend"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./mpsystem.db"
    )
    
    # Production database connection settings
    DATABASE_CONNECT_ARGS: Dict[str, Any] = {}
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Configure database connection args based on database type
        if self.DATABASE_URL.startswith("postgresql"):
            # PostgreSQL production settings
            self.DATABASE_CONNECT_ARGS = {
                "sslmode": "require",
                "connect_timeout": 10,
            }
        elif self.DATABASE_URL.startswith("sqlite"):
            # SQLite development settings
            self.DATABASE_CONNECT_ARGS = {
                "check_same_thread": False
            }
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = []
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins from environment or defaults"""
        cors_origins = os.getenv("CORS_ORIGINS", "")
        
        if cors_origins:
            origins = [origin.strip() for origin in cors_origins.split(",")]
        else:
            # Default origins based on environment
            if self.ENVIRONMENT == "production":
                origins = [
                    "https://kldznkv.github.io",
                    "https://mpsystem-backend.onrender.com",
                ]
            else:
                origins = [
                    "http://localhost:3000",
                    "http://localhost:8000", 
                    "http://localhost:8080",
                    "https://kldznkv.github.io",
                    "null"
                ]
        
        return origins
    
    @property
    def cors_origins(self) -> List[str]:
        """Dynamic CORS origins based on environment"""
        return self.get_cors_origins()
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Production Security Settings
    ALLOWED_HOSTS: List[str] = ["*"]  # Render handles this
    
    # Health Check Settings
    HEALTH_CHECK_PATH: str = "/health"
    
    # Database Pool Settings (for PostgreSQL)
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    
    # API Rate Limiting
    RATE_LIMIT_ENABLED: bool = os.getenv("ENVIRONMENT", "development") == "production"
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Feature Flags
    ENABLE_SWAGGER_UI: bool = os.getenv("DEBUG", "true").lower() == "true"
    ENABLE_METRICS: bool = True
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"  # Ignore extra environment variables
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Создаем экземпляр настроек
settings = get_settings()

# Database URL validation and logging
import logging
logger = logging.getLogger(__name__)

if settings.DATABASE_URL.startswith("postgresql"):
    logger.info("🐘 Using PostgreSQL database (Production)")
elif settings.DATABASE_URL.startswith("sqlite"):
    logger.info("🗃️ Using SQLite database (Development)")
else:
    logger.warning(f"⚠️ Unknown database type: {settings.DATABASE_URL}")

logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
logger.info(f"🔧 Debug mode: {settings.DEBUG}")
logger.info(f"🌐 CORS origins: {settings.cors_origins}")
