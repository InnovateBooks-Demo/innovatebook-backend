import logging
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, ContextManager
import contextvars

# Context variable for correlation ID
correlation_id_ctx = contextvars.ContextVar("correlation_id", default=None)

# Configuration
DEBUG_AUTH = os.getenv("DEBUG_AUTH", "false").lower() == "true"

class AuthLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        # Ensure handler exists if not already configured
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO if DEBUG_AUTH else logging.WARNING)

    def _get_correlation_id(self) -> str:
        cid = correlation_id_ctx.get()
        if not cid:
            cid = str(uuid.uuid4())
            correlation_id_ctx.set(cid)
        return cid

    def _format_log(self, event: str, level: str, data: Dict[str, Any]) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "correlation_id": self._get_correlation_id(),
            "event": event,
            **data
        }
        return json.dumps(log_entry)

    def info(self, event: str, **kwargs):
        if DEBUG_AUTH:
            self.logger.info(self._format_log(event, "INFO", kwargs))

    def warning(self, event: str, **kwargs):
        self.logger.warning(self._format_log(event, "WARNING", kwargs))

    def error(self, event: str, error: Optional[Exception] = None, **kwargs):
        data = kwargs.copy()
        if error:
            data["error_message"] = str(error)
            data["error_type"] = type(error).__name__
        self.logger.error(self._format_log(event, "ERROR", data))

    def login_attempt(self, email: str, **kwargs):
        self.info("login_attempt", email=email.strip().lower(), **kwargs)

    def login_success(self, email: str, user_id: str, org_id: Optional[str] = None):
        self.info("login_success", email=email.strip().lower(), user_id=user_id, org_id=org_id)

    def login_failure(self, email: str, reason: str, **kwargs):
        self.warning("login_failure", email=email.strip().lower(), reason=reason, **kwargs)

# Global instance or factory
def get_logger(name: str) -> AuthLogger:
    return AuthLogger(name)
