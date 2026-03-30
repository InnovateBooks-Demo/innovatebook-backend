"""
Revenue Handoff Module — MongoDB Index Initialization Script
Run once per environment (dev, staging, prod) to ensure fast lookups and data integrity.

Usage:
    python scripts/init_handoff_indexes.py

Or integrated into app startup:
    from scripts.init_handoff_indexes import create_handoff_indexes
    await create_handoff_indexes(db)
"""

import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "innovatebook")


async def create_handoff_indexes(db=None):
    """
    Creates all required indexes for the Revenue Handoff collections.
    Safe to run multiple times — uses background=True.
    """
    if db is None:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

    logger.info("[INDEX INIT] Creating Revenue Handoff indexes...")

    # ── revenue_workflow_handoffs ──────────────────────────────────────────
    coll = db.revenue_workflow_handoffs

    # 1. Fast lookups by lead_id (most common query)
    await coll.create_index(
        [("lead_id", ASCENDING)],
        name="idx_handoff_lead_id",
        background=True
    )

    # 2. Unique constraint: one handoff per contract
    await coll.create_index(
        [("contract_id", ASCENDING)],
        name="idx_handoff_contract_id_unique",
        unique=True,
        background=True,
        sparse=True          # allows null contract_id during early init
    )

    # 3. Stage + status filter (dashboard queries: "show all PUSH stage handoffs")
    await coll.create_index(
        [("handoff_stage", ASCENDING), ("handoff_status", ASCENDING)],
        name="idx_handoff_stage_status",
        background=True
    )

    # 4. TTL or monitoring: filter failed handoffs by time
    await coll.create_index(
        [("handoff_status", ASCENDING), ("updated_at", DESCENDING)],
        name="idx_handoff_status_updated",
        background=True
    )

    logger.info("[INDEX INIT] revenue_workflow_handoffs: 4 indexes created ✔")

    # ── ops_work_orders ────────────────────────────────────────────────────
    wo_coll = db.ops_work_orders

    await wo_coll.create_index(
        [("work_order_id", ASCENDING)],
        name="idx_wo_id_unique",
        unique=True,
        background=True
    )
    await wo_coll.create_index(
        [("source_contract_id", ASCENDING)],
        name="idx_wo_contract_id",
        background=True
    )
    logger.info("[INDEX INIT] ops_work_orders: 2 indexes created ✔")

    # ── invoices ───────────────────────────────────────────────────────────
    inv_coll = db.invoices

    await inv_coll.create_index(
        [("id", ASCENDING)],
        name="idx_invoice_id_unique",
        unique=True,
        background=True
    )
    await inv_coll.create_index(
        [("contract_id", ASCENDING)],
        name="idx_invoice_contract_id",
        background=True
    )
    logger.info("[INDEX INIT] invoices: 2 indexes created ✔")

    logger.info("[INDEX INIT] All handoff indexes initialized successfully.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(create_handoff_indexes())
