# Backend Code Organization

## Directory Structure

```
/app/backend/
├── main.py                   # Main FastAPI application
├── routes/                   # API route handlers
│   ├── auth/                 # Authentication & user management
│   │   ├── auth_routes.py
│   │   ├── enterprise_auth_routes.py
│   │   ├── user_management_routes.py
│   │   └── org_admin_routes.py
│   ├── workspace/            # Workspace layer features
│   │   ├── workspace_routes.py
│   │   ├── activity_feed_routes.py
│   │   ├── calendar_integration_routes.py
│   │   ├── dashboard_widgets_routes.py
│   │   ├── global_search_routes.py
│   │   ├── bulk_actions_routes.py
│   │   ├── document_management_routes.py
│   │   └── chat_routes.py
│   ├── commerce/             # Commerce solution routes
│   │   ├── commerce_routes.py
│   │   ├── commerce_modules_routes.py
│   │   ├── workflow_routes.py
│   │   ├── parties_routes.py
│   │   └── parties_engine_routes.py
│   ├── finance/              # Finance solution routes
│   │   ├── finance_routes.py
│   │   ├── finance_advanced_routes.py
│   │   ├── finance_events_routes.py
│   │   ├── finance_export_routes.py
│   │   ├── financial_reports_routes.py
│   │   ├── gst_reporting_routes.py
│   │   ├── ib_finance_routes.py
│   │   └── ml_reconciliation_routes.py
│   ├── capital/              # Capital solution routes
│   │   ├── capital_routes.py
│   │   ├── ib_capital_routes.py
│   │   ├── cap_table_scenario_routes.py
│   │   └── governance_engine_routes.py
│   ├── workforce/            # Workforce solution routes
│   │   ├── workforce_routes.py
│   │   └── ib_workforce_routes.py
│   ├── intelligence/         # Intelligence module routes
│   │   ├── intelligence_routes.py
│   │   ├── reports_builder_routes.py
│   │   └── audit_trail_routes.py
│   ├── operations/           # Operations module routes
│   │   ├── operations_routes.py
│   │   ├── sla_monitoring_routes.py
│   │   ├── manufacturing_routes.py
│   │   ├── manufacturing_routes_phase2.py
│   │   └── manufacturing_routes_phase3.py
│   ├── admin/                # Admin & super admin routes
│   │   ├── admin_routes.py
│   │   ├── super_admin_routes.py
│   │   └── super_admin_analytics_routes.py
│   └── integrations/         # External integrations
│       ├── email_campaigns_routes.py
│       ├── email_integration_routes.py
│       ├── workflow_builder_routes.py
│       ├── razorpay_webhook_routes.py
│       ├── webrtc_routes.py
│       ├── engagement_routes.py
│       └── lead_sop_routes.py
├── models/                   # Pydantic & data models
│   ├── auth_models.py
│   ├── auth_masters.py
│   ├── chat_models.py
│   ├── commerce_models.py
│   ├── enterprise_models.py
│   ├── manufacturing_models.py
│   ├── operations_models.py
│   ├── parties_models.py
│   └── workspace_models.py
├── services/                 # Business logic services
│   ├── demo_mode_service.py
│   ├── enrichment_service.py
│   ├── enterprise_auth_service.py
│   ├── gpt_enrichment_service.py
│   ├── razorpay_service.py
│   ├── rbac_engine.py
│   ├── enterprise_middleware.py
│   ├── manufacturing_automation_engine.py
│   ├── manufacturing_validation_engine.py
│   └── auto_sop_workflow.py
├── seeds/                    # Database seed scripts
│   ├── seed_data.py
│   ├── seed_users.py
│   ├── comprehensive_seed.py
│   └── ... (35 seed files)
├── utils/                    # Utility scripts
│   ├── check_all_data.py
│   ├── verify_data.py
│   ├── fix_invoice_totals.py
│   ├── mongodb_atlas_connection.py
│   └── test_helpers.py
├── ib_finance/               # IB Finance sub-module
└── tests/                    # Test files
```

## File Counts
- Routes: 60 files
- Models: 12 files
- Services: 13 files
- Seeds: 35 files
- Utils: 10 files

## Note
Original files remain in backend root for backward compatibility.
New structure is for documentation and future migration.
