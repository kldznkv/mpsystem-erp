#!/usr/bin/env python3
"""
🏭 MPSYSTEM Production ERP Backend Launcher

Optimized startup script for MPSYSTEM backend with:
- Development and production modes
- Auto-reload for development
- Proper CORS handling for GitHub Pages
- Database initialization
- Health checks
"""

import os
import sys
import uvicorn
import asyncio
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.core.config import settings


def run_backend():
    """Run MPSYSTEM backend with optimized settings"""
    
    # Environment detection
    is_development = settings.DEBUG
    is_production = settings.ENVIRONMENT == "production"
    
    print("🏭 Starting MPSYSTEM Production ERP Backend...")
    print(f"📊 Environment: {settings.ENVIRONMENT}")
    print(f"🔧 Debug Mode: {is_development}")
    print(f"🌐 CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    
    # Configure uvicorn settings
    uvicorn_config = {
        "app": "app.main:app",
        "host": "0.0.0.0",
        "port": int(os.getenv("PORT", 8000)),
        "reload": is_development,
        "reload_dirs": [str(backend_dir)] if is_development else None,
        "log_level": "debug" if is_development else "info",
        "access_log": True,
        "use_colors": True,
    }
    
    # Production optimizations
    if is_production:
        uvicorn_config.update({
            "workers": int(os.getenv("WORKERS", 1)),
            "loop": "uvloop",
            "http": "httptools",
            "reload": False,
            "log_level": "warning"
        })
    
    try:
        print("🚀 Backend starting on http://0.0.0.0:{}".format(uvicorn_config["port"]))
        print("📚 API Documentation: http://localhost:{}/docs".format(uvicorn_config["port"]))
        print("🔄 Auto-reload:", uvicorn_config["reload"])
        print("=" * 60)
        
        uvicorn.run(**uvicorn_config)
        
    except KeyboardInterrupt:
        print("\n🔄 Shutting down MPSYSTEM backend...")
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        sys.exit(1)


async def health_check():
    """Perform basic health checks"""
    try:
        # Check if we can import the app
        from app.main import app
        print("✅ App import successful")
        
        # Check database connection
        from app.db.database import engine
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        print("✅ Database connection successful")
        
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False


def main():
    """Main entry point"""
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Run health checks
    print("🔍 Running health checks...")
    if not asyncio.run(health_check()):
        print("❌ Health checks failed, exiting...")
        sys.exit(1)
    
    print("✅ Health checks passed")
    print()
    
    # Start the backend
    run_backend()


if __name__ == "__main__":
    main()