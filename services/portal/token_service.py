from config import settings

# Shared portal secret from settings
PORTAL_SECRET_KEY = settings.JWT_SECRET_KEY

class TokenService:
    @staticmethod
    def generate_portal_token() -> str:
        """Generates a secure, URL-safe random token."""
        return secrets.token_urlsafe(32)
        
    @staticmethod
    def hash_token(token: str) -> str:
        """Create a cryptographic hash of the token for DB storage."""
        # Using a fixed secret key to salt the hash
        payload = f"{token}:{PORTAL_SECRET_KEY}".encode('utf-8')
        return hashlib.sha256(payload).hexdigest()
        
    @staticmethod
    def calculate_expiry(days: int = 7) -> str:
        """Calculate ISO-8601 expiry date."""
        expiry = datetime.now(timezone.utc) + timedelta(days=days)
        return expiry.isoformat()
