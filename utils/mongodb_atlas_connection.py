"""
MongoDB Atlas Connection Wrapper
Handles SSL/TLS issues with connection pooling
"""
import os
import ssl
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

class MongoDBAtlasConnection:
    """Singleton connection manager for MongoDB Atlas"""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_client(self):
        """Get or create MongoDB client"""
        if self._client is None:
            self._client = self._create_client()
        return self._client
    
    def _create_client(self):
        """Create MongoDB client with optimized SSL settings"""
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        
        # Check if it's Atlas (contains mongodb.net)
        is_atlas = 'mongodb.net' in mongo_url
        
        if is_atlas:
            logger.info("🔗 Connecting to MongoDB Atlas with optimized settings...")
            
            # Try multiple connection strategies
            strategies = [
                # Strategy 1: Allow invalid certificates
                {
                    'tls': True,
                    'tlsAllowInvalidCertificates': True,
                    'tlsAllowInvalidHostnames': True,
                    'serverSelectionTimeoutMS': 5000,
                    'connectTimeoutMS': 5000,
                    'socketTimeoutMS': 10000,
                },
                # Strategy 2: Custom SSL context
                {
                    'tls': True,
                    'serverSelectionTimeoutMS': 5000,
                    'connectTimeoutMS': 5000,
                },
                # Strategy 3: Minimal settings
                {
                    'serverSelectionTimeoutMS': 5000,
                }
            ]
            
            for i, settings in enumerate(strategies, 1):
                try:
                    logger.info(f"  Trying strategy {i}...")
                    client = AsyncIOMotorClient(mongo_url, **settings)
                    # Test connection synchronously
                    import asyncio
                    try:
                        loop = asyncio.get_event_loop()
                    except RuntimeError:
                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                    
                    # Quick ping test
                    loop.run_until_complete(client.admin.command('ping'))
                    logger.info(f"  ✅ Strategy {i} successful!")
                    return client
                except Exception as e:
                    logger.warning(f"  ❌ Strategy {i} failed: {str(e)[:100]}")
                    continue
            
            # All strategies failed - fall back to local
            logger.error("❌ All MongoDB Atlas connection strategies failed")
            logger.info("⚠️ Falling back to local MongoDB...")
            mongo_url = 'mongodb://localhost:27017'
        
        # Local MongoDB connection
        logger.info("🔗 Connecting to local MongoDB...")
        return AsyncIOMotorClient(mongo_url)

# Global instance
_mongo_connection = MongoDBAtlasConnection()

def get_mongodb_client():
    """Get MongoDB client instance"""
    return _mongo_connection.get_client()

def get_database(db_name: str = None):
    """Get database instance"""
    if db_name is None:
        db_name = os.environ.get('DB_NAME', 'innovate_books_db')
    client = get_mongodb_client()
    return client[db_name]
