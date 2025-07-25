#!/usr/bin/env python3
"""
MPSYSTEM Backend Startup Script
FastAPI application entry point
"""
import uvicorn
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["src/app"],
        log_level="info"
    )