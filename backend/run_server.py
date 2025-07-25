#!/usr/bin/env python3
"""
MPSYSTEM Backend Development Server Runner

This script starts the FastAPI development server with hot reload,
proper logging, and displays useful information for developers.
"""

import uvicorn
import sys
import os
import logging
from pathlib import Path

# Add the src directory to Python path
backend_dir = Path(__file__).parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Main function to start the development server"""
    
    # Server configuration
    HOST = "0.0.0.0"
    PORT = 8000
    
    logger.info("🚀 Starting MPSYSTEM Development Server...")
    logger.info(f"📂 Backend directory: {backend_dir}")
    logger.info(f"📂 Source directory: {src_dir}")
    
    # Check if src directory exists
    if not src_dir.exists():
        logger.error(f"❌ Source directory not found: {src_dir}")
        logger.error("Please make sure you're running this script from the backend directory")
        sys.exit(1)
    
    # Display server information
    print("\n" + "="*60)
    print("🏭 MPSYSTEM ERP Backend Development Server")
    print("="*60)
    print(f"🌐 Server URL: http://{HOST}:{PORT}")
    print(f"📚 API Documentation: http://{HOST}:{PORT}/api/v1/docs")
    print(f"📖 ReDoc: http://{HOST}:{PORT}/api/v1/redoc")
    print(f"❤️ Health Check: http://{HOST}:{PORT}/health")
    print(f"📊 Database Stats: http://{HOST}:{PORT}/db-stats")
    print("="*60)
    print("💡 Features:")
    print("   • Hot reload enabled (files will auto-restart server)")
    print("   • Database auto-initialization with sample data")
    print("   • Comprehensive API documentation")
    print("   • Request logging and timing")
    print("   • CORS enabled for frontend development")
    print("="*60)
    print("🔧 Development Commands:")
    print("   • Ctrl+C to stop server")
    print("   • Check logs for database initialization status")
    print("   • Visit /api/v1/docs for interactive API testing")
    print("="*60)
    print()
    
    try:
        # Start the server
        uvicorn.run(
            "app.main:app",
            host=HOST,
            port=PORT,
            reload=True,
            reload_dirs=[str(src_dir)],
            log_level="info",
            access_log=True,
            # Additional uvicorn settings for development
            reload_excludes=[
                "*.pyc", 
                "*.pyo", 
                "*~", 
                ".*", 
                "__pycache__",
                "*.db",
                "*.sqlite*"
            ],
            loop="auto",
            http="auto"
        )
    
    except KeyboardInterrupt:
        logger.info("\n🛑 Server stopped by user")
        print("\n👋 MPSYSTEM Development Server stopped")
        
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        print(f"\n❌ Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   • Make sure you're in the backend directory")
        print("   • Check that all dependencies are installed: pip install -r requirements.txt")
        print("   • Verify database connection settings in .env file")
        sys.exit(1)


if __name__ == "__main__":
    main()