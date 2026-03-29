import secrets
import hashlib
from datetime import datetime, timezone, timedelta

def generate_portal_token():
    """Generates a secure URL-safe token and its SHA256 hash."""
    raw_token = secrets.token_urlsafe(32)
    hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()
    return raw_token, hashed_token

def generate_token_expiry(days: int = 7):
    """Calculates the expiry time for a token."""
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
