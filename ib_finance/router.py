"""
IB Finance - Main Router
Aggregates all module routers into a single router for the IB Finance module
"""
from fastapi import APIRouter

# Import all module routers
from .billing import router as billing_router
from .receivables import router as receivables_router
from .payables import router as payables_router
from .ledger import router as ledger_router
from .assets import router as assets_router
from .tax import router as tax_router
from .statements import router as statements_router
from .period_close import router as period_close_router
from .dashboard import router as dashboard_router
from .seed import router as seed_router

# Create main router with prefix
router = APIRouter(prefix="/api/ib-finance", tags=["IB Finance"])

# Include all module routers
router.include_router(dashboard_router)
router.include_router(seed_router)
router.include_router(billing_router)
router.include_router(receivables_router)
router.include_router(payables_router)
router.include_router(ledger_router)
router.include_router(assets_router)
router.include_router(tax_router)
router.include_router(statements_router)
router.include_router(period_close_router)
