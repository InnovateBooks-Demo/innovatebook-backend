import os
from pathlib import Path
from dotenv import load_dotenv
import logging

# Load environment variables from .env if it exists
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

class Settings:
    """
    Centralized configuration for the SaaS backend.
    Enforces required environment variables for production readiness.
    """
    
    # --- CRITICAL VARIABLES (No Fallbacks allowed) ---
    try:
        MONGO_URL: str = os.environ["MONGO_URL"]
        DB_NAME: str = os.environ.get("DB_NAME", "innovate_books_db")
        
        JWT_SECRET_KEY: str = os.environ["JWT_SECRET_KEY"]
        FRONTEND_URL: str = os.environ["FRONTEND_URL"]
        PORTAL_URL: str = os.environ["PORTAL_URL"]
        
    except KeyError as e:
        logger.error(f"CRITICAL CONFIG ERROR: Missing required environment variable {e}")
        # In a real production environment, we want to fail fast
        raise EnvironmentError(f"Missing required environment variable: {e}")

    # --- SECURITY ---
    JWT_ALGORITHM: str = os.environ.get("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # --- EMAIL CONFIG (Optional but enforced for production link generation) ---
    SMTP_HOST: str = os.environ.get("SMTP_HOST")
    SMTP_PORT: int = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER: str = os.environ.get("SMTP_USER")
    SMTP_PASS: str = os.environ.get("SMTP_PASS")
    
    # --- THIRD PARTY ---
    RAZORPAY_KEY_ID: str = os.environ.get("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str = os.environ.get("RAZORPAY_KEY_SECRET")
    SENDGRID_API_KEY: str = os.environ.get("SENDGRID_API_KEY")
    EMERGENT_LLM_KEY: str = os.environ.get("EMERGENT_LLM_KEY")

    # --- SYSTEM ---
    DEBUG: bool = os.environ.get("DEBUG", "false").lower() == "true"
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "production")

# Instantiate settings
settings = Settings()
