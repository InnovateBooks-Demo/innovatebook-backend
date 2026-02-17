#!/bin/bash

BACKEND_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# Get a lead with score > 0
LEADS=$(curl -s -X GET "${BACKEND_URL}/api/commerce/leads")
echo "$LEADS" | python3 -c "
import json, sys
leads = json.load(sys.stdin)
for lead in leads:
    if lead.get('lead_score', 0) > 0:
        print(f\"Lead ID: {lead['lead_id']}\")
        print(f\"Company: {lead['company_name']}\")
        print(f\"Score: {lead['lead_score']}\")
        print(f\"Category: {lead.get('lead_score_category', 'N/A')}\")
        print('---')
"
