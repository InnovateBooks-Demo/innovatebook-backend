import sys
import os
from datetime import datetime, timezone
import uuid

# Add current directory to path for imports
sys.path.append('d:\\Work\\innovatebook-backend')

from models.commerce_models import (
    RevenueHandoff, 
    HandoffStage, 
    HandoffStatus,
    HandoffMetadata,
    MappingSnapshot,
    ValidationStatus
)

def test_models():
    try:
        metadata = HandoffMetadata(
            currency="INR",
            total_value=150000.0,
            payment_terms="Net 30",
            captured_at=datetime.now(timezone.utc)
        )
        
        mapping = MappingSnapshot(
            ops_mapping=[{"item_id": "item1", "delivery_owner_id": "owner1"}],
            finance_mapping=[],
            immutable=False
        )
        
        handoff = RevenueHandoff(
            handoff_id="REV-HO-2026-0001",
            lead_id="L1",
            contract_id="C1",
            onboarding_id="O1",
            handoff_metadata=metadata,
            mapped_data=mapping
        )
        
        print("Models validated successfully!")
        print(f"Handoff ID: {handoff.handoff_id}")
        return True
    except Exception as e:
        print(f"Model validation failed: {e}")
        return False

if __name__ == "__main__":
    if test_models():
        sys.exit(0)
    else:
        sys.exit(1)
