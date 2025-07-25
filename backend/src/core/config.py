import os
from typing import Optional, List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MPSYSTEM Production ERP"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./mpsystem.db"
    )
    
    # CORS Settings for frontend
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080", 
        "https://kldznkv.github.io",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:3000"
    ]
    
    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "mpsystem-secret-key-change-in-production"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Production Settings
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # File Storage
    UPLOAD_FOLDER: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Real-time Updates
    WEBSOCKET_ENABLED: bool = True
    UPDATE_INTERVAL_SECONDS: int = 30
    
    # Production Lines Configuration
    PRODUCTION_LINES: dict = {
        "extrusion": {
            "lines": ["extrusion-1", "extrusion-2", "extrusion-3", "extrusion-4"],
            "types": ["sleeves", "bags", "film"]
        },
        "lamination": {
            "lines": ["lamination-1"],
            "types": ["multilayer"]
        },
        "printing": {
            "lines": ["flexo-1", "digital-1"],
            "types": ["flexographic", "digital"]
        },
        "cutting": {
            "lines": ["cutting-1", "cutting-2", "lamination-cutting"],
            "types": ["roll_cutting", "sheet_cutting"]
        },
        "quality": {
            "lines": ["laboratory"],
            "types": ["testing", "analysis"]
        }
    }
    
    # Warehouse Configuration
    WAREHOUSES: List[str] = [
        "MAG-1", "MAG-2", "MAG-3", "MAG-4", "MAG-5",
        "MAG-6", "MAG-7", "MAG-8", "MAG-9"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()