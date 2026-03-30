"""
services/handoff_observability.py

Centralized observability layer for the Revenue Handoff module.
Provides:
  - Structured JSON logging (Datadog / ELK compatible)
  - In-process metrics counters (promotes to Prometheus/Datadog if integrated)
  - PUSH execution duration tracking
  - Notification hooks (log-based, swappable for real webhooks)
  - Retry metadata helpers
"""

import json
import time
import logging
import asyncio
import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

# ── JSON Logger ─────────────────────────────────────────────────────────────

class HandoffJsonLogger:
    """
    Emits newline-delimited JSON log entries to the standard Python logger.
    Format is compatible with Datadog, ELK, and Cloud Logging ingestors.

    Each entry includes:
      timestamp, level, service, module, event, and all keyword fields.
    """

    SERVICE = "innovatebook"
    MODULE  = "revenue_handoff"

    def __init__(self):
        self._logger = logging.getLogger("handoff.observability")

    def _emit(self, level: str, event: str, **fields):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level":     level,
            "service":   self.SERVICE,
            "module":    self.MODULE,
            "event":     event,
            **fields
        }
        line = json.dumps(entry, default=str)
        if level == "ERROR":
            self._logger.error(line)
        elif level == "WARNING":
            self._logger.warning(line)
        else:
            self._logger.info(line)

    def info(self, event: str, **fields):
        self._emit("INFO", event, **fields)

    def warning(self, event: str, **fields):
        self._emit("WARNING", event, **fields)

    def error(self, event: str, **fields):
        self._emit("ERROR", event, **fields)


# Singleton
log = HandoffJsonLogger()


# ── In-Process Metrics ───────────────────────────────────────────────────────

class HandoffMetrics:
    """
    Thread-safe in-process counters.
    Swap the increment() implementation for Prometheus/StatsD/Datadog
    by replacing the body — interface stays the same.
    """

    _counters: Dict[str, int] = defaultdict(int)
    _durations: Dict[str, list] = defaultdict(list)

    @classmethod
    def increment(cls, metric: str, tags: Optional[Dict] = None):
        """Increment a named counter and emit a structured log for ingestion."""
        cls._counters[metric] += 1
        log.info(
            "metric.counter",
            metric=metric,
            value=cls._counters[metric],
            tags=tags or {}
        )

    @classmethod
    def record_duration(cls, metric: str, duration_ms: float, tags: Optional[Dict] = None):
        """Record a timing sample and emit a structured log."""
        cls._durations[metric].append(duration_ms)
        log.info(
            "metric.timing",
            metric=metric,
            duration_ms=round(duration_ms, 2),
            tags=tags or {}
        )

    @classmethod
    def snapshot(cls) -> Dict:
        """Return current counter state (useful for health/debug endpoints)."""
        return {
            "counters":  dict(cls._counters),
            "timing_samples": {k: len(v) for k, v in cls._durations.items()}
        }


# ── Timer Context Manager ────────────────────────────────────────────────────

class PushTimer:
    """Usage: async with PushTimer(lead_id) as t: ...; print(t.ms)"""

    def __init__(self, lead_id: str, user_id: str):
        self.lead_id = lead_id
        self.user_id = user_id
        self.ms: float = 0.0
        self._start: float = 0.0

    async def __aenter__(self):
        self._start = time.monotonic()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        self.ms = (time.monotonic() - self._start) * 1000
        HandoffMetrics.record_duration(
            "handoff.push.duration_ms",
            self.ms,
            tags={"lead_id": self.lead_id, "user_id": self.user_id}
        )


# ── Retry Metadata ───────────────────────────────────────────────────────────

async def increment_retry_count(lead_id: str, db) -> int:
    """
    Atomically increments retry_count on the handoff document.
    Returns the new count. Safe to call before each PUSH attempt.
    """
    result = await db.revenue_workflow_handoffs.find_one_and_update(
        {"lead_id": lead_id},
        {"$inc": {"retry_count": 1}},
        return_document=True,
        projection={"retry_count": 1}
    )
    count = (result or {}).get("retry_count", 1)
    log.info(
        "handoff.push.retry",
        lead_id=lead_id,
        retry_count=count
    )
    HandoffMetrics.increment("handoff.push.retries", tags={"lead_id": lead_id})
    return count


# ── Notification Hooks ───────────────────────────────────────────────────────

async def notify_push_success(
    lead_id: str,
    handoff_id: str,
    ops_id: str,
    fin_id: str,
    user_id: str,
    org_id: Optional[str] = None
):
    """
    Fires on successful PUSH completion.
    Currently logs a structured JSON event — swap body for:
      - Slack webhook
      - Email via SMTP
      - Internal event bus / message queue
    """
    log.info(
        "handoff.notification.success",
        lead_id=lead_id,
        handoff_id=handoff_id,
        operations_record_id=ops_id,
        finance_record_id=fin_id,
        executed_by=user_id,
        org_id=org_id,
        notify_targets=["ops_team", "finance_team"],
        message="Revenue Handoff completed. Work Order and Invoice Draft are live."
    )
    HandoffMetrics.increment(
        "handoff.push.completed",
        tags={"lead_id": lead_id, "org_id": org_id or "unknown"}
    )


async def notify_push_partial(
    lead_id: str,
    handoff_id: str,
    errors: list,
    ops_id: Optional[str],
    fin_id: Optional[str],
    user_id: str
):
    """Fires on partial success — one record created, one failed."""
    log.warning(
        "handoff.notification.partial",
        lead_id=lead_id,
        handoff_id=handoff_id,
        operations_record_id=ops_id,
        finance_record_id=fin_id,
        errors=errors,
        executed_by=user_id,
        message="Handoff partially completed. Manual retry required for failed step."
    )
    HandoffMetrics.increment("handoff.push.partial_success", tags={"lead_id": lead_id})


async def notify_push_failure(
    lead_id: str,
    handoff_id: str,
    errors: list,
    user_id: str
):
    """Fires on total push failure — alert-worthy event."""
    log.error(
        "handoff.notification.failure",
        lead_id=lead_id,
        handoff_id=handoff_id,
        errors=errors,
        executed_by=user_id,
        alert=True,
        message="[ALERT] Revenue Handoff PUSH failed completely. Immediate investigation required."
    )
    HandoffMetrics.increment("handoff.push.failed", tags={"lead_id": lead_id})


# ── Soft Timeout Wrapper ─────────────────────────────────────────────────────

PUSH_STEP_TIMEOUT_S = float(os.getenv("HANDOFF_PUSH_STEP_TIMEOUT_S", "10"))


async def with_timeout(coro, label: str) -> Any:
    """
    Runs a coroutine with a soft timeout.
    On timeout → raises TimeoutError with a clear label.
    Caller catches this and records it as a partial failure, not a crash.
    """
    try:
        return await asyncio.wait_for(coro, timeout=PUSH_STEP_TIMEOUT_S)
    except asyncio.TimeoutError:
        log.warning(
            "handoff.push.timeout",
            step=label,
            timeout_seconds=PUSH_STEP_TIMEOUT_S,
            message=f"Step '{label}' timed out after {PUSH_STEP_TIMEOUT_S}s — recorded as partial failure."
        )
        raise TimeoutError(f"Step '{label}' timed out after {PUSH_STEP_TIMEOUT_S}s")
