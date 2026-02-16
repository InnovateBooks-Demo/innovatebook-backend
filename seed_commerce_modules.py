"""
Seed data for all Commerce modules
"""

from datetime import datetime, timezone
import random

def seed_all_modules(db):
    """Seed all commerce module collections with sample data"""
    
    # Clear existing data
    collections = [
        'catalog_items', 'catalog_pricing', 'catalog_costing', 'catalog_rules', 'catalog_packages',
        'revenue_leads', 'revenue_evaluations', 'revenue_commits', 'revenue_contracts',
        'procurement_requests', 'procurement_evaluations', 'purchase_orders',
        'governance_policies', 'governance_limits', 'governance_authority', 'governance_risks', 'governance_audits'
    ]
    
    for col in collections:
        db[col].delete_many({})
    
    now = datetime.now(timezone.utc).isoformat()
    
    # ============== CATALOG DATA ==============
    
    # Items
    items = [
        {"item_id": "ITEM-001", "item_code": "SKU-001", "name": "Enterprise Software License", "category": "Software", "unit_of_measure": "License", "base_price": 50000, "cost_price": 30000, "status": "active", "created_at": now},
        {"item_id": "ITEM-002", "item_code": "SKU-002", "name": "Cloud Hosting - Annual", "category": "Services", "unit_of_measure": "Year", "base_price": 120000, "cost_price": 80000, "status": "active", "created_at": now},
        {"item_id": "ITEM-003", "item_code": "SKU-003", "name": "Consulting Hours", "category": "Services", "unit_of_measure": "Hour", "base_price": 5000, "cost_price": 2500, "status": "active", "created_at": now},
        {"item_id": "ITEM-004", "item_code": "SKU-004", "name": "Implementation Package", "category": "Services", "unit_of_measure": "Package", "base_price": 200000, "cost_price": 120000, "status": "active", "created_at": now},
        {"item_id": "ITEM-005", "item_code": "SKU-005", "name": "Support - Premium", "category": "Support", "unit_of_measure": "Month", "base_price": 15000, "cost_price": 8000, "status": "active", "created_at": now},
        {"item_id": "ITEM-006", "item_code": "SKU-006", "name": "Training Workshop", "category": "Training", "unit_of_measure": "Session", "base_price": 25000, "cost_price": 10000, "status": "active", "created_at": now},
        {"item_id": "ITEM-007", "item_code": "SKU-007", "name": "API Access - Enterprise", "category": "Software", "unit_of_measure": "Year", "base_price": 75000, "cost_price": 40000, "status": "active", "created_at": now},
        {"item_id": "ITEM-008", "item_code": "SKU-008", "name": "Data Migration Service", "category": "Services", "unit_of_measure": "Project", "base_price": 100000, "cost_price": 60000, "status": "active", "created_at": now},
    ]
    db.catalog_items.insert_many(items)
    
    # Pricing
    pricing = [
        {"pricing_id": "PRC-001", "name": "Standard Pricing", "price_list_type": "standard", "currency": "INR", "base_price": 50000, "discount_percent": 0, "status": "active", "created_at": now},
        {"pricing_id": "PRC-002", "name": "Enterprise Pricing", "price_list_type": "enterprise", "currency": "INR", "base_price": 45000, "discount_percent": 10, "status": "active", "created_at": now},
        {"pricing_id": "PRC-003", "name": "Volume Discount", "price_list_type": "volume", "currency": "INR", "base_price": 40000, "discount_percent": 20, "status": "active", "created_at": now},
        {"pricing_id": "PRC-004", "name": "Partner Pricing", "price_list_type": "partner", "currency": "INR", "base_price": 35000, "discount_percent": 30, "status": "active", "created_at": now},
        {"pricing_id": "PRC-005", "name": "Promotional Pricing", "price_list_type": "promo", "currency": "INR", "base_price": 42000, "discount_percent": 15, "status": "active", "created_at": now},
    ]
    db.catalog_pricing.insert_many(pricing)
    
    # Costing
    costing = [
        {"costing_id": "CST-001", "name": "Software License Cost", "costing_method": "standard", "material_cost": 10000, "labor_cost": 15000, "overhead_cost": 5000, "total_cost": 30000, "status": "active", "created_at": now},
        {"costing_id": "CST-002", "name": "Cloud Hosting Cost", "costing_method": "actual", "material_cost": 50000, "labor_cost": 20000, "overhead_cost": 10000, "total_cost": 80000, "status": "active", "created_at": now},
        {"costing_id": "CST-003", "name": "Consulting Cost", "costing_method": "standard", "material_cost": 0, "labor_cost": 2000, "overhead_cost": 500, "total_cost": 2500, "status": "active", "created_at": now},
        {"costing_id": "CST-004", "name": "Implementation Cost", "costing_method": "project", "material_cost": 20000, "labor_cost": 80000, "overhead_cost": 20000, "total_cost": 120000, "status": "active", "created_at": now},
    ]
    db.catalog_costing.insert_many(costing)
    
    # Rules
    rules = [
        {"rule_id": "RUL-001", "rule_name": "Volume Discount Rule", "rule_type": "pricing", "description": "Apply 10% discount for orders above 5 units", "condition": "quantity > 5", "action": "apply_discount(10)", "priority": 1, "status": "active", "created_at": now},
        {"rule_id": "RUL-002", "rule_name": "Enterprise Customer Rule", "rule_type": "pricing", "description": "Apply enterprise pricing for enterprise customers", "condition": "customer_type == 'enterprise'", "action": "use_price_list('enterprise')", "priority": 2, "status": "active", "created_at": now},
        {"rule_id": "RUL-003", "rule_name": "Minimum Order Rule", "rule_type": "validation", "description": "Minimum order value should be 10000", "condition": "order_value < 10000", "action": "reject_order()", "priority": 1, "status": "active", "created_at": now},
        {"rule_id": "RUL-004", "rule_name": "Approval Rule", "rule_type": "approval", "description": "Orders above 100000 need manager approval", "condition": "order_value > 100000", "action": "require_approval('manager')", "priority": 1, "status": "active", "created_at": now},
    ]
    db.catalog_rules.insert_many(rules)
    
    # Packages
    packages = [
        {"package_id": "PKG-001", "package_name": "Starter Bundle", "description": "Perfect for small businesses", "items": ["ITEM-001", "ITEM-005"], "package_price": 60000, "discount_percent": 8, "status": "active", "created_at": now},
        {"package_id": "PKG-002", "package_name": "Professional Bundle", "description": "For growing businesses", "items": ["ITEM-001", "ITEM-002", "ITEM-005"], "package_price": 170000, "discount_percent": 10, "status": "active", "created_at": now},
        {"package_id": "PKG-003", "package_name": "Enterprise Bundle", "description": "Complete enterprise solution", "items": ["ITEM-001", "ITEM-002", "ITEM-003", "ITEM-004", "ITEM-005"], "package_price": 350000, "discount_percent": 15, "status": "active", "created_at": now},
    ]
    db.catalog_packages.insert_many(packages)
    
    # ============== REVENUE DATA ==============
    
    # Leads
    leads = [
        {"lead_id": "LEAD-001", "lead_name": "TechCorp Solutions", "company_name": "TechCorp Pvt Ltd", "contact_person": "Rajesh Kumar", "email": "rajesh@techcorp.com", "phone": "+91 98765 43210", "source": "website", "status": "qualified", "value": 500000, "probability": 60, "created_at": now},
        {"lead_id": "LEAD-002", "lead_name": "Global Enterprises", "company_name": "Global Enterprises Ltd", "contact_person": "Priya Sharma", "email": "priya@globalent.com", "phone": "+91 87654 32109", "source": "referral", "status": "new", "value": 750000, "probability": 30, "created_at": now},
        {"lead_id": "LEAD-003", "lead_name": "StartupX", "company_name": "StartupX Innovation", "contact_person": "Amit Patel", "email": "amit@startupx.io", "phone": "+91 76543 21098", "source": "linkedin", "status": "contacted", "value": 200000, "probability": 40, "created_at": now},
        {"lead_id": "LEAD-004", "lead_name": "MegaCorp Industries", "company_name": "MegaCorp Industries Pvt Ltd", "contact_person": "Sunita Reddy", "email": "sunita@megacorp.in", "phone": "+91 65432 10987", "source": "trade_show", "status": "proposal", "value": 1200000, "probability": 70, "created_at": now},
        {"lead_id": "LEAD-005", "lead_name": "SmallBiz Solutions", "company_name": "SmallBiz Solutions", "contact_person": "Vikram Singh", "email": "vikram@smallbiz.com", "phone": "+91 54321 09876", "source": "cold_call", "status": "negotiation", "value": 150000, "probability": 80, "created_at": now},
        {"lead_id": "LEAD-006", "lead_name": "Digital First Co", "company_name": "Digital First Company", "contact_person": "Neha Gupta", "email": "neha@digitalfirst.co", "phone": "+91 43210 98765", "source": "website", "status": "won", "value": 300000, "probability": 100, "created_at": now},
    ]
    db.revenue_leads.insert_many(leads)
    
    # Evaluations
    evaluations = [
        {"evaluation_id": "EVAL-001", "name": "TechCorp Technical Review", "lead_id": "LEAD-001", "evaluation_type": "technical", "criteria": "Integration capabilities", "score": 85, "evaluator": "Tech Team", "status": "completed", "created_at": now},
        {"evaluation_id": "EVAL-002", "name": "MegaCorp Commercial Review", "lead_id": "LEAD-004", "evaluation_type": "commercial", "criteria": "Budget and ROI", "score": 90, "evaluator": "Sales Team", "status": "completed", "created_at": now},
        {"evaluation_id": "EVAL-003", "name": "StartupX Fit Assessment", "lead_id": "LEAD-003", "evaluation_type": "fit", "criteria": "Product fit", "score": 70, "evaluator": "Product Team", "status": "pending", "created_at": now},
    ]
    db.revenue_evaluations.insert_many(evaluations)
    
    # Commits
    commits = [
        {"commit_id": "CMT-001", "name": "TechCorp Proposal", "lead_id": "LEAD-001", "commit_type": "proposal", "value": 500000, "terms": "50% advance, 50% on delivery", "validity_days": 30, "status": "sent", "created_at": now},
        {"commit_id": "CMT-002", "name": "MegaCorp Quote", "lead_id": "LEAD-004", "commit_type": "quote", "value": 1200000, "terms": "30% advance, 70% milestone-based", "validity_days": 45, "status": "accepted", "created_at": now},
        {"commit_id": "CMT-003", "name": "SmallBiz Offer", "lead_id": "LEAD-005", "commit_type": "proposal", "value": 150000, "terms": "100% advance", "validity_days": 15, "status": "negotiating", "created_at": now},
    ]
    db.revenue_commits.insert_many(commits)
    
    # Contracts
    contracts = [
        {"contract_id": "CNT-001", "contract_name": "Digital First Annual Contract", "customer_id": "CUST-001", "contract_type": "service", "value": 300000, "start_date": "2024-01-01", "end_date": "2024-12-31", "terms": "Annual service agreement", "status": "active", "created_at": now},
        {"contract_id": "CNT-002", "contract_name": "MegaCorp Implementation", "customer_id": "CUST-002", "contract_type": "project", "value": 1200000, "start_date": "2024-02-01", "end_date": "2024-06-30", "terms": "Fixed price project", "status": "active", "created_at": now},
    ]
    db.revenue_contracts.insert_many(contracts)
    
    # ============== PROCUREMENT DATA ==============
    
    # Procurement Requests
    pr_requests = [
        {"pr_id": "PR-001", "pr_number": "PR-2024-001", "title": "Cloud Infrastructure", "vendor_id": "VEND-001", "items": [{"name": "AWS Credits", "qty": 1, "rate": 500000}], "total_value": 500000, "requested_by": "IT Team", "required_date": "2024-02-15", "status": "approved", "priority": "high", "created_at": now},
        {"pr_id": "PR-002", "pr_number": "PR-2024-002", "title": "Office Supplies", "vendor_id": "VEND-002", "items": [{"name": "Laptops", "qty": 10, "rate": 80000}], "total_value": 800000, "requested_by": "Admin", "required_date": "2024-02-20", "status": "pending", "priority": "medium", "created_at": now},
        {"pr_id": "PR-003", "pr_number": "PR-2024-003", "title": "Software Licenses", "vendor_id": "VEND-003", "items": [{"name": "MS Office", "qty": 50, "rate": 5000}], "total_value": 250000, "requested_by": "IT Team", "required_date": "2024-02-25", "status": "draft", "priority": "low", "created_at": now},
        {"pr_id": "PR-004", "pr_number": "PR-2024-004", "title": "Consulting Services", "vendor_id": "VEND-004", "items": [{"name": "SAP Consulting", "qty": 100, "rate": 10000}], "total_value": 1000000, "requested_by": "Operations", "required_date": "2024-03-01", "status": "approved", "priority": "high", "created_at": now},
    ]
    db.procurement_requests.insert_many(pr_requests)
    
    # Procurement Evaluations
    pr_evals = [
        {"eval_id": "PEVAL-001", "name": "AWS Vendor Evaluation", "pr_id": "PR-001", "vendor_id": "VEND-001", "evaluation_criteria": "Price, SLA, Support", "score": 92, "status": "completed", "created_at": now},
        {"eval_id": "PEVAL-002", "name": "Laptop Vendor Comparison", "pr_id": "PR-002", "vendor_id": "VEND-002", "evaluation_criteria": "Price, Quality, Warranty", "score": 85, "status": "in_progress", "created_at": now},
    ]
    db.procurement_evaluations.insert_many(pr_evals)
    
    # Purchase Orders
    purchase_orders = [
        {"po_id": "PO-001", "po_number": "PO-2024-001", "pr_id": "PR-001", "vendor_id": "VEND-001", "items": [{"name": "AWS Credits", "qty": 1, "rate": 500000}], "total_value": 500000, "delivery_date": "2024-02-15", "payment_terms": "Net 30", "status": "issued", "created_at": now},
        {"po_id": "PO-002", "po_number": "PO-2024-002", "pr_id": "PR-004", "vendor_id": "VEND-004", "items": [{"name": "SAP Consulting", "qty": 100, "rate": 10000}], "total_value": 1000000, "delivery_date": "2024-03-01", "payment_terms": "Net 45", "status": "draft", "created_at": now},
    ]
    db.purchase_orders.insert_many(purchase_orders)
    
    # ============== GOVERNANCE DATA ==============
    
    # Policies
    policies = [
        {"policy_id": "POL-001", "policy_name": "Procurement Policy", "policy_type": "procurement", "description": "Guidelines for procurement activities", "effective_date": "2024-01-01", "review_date": "2024-12-31", "owner": "CFO", "status": "active", "created_at": now},
        {"policy_id": "POL-002", "policy_name": "Travel Policy", "policy_type": "expense", "description": "Travel and expense guidelines", "effective_date": "2024-01-01", "review_date": "2024-12-31", "owner": "HR", "status": "active", "created_at": now},
        {"policy_id": "POL-003", "policy_name": "Data Security Policy", "policy_type": "security", "description": "Data handling and security guidelines", "effective_date": "2024-01-01", "review_date": "2024-06-30", "owner": "CTO", "status": "active", "created_at": now},
        {"policy_id": "POL-004", "policy_name": "Vendor Management Policy", "policy_type": "vendor", "description": "Vendor onboarding and management", "effective_date": "2024-01-01", "review_date": "2024-12-31", "owner": "Procurement", "status": "active", "created_at": now},
    ]
    db.governance_policies.insert_many(policies)
    
    # Limits
    limits = [
        {"limit_id": "LMT-001", "limit_name": "Purchase Approval Limit - Manager", "limit_type": "spending", "threshold_value": 100000, "currency": "INR", "applies_to": "Manager", "period": "per_transaction", "status": "active", "created_at": now},
        {"limit_id": "LMT-002", "limit_name": "Purchase Approval Limit - Director", "limit_type": "spending", "threshold_value": 500000, "currency": "INR", "applies_to": "Director", "period": "per_transaction", "status": "active", "created_at": now},
        {"limit_id": "LMT-003", "limit_name": "Monthly Expense Limit", "limit_type": "expense", "threshold_value": 50000, "currency": "INR", "applies_to": "Employee", "period": "monthly", "status": "active", "created_at": now},
        {"limit_id": "LMT-004", "limit_name": "Credit Limit - Standard", "limit_type": "credit", "threshold_value": 200000, "currency": "INR", "applies_to": "Standard Customer", "period": "rolling", "status": "active", "created_at": now},
    ]
    db.governance_limits.insert_many(limits)
    
    # Authority
    authorities = [
        {"authority_id": "AUTH-001", "authority_name": "Purchase Approver - L1", "role": "Manager", "approval_limit": 100000, "approval_types": ["purchase_request", "expense_claim"], "delegated_to": None, "status": "active", "created_at": now},
        {"authority_id": "AUTH-002", "authority_name": "Purchase Approver - L2", "role": "Director", "approval_limit": 500000, "approval_types": ["purchase_request", "purchase_order"], "delegated_to": None, "status": "active", "created_at": now},
        {"authority_id": "AUTH-003", "authority_name": "Contract Approver", "role": "VP Sales", "approval_limit": 1000000, "approval_types": ["contract", "discount_approval"], "delegated_to": "Sales Director", "status": "active", "created_at": now},
        {"authority_id": "AUTH-004", "authority_name": "Final Approver", "role": "CFO", "approval_limit": 999999999, "approval_types": ["all"], "delegated_to": None, "status": "active", "created_at": now},
    ]
    db.governance_authority.insert_many(authorities)
    
    # Risks
    risks = [
        {"risk_id": "RSK-001", "risk_name": "Vendor Concentration Risk", "risk_type": "operational", "description": "High dependency on single vendor for critical services", "probability": "medium", "impact": "high", "mitigation": "Identify alternative vendors", "owner": "Procurement Head", "status": "mitigating", "created_at": now},
        {"risk_id": "RSK-002", "risk_name": "Currency Fluctuation Risk", "risk_type": "financial", "description": "Exposure to USD/INR fluctuations", "probability": "high", "impact": "medium", "mitigation": "Hedging strategy", "owner": "Treasury", "status": "monitoring", "created_at": now},
        {"risk_id": "RSK-003", "risk_name": "Data Breach Risk", "risk_type": "security", "description": "Potential customer data exposure", "probability": "low", "impact": "high", "mitigation": "Enhanced security controls", "owner": "CISO", "status": "monitoring", "created_at": now},
        {"risk_id": "RSK-004", "risk_name": "Key Person Dependency", "risk_type": "operational", "description": "Critical knowledge held by few individuals", "probability": "medium", "impact": "medium", "mitigation": "Documentation and cross-training", "owner": "HR", "status": "identified", "created_at": now},
    ]
    db.governance_risks.insert_many(risks)
    
    # Audits
    audits = [
        {"audit_id": "AUD-001", "audit_name": "Q1 Internal Audit", "audit_type": "internal", "scope": "Procurement processes", "auditor": "Internal Audit Team", "start_date": "2024-03-01", "end_date": "2024-03-15", "findings": "Minor observations in documentation", "status": "completed", "created_at": now},
        {"audit_id": "AUD-002", "audit_name": "Annual Financial Audit", "audit_type": "external", "scope": "Financial statements", "auditor": "Ernst & Young", "start_date": "2024-04-01", "end_date": "2024-04-30", "findings": None, "status": "planned", "created_at": now},
        {"audit_id": "AUD-003", "audit_name": "IT Security Audit", "audit_type": "compliance", "scope": "Information security controls", "auditor": "KPMG", "start_date": "2024-05-01", "end_date": "2024-05-15", "findings": None, "status": "planned", "created_at": now},
    ]
    db.governance_audits.insert_many(audits)
    
    print("✅ All commerce module data seeded successfully!")
    return True

if __name__ == "__main__":
    from pymongo import MongoClient
    import os
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = MongoClient(mongo_url)
    db = client['innovate_books_db']
    seed_all_modules(db)
