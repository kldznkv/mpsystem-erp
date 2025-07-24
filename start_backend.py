#!/usr/bin/env python3
"""
MPSYSTEM ERP Backend Startup Script
"""

import uvicorn
import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting MPSYSTEM ERP Backend...")
    print("📍 API Documentation: http://localhost:8000/api/docs")
    print("🌐 Frontend: http://localhost:8000")
    print("❤️ Health Check: http://localhost:8000/health")
    print("-" * 50)
    
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )