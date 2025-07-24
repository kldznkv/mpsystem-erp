#!/usr/bin/env python3
"""
MPSYSTEM ERP Backend Startup Script
"""

import uvicorn
import os
import sys
import asyncio

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def check_and_init_database():
    """Check if database exists and initialize if needed"""
    try:
        from backend.app.db.database import AsyncSessionLocal
        from backend.app.models.warehouse import Warehouse
        from sqlalchemy import select
        
        # Check if database has data
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Warehouse).limit(1))
            warehouse = result.scalar_one_or_none()
            
            if not warehouse:
                print("📦 Database is empty, initializing with sample data...")
                from backend.app.db.init_data import init_database
                await init_database()
                print("✅ Database initialized successfully")
            else:
                print("✅ Database already contains data")
                
    except Exception as e:
        print(f"⚠️ Database check failed: {e}")
        print("📦 Initializing database...")
        try:
            from backend.app.db.init_data import init_database
            await init_database()
            print("✅ Database initialized successfully")
        except Exception as init_error:
            print(f"❌ Database initialization failed: {init_error}")

if __name__ == "__main__":
    print("🚀 Starting MPSYSTEM ERP Backend...")
    print("-" * 50)
    
    # Initialize database if needed
    print("🔍 Checking database...")
    asyncio.run(check_and_init_database())
    
    print("-" * 50)
    print("📍 API Documentation: http://localhost:8000/api/docs")
    print("🌐 Frontend: http://localhost:8000")
    print("❤️ Health Check: http://localhost:8000/health")
    print("📊 Warehouse API: http://localhost:8000/api/v1/warehouse")
    print("-" * 50)
    
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )