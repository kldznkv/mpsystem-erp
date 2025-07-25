from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from app.db.database import SessionLocal, engine, create_database
from app.db.init_data import create_all_sample_data

logger = logging.getLogger(__name__)


def init_db() -> None:
    """
    Initialize database with tables and sample data.
    Called on application startup.
    """
    logger.info("🚀 Initializing MPSYSTEM database...")
    
    try:
        # Create database tables
        logger.info("Creating database tables...")
        create_database()
        logger.info("✅ Database tables created successfully")
        
        # Check database health
        db = SessionLocal()
        try:
            # Test database connection
            result = db.execute(text("SELECT 1")).scalar()
            if result == 1:
                logger.info("✅ Database connection test successful")
            else:
                logger.warning("⚠️ Database connection test returned unexpected result")
            
            # Create sample data
            logger.info("Creating sample data...")
            sample_data_result = create_all_sample_data(db)
            
            if sample_data_result["success"]:
                logger.info(f"✅ {sample_data_result['message']}")
            else:
                logger.error(f"❌ {sample_data_result['message']}")
                
        except Exception as e:
            logger.error(f"❌ Error during database initialization: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        raise


def check_db_initialized() -> bool:
    """
    Check if database is properly initialized.
    
    Returns:
        bool: True if database is initialized, False otherwise
    """
    try:
        db = SessionLocal()
        try:
            # Check if we can connect and tables exist
            from app.models.orders import Order
            
            # Try to count orders (this will fail if table doesn't exist)
            order_count = db.query(Order).count()
            logger.info(f"Database check: {order_count} orders found")
            
            return True
            
        except Exception as e:
            logger.warning(f"Database not initialized: {e}")
            return False
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to check database status: {e}")
        return False


def reset_db() -> None:
    """
    Reset database by dropping and recreating all tables.
    WARNING: This will delete all data!
    """
    logger.warning("🔄 Resetting database - ALL DATA WILL BE LOST!")
    
    try:
        from app.db.database import drop_database
        
        # Drop all tables
        logger.info("Dropping all tables...")
        drop_database()
        logger.info("✅ All tables dropped")
        
        # Recreate everything
        init_db()
        logger.info("✅ Database reset completed")
        
    except Exception as e:
        logger.error(f"❌ Failed to reset database: {e}")
        raise


def get_db_stats() -> dict:
    """
    Get database statistics.
    
    Returns:
        dict: Database statistics including table counts
    """
    stats = {
        "initialized": False,
        "tables": {},
        "total_records": 0,
        "error": None
    }
    
    try:
        db = SessionLocal()
        try:
            from app.models.orders import Order
            
            # Count orders
            order_count = db.query(Order).count()
            stats["tables"]["orders"] = order_count
            stats["total_records"] += order_count
            
            # Add other model counts here when they exist
            # stats["tables"]["materials"] = db.query(Material).count()
            # stats["tables"]["suppliers"] = db.query(Supplier).count()
            
            stats["initialized"] = True
            logger.info(f"Database stats: {stats}")
            
        except Exception as e:
            stats["error"] = str(e)
            logger.error(f"Failed to get database stats: {e}")
        finally:
            db.close()
            
    except Exception as e:
        stats["error"] = str(e)
        logger.error(f"Failed to connect to database: {e}")
    
    return stats


def create_sample_data_if_empty() -> dict:
    """
    Create sample data only if database is empty.
    
    Returns:
        dict: Result of sample data creation
    """
    logger.info("Checking if sample data creation is needed...")
    
    try:
        db = SessionLocal()
        try:
            from app.models.orders import Order
            
            order_count = db.query(Order).count()
            
            if order_count > 0:
                message = f"Sample data already exists ({order_count} orders), skipping creation"
                logger.info(message)
                return {
                    "success": True,
                    "created": False,
                    "message": message,
                    "existing_count": order_count
                }
            
            # Create sample data
            result = create_all_sample_data(db)
            result["created"] = True
            
            return result
            
        except Exception as e:
            logger.error(f"Error checking/creating sample data: {e}")
            db.rollback()
            return {
                "success": False,
                "created": False,
                "message": f"Error: {str(e)}",
                "error": str(e)
            }
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return {
            "success": False,
            "created": False,
            "message": f"Database connection error: {str(e)}",
            "error": str(e)
        }


# Export main functions
__all__ = [
    "init_db",
    "check_db_initialized", 
    "reset_db",
    "get_db_stats",
    "create_sample_data_if_empty"
]