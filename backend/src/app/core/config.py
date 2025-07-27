from typing import Any, Dict, List, Optional, Union
from pydantic_settings import BaseSettings
import os
from functools import lru_cache

class Settings(BaseSettings):
    # App Info
    PROJECT_NAME: str = "MPSYSTEM"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ENVIRONMENT: str = "development"
    
    # Server
    SERVER_NAME: str = "MPSYSTEM Backend"
    DEBUG: bool = True
    
    # Database - только SQLite
    DATABASE_URL: str = "sqlite:///./mpsystem.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000", 
        "http://localhost:8080",
        "https://kldznkv.github.io",
        "null"
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Создаем экземпляр настроек
settings = get_settings()
