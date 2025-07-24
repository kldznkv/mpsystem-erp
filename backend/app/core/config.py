from pydantic_settings import BaseSettings
from typing import List, Union
import os


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "MPSYSTEM Production ERP"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./mpsystem_erp.db"
    # For PostgreSQL: "postgresql+asyncpg://user:password@localhost/mpsystem_erp"
    
    # Security settings
    SECRET_KEY: str = "mpsystem-erp-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://kldznkv.github.io",
        "*"  # Remove in production
    ]
    
    # Redis settings (for caching and Celery)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Email settings (for notifications)
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # Production settings
    FIRST_SUPERUSER_EMAIL: str = "admin@mpsystem.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin123"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Warehouse settings
    WAREHOUSES: List[str] = [
        "MAG-1",     # Raw materials
        "MAG-1.1",   # ADR dangerous goods
        "MAG-2",     # Extrusion
        "MAG-3",     # UV treatment
        "MAG-4",     # Printing
        "MAG-5",     # Lamination + Finished goods
        "MAG-6",     # Barrier coating
        "MAG-7",     # Slitting
        "MAG-8",     # Bag making
        "MAG-9"      # Sleeve cutting
    ]
    
    # Production lines
    PRODUCTION_LINES: List[str] = [
        "EXTRUDER-1",
        "EXTRUDER-2", 
        "UV-LINE-1",
        "PRINT-LINE-1",
        "PRINT-LINE-2",
        "LAMINATOR-1",
        "SLITTER-1",
        "SLITTER-2",
        "BAG-MAKER-1",
        "BAG-MAKER-2"
    ]
    
    # Material types
    MATERIAL_TYPES: List[str] = [
        "GRANULATE_LDPE",
        "GRANULATE_HDPE", 
        "GRANULATE_PP",
        "INK_PRINTING",
        "ADHESIVE_PU",
        "ADHESIVE_ACRYLIC",
        "FILM_BASE_BOPP",
        "FILM_BASE_PET",
        "SOLVENT",
        "ADDITIVE"
    ]
    
    # Quality statuses
    QUALITY_STATUSES: List[str] = [
        "PENDING",      # Waiting for QC
        "APPROVED",     # Approved for use
        "BLOCKED",      # Blocked - do not use
        "QUARANTINE",   # Under investigation
        "RELEASED"      # Released from quarantine
    ]
    
    # Order statuses
    ORDER_STATUSES: List[str] = [
        "NEW",              # New order received
        "PLANNED",          # Added to production queue
        "IN_PRODUCTION",    # Currently being produced
        "COMPLETED",        # Production completed
        "SHIPPED",          # Shipped to customer
        "CANCELLED"         # Order cancelled
    ]
    
    # Purchase order statuses
    PO_STATUSES: List[str] = [
        "DRAFT",           # Being prepared
        "SENT",            # Sent to supplier
        "CONFIRMED",       # Confirmed by supplier
        "IN_TRANSIT",      # In delivery
        "DELIVERED",       # Delivered to warehouse
        "CANCELLED"        # Cancelled
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Create upload directory if it doesn't exist
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)