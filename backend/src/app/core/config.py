from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings
import os
from functools import lru_cache


class Settings(BaseSettings):
    # App Info
    PROJECT_NAME: str = "MPSYSTEM"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Server
    SERVER_NAME: str = "MPSYSTEM Backend"
    SERVER_HOST: AnyHttpUrl = "http://localhost"
    DEBUG: bool = False
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "mpsystem"
    POSTGRES_PORT: str = "5432"
    DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info) -> str:
        if isinstance(v, str) and v:
            return v
        
        # Build PostgreSQL URL from components
        values = info.data if hasattr(info, 'data') else {}
        postgres_server = values.get("POSTGRES_SERVER", "localhost")
        postgres_user = values.get("POSTGRES_USER", "postgres")
        postgres_password = values.get("POSTGRES_PASSWORD", "password")
        postgres_db = values.get("POSTGRES_DB", "mpsystem")
        postgres_port = values.get("POSTGRES_PORT", "5432")
        
        return f"postgresql://{postgres_user}:{postgres_password}@{postgres_server}:{postgres_port}/{postgres_db}"

    # SQLite fallback for development
    SQLITE_URL: str = "sqlite:///./mpsystem.db"
    
    # Use PostgreSQL if available, fallback to SQLite
    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return self.SQLITE_URL

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8080",
        "https://kldznkv.github.io",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str):
            return [v]
        return []

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"

    # Security
    FIRST_SUPERUSER: str = "admin@mpsystem.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin123"

    # Email (for future use)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Redis (for caching, future use)
    REDIS_URL: str = "redis://localhost:6379"

    # File uploads
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Production settings
    ENVIRONMENT: str = "development"  # development, staging, production

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Create settings instance
settings = get_settings()