#!/usr/bin/env python3
"""
Production startup script for MPSYSTEM Backend on Render.com
"""
import os
import sys
import logging
from pathlib import Path

# Add src directory to Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def main():
    """Start the application in production mode"""
    
    # Environment validation
    required_env_vars = [
        "DATABASE_URL",
        "SECRET_KEY"
    ]
    
    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        sys.exit(1)
    
    # Validate paths
    if not src_dir.exists():
        logger.error(f"Source directory not found: {src_dir}")
        sys.exit(1)
    
    app_main = src_dir / "app" / "main.py"
    if not app_main.exists():
        logger.error(f"Application main file not found: {app_main}")
        sys.exit(1)
    
    # Production configuration
    port = int(os.getenv("PORT", 10000))
    host = "0.0.0.0"
    workers = int(os.getenv("WEB_CONCURRENCY", 1))
    
    logger.info("🚀 Starting MPSYSTEM Backend in Production Mode")
    logger.info(f"Port: {port}")
    logger.info(f"Host: {host}")
    logger.info(f"Workers: {workers}")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'production')}")
    
    # Start with Gunicorn
    try:
        import gunicorn.app.wsgiapp as wsgi
        
        # Gunicorn configuration
        gunicorn_args = [
            "gunicorn",
            "--bind", f"{host}:{port}",
            "--workers", str(workers),
            "--worker-class", "uvicorn.workers.UvicornWorker",
            "--access-logfile", "-",
            "--error-logfile", "-",
            "--log-level", "info",
            "--timeout", "120",
            "--keep-alive", "5",
            "--max-requests", "1000",
            "--max-requests-jitter", "100",
            "--preload",
            "app.main:app"
        ]
        
        logger.info(f"Starting Gunicorn with args: {' '.join(gunicorn_args[1:])}")
        
        # Change to src directory for proper imports
        os.chdir(src_dir)
        
        # Start Gunicorn
        sys.argv = gunicorn_args
        wsgi.run()
        
    except ImportError:
        logger.warning("Gunicorn not available, falling back to Uvicorn")
        
        # Fallback to Uvicorn
        import uvicorn
        
        os.chdir(src_dir)
        
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            log_level="info",
            access_log=True,
            loop="auto",
            reload=False
        )
    
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()