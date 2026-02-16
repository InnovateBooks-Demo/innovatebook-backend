"""
Manufacturing Lead Module - Phase 3: Automation Engine
Implements 20+ automation rules for manufacturing lead lifecycle
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books_db']


class ManufacturingAutomationEngine:
    """Automation engine for manufacturing leads"""
    
    def __init__(self):
        self.automation_rules = []
        self.register_all_rules()
    
    def register_all_rules(self):
        """Register all 20+ automation rules"""
        self.automation_rules = [
            self.auto_assign_sales_rep,
            self.auto_send_rfq_acknowledgment,
            self.auto_detect_duplicate_leads,
            self.auto_enrich_customer_profile,
            self.auto_suggest_bom_sku,
            self.auto_create_engineering_task,
            self.auto_create_production_task,
            self.auto_create_qc_task,
            self.auto_run_costing_engine,
            self.auto_identify_margin_exceptions,
            self.auto_trigger_approvals,
            self.auto_create_sample_work_order,
            self.auto_escalate_overdue_tasks,
            self.auto_send_missing_info_reminder,
            self.auto_lock_converted_lead,
            self.auto_create_evaluate_record,
            self.auto_generate_analytics_events,
            self.auto_check_capacity_availability,
            self.auto_check_rm_availability,
            self.auto_validate_delivery_date,
            self.auto_assign_tooling,
            self.auto_check_certifications,
            self.auto_calculate_risk_score,
            self.auto_notify_stakeholders,
        ]
    
    async def execute_automation(self, trigger: str, lead_data: Dict[str, Any]):
        """Execute automation rules based on trigger"""
        results = []
        
        for rule in self.automation_rules:
            try:
                result = await rule(trigger, lead_data)
                if result:
                    results.append(result)
            except Exception as e:
                print(f"Error in automation rule {rule.__name__}: {e}")
        
        return results
    
    # ========================================================================
    # AUTOMATION RULES (20+)
    # ========================================================================
    
    async def auto_assign_sales_rep(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 1: Auto-assign sales rep based on region/product"""
        if trigger != "lead_created":
            return None
        
        # Logic: Assign based on customer region
        customer_region = lead_data.get('customer_industry', '')
        
        # Simple assignment logic (can be enhanced with master data lookup)
        sales_rep_mapping = {
            'Automotive': 'sales-rep-automotive',
            'Aerospace': 'sales-rep-aerospace',
            'Electronics & PCB': 'sales-rep-electronics',
        }
        
        assigned_to = sales_rep_mapping.get(customer_region, 'sales-rep-general')
        
        # Update lead
        await db['mfg_leads'].update_one(
            {'lead_id': lead_data['lead_id']},
            {'$set': {'assigned_to': assigned_to, 'assigned_to_name': f'Sales Rep - {customer_region}'}}
        )
        
        return {"rule": "auto_assign_sales_rep", "action": f"Assigned to {assigned_to}"}
    
    async def auto_send_rfq_acknowledgment(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 2: Send RFQ acknowledgment email to customer"""
        if trigger != "lead_created":
            return None
        
        # Mock email sending (integrate with actual email service)
        email_content = {
            "to": lead_data.get('contact_email'),
            "subject": f"RFQ Acknowledgment - {lead_data['lead_id']}",
            "body": f"Thank you for your RFQ. We will respond within 48 hours."
        }
        
        # Log email event
        await db['mfg_automation_logs'].insert_one({
            "lead_id": lead_data['lead_id'],
            "automation_type": "email_sent",
            "details": email_content,
            "timestamp": datetime.utcnow()
        })
        
        return {"rule": "auto_send_rfq_acknowledgment", "action": "Acknowledgment email sent"}
    
    async def auto_detect_duplicate_leads(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 3: Detect duplicate leads"""
        if trigger != "lead_created":
            return None
        
        # Search for potential duplicates
        duplicates = await db['mfg_leads'].find({
            'customer_id': lead_data.get('customer_id'),
            'product_description': lead_data.get('product_description'),
            'lead_id': {'$ne': lead_data['lead_id']},
            'created_at': {'$gte': datetime.utcnow() - timedelta(days=30)}
        }).to_list(length=10)
        
        if duplicates:
            # Flag as potential duplicate
            await db['mfg_leads'].update_one(
                {'lead_id': lead_data['lead_id']},
                {'$set': {'potential_duplicate': True, 'duplicate_lead_ids': [d['lead_id'] for d in duplicates]}}
            )
            
            return {"rule": "auto_detect_duplicate_leads", "action": f"Found {len(duplicates)} potential duplicates"}
        
        return None
    
    async def auto_enrich_customer_profile(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 4: Enrich customer profile from GST/ERP"""
        if trigger != "lead_created":
            return None
        
        # Mock enrichment (integrate with actual GST API / ERP)
        customer_id = lead_data.get('customer_id')
        
        enrichment_data = {
            "credit_rating": "A",
            "annual_revenue": 5000000000,
            "employee_count": 5000,
            "enriched_at": datetime.utcnow()
        }
        
        await db['mfg_customers'].update_one(
            {'id': customer_id},
            {'$set': enrichment_data}
        )
        
        return {"rule": "auto_enrich_customer_profile", "action": "Customer profile enriched"}
    
    async def auto_suggest_bom_sku(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 5: Suggest BOM/SKU based on product description"""
        if trigger != "lead_created":
            return None
        
        # Simple keyword matching (can be enhanced with ML)
        product_desc = lead_data.get('product_description', '').lower()
        
        suggestions = []
        if 'gear' in product_desc:
            suggestions.append({'sku_id': 'SKU-TRN-001', 'confidence': 0.8})
        elif 'cylinder head' in product_desc:
            suggestions.append({'sku_id': 'SKU-ENG-001', 'confidence': 0.9})
        
        if suggestions:
            await db['mfg_leads'].update_one(
                {'lead_id': lead_data['lead_id']},
                {'$set': {'suggested_skus': suggestions}}
            )
            
            return {"rule": "auto_suggest_bom_sku", "action": f"Suggested {len(suggestions)} SKUs"}
        
        return None
    
    async def auto_create_engineering_task(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 6: Auto-create Engineering feasibility task"""
        if trigger != "stage_changed" or lead_data.get('current_stage') != 'Feasibility':
            return None
        
        task = {
            "id": f"TASK-ENG-{lead_data['lead_id']}",
            "lead_id": lead_data['lead_id'],
            "task_type": "Engineering Feasibility",
            "assigned_to_role": "Engineering Lead",
            "due_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            "status": "Open",
            "created_at": datetime.utcnow()
        }
        
        await db['mfg_tasks'].insert_one(task)
        
        return {"rule": "auto_create_engineering_task", "action": "Engineering task created"}
    
    async def auto_create_production_task(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 7: Auto-create Production feasibility task"""
        if trigger != "stage_changed" or lead_data.get('current_stage') != 'Feasibility':
            return None
        
        task = {
            "id": f"TASK-PROD-{lead_data['lead_id']}",
            "lead_id": lead_data['lead_id'],
            "task_type": "Production Feasibility",
            "assigned_to_role": "Production Manager",
            "due_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            "status": "Open",
            "created_at": datetime.utcnow()
        }
        
        await db['mfg_tasks'].insert_one(task)
        
        return {"rule": "auto_create_production_task", "action": "Production task created"}
    
    async def auto_create_qc_task(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 8: Auto-create QC feasibility task"""
        if trigger != "stage_changed" or lead_data.get('current_stage') != 'Feasibility':
            return None
        
        task = {
            "id": f"TASK-QC-{lead_data['lead_id']}",
            "lead_id": lead_data['lead_id'],
            "task_type": "QC Feasibility",
            "assigned_to_role": "QC Manager",
            "due_date": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "status": "Open",
            "created_at": datetime.utcnow()
        }
        
        await db['mfg_tasks'].insert_one(task)
        
        return {"rule": "auto_create_qc_task", "action": "QC task created"}
    
    async def auto_run_costing_engine(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 9: Auto-run costing engine when BOM is available"""
        if trigger != "bom_attached":
            return None
        
        # Simple costing calculation (can be enhanced with actual BOM data)
        bom_id = lead_data.get('bom_id')
        quantity = lead_data.get('quantity', 1)
        
        # Mock costing
        material_cost = 1000 * quantity
        labor_cost = 500 * quantity
        overhead_cost = 200 * quantity
        
        costing = {
            "material_cost": material_cost,
            "labor_cost": labor_cost,
            "overhead_cost": overhead_cost,
            "total_cost_per_unit": material_cost + labor_cost + overhead_cost,
            "calculated_at": datetime.utcnow()
        }
        
        await db['mfg_leads'].update_one(
            {'lead_id': lead_data['lead_id']},
            {'$set': {'costing': costing}}
        )
        
        return {"rule": "auto_run_costing_engine", "action": "Costing calculated"}
    
    async def auto_identify_margin_exceptions(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 10: Identify margin exceptions"""
        if trigger != "costing_completed":
            return None
        
        costing = lead_data.get('costing', {})
        margin_pct = costing.get('margin_percentage', 0)
        
        # Flag if margin is below threshold (e.g., 15%)
        if margin_pct < 15:
            await db['mfg_leads'].update_one(
                {'lead_id': lead_data['lead_id']},
                {'$set': {'margin_exception': True, 'requires_pricing_manager_approval': True}}
            )
            
            return {"rule": "auto_identify_margin_exceptions", "action": "Margin exception flagged"}
        
        return None
    
    async def auto_trigger_approvals(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 11: Auto-trigger approval workflow"""
        if trigger != "stage_changed" or lead_data.get('current_stage') != 'Approval':
            return None
        
        # Determine required approvals based on lead value and risk
        approvals_required = ["Technical", "Pricing"]
        
        # Add additional approvals based on conditions
        if lead_data.get('quantity', 0) * lead_data.get('costing', {}).get('quoted_price', 0) > 10000000:
            approvals_required.append("Management")
        
        if lead_data.get('risk_level') == 'High':
            approvals_required.append("Compliance")
        
        # Create approval records
        approvals = []
        for approval_type in approvals_required:
            approvals.append({
                "approval_type": approval_type,
                "status": "Pending",
                "submitted_at": datetime.utcnow()
            })
        
        await db['mfg_leads'].update_one(
            {'lead_id': lead_data['lead_id']},
            {'$set': {'approvals': approvals, 'approval_status': 'Pending'}}
        )
        
        return {"rule": "auto_trigger_approvals", "action": f"Triggered {len(approvals_required)} approvals"}
    
    async def auto_create_sample_work_order(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 12: Auto-create sample work order"""
        if not lead_data.get('sample_required'):
            return None
        
        if trigger != "sample_approved":
            return None
        
        work_order = {
            "wo_number": f"WO-SAMPLE-{lead_data['lead_id']}",
            "lead_id": lead_data['lead_id'],
            "type": "Sample",
            "quantity": lead_data.get('sample_quantity', 1),
            "due_date": (datetime.utcnow() + timedelta(days=lead_data.get('sample_lead_time', 30))).isoformat(),
            "status": "Open",
            "created_at": datetime.utcnow()
        }
        
        await db['mfg_work_orders'].insert_one(work_order)
        
        return {"rule": "auto_create_sample_work_order", "action": f"Sample WO {work_order['wo_number']} created"}
    
    async def auto_escalate_overdue_tasks(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 13: Auto-escalate overdue tasks"""
        if trigger != "task_check":
            return None
        
        # Find overdue tasks
        overdue_tasks = await db['mfg_tasks'].find({
            'lead_id': lead_data['lead_id'],
            'status': 'Open',
            'due_date': {'$lt': datetime.utcnow().isoformat()}
        }).to_list(length=100)
        
        if overdue_tasks:
            # Escalate to manager
            for task in overdue_tasks:
                await db['mfg_tasks'].update_one(
                    {'id': task['id']},
                    {'$set': {'escalated': True, 'escalated_at': datetime.utcnow()}}
                )
            
            return {"rule": "auto_escalate_overdue_tasks", "action": f"Escalated {len(overdue_tasks)} tasks"}
        
        return None
    
    async def auto_send_missing_info_reminder(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 14: Send reminder for missing info"""
        if trigger != "info_check":
            return None
        
        # Check for missing critical fields
        missing_fields = []
        
        if not lead_data.get('technical_specs'):
            missing_fields.append('technical_specs')
        if not lead_data.get('bom_id'):
            missing_fields.append('bom_id')
        
        if missing_fields and (datetime.utcnow() - datetime.fromisoformat(lead_data['created_at'])).days > 2:
            # Send reminder email
            await db['mfg_automation_logs'].insert_one({
                "lead_id": lead_data['lead_id'],
                "automation_type": "reminder_sent",
                "details": {"missing_fields": missing_fields},
                "timestamp": datetime.utcnow()
            })
            
            return {"rule": "auto_send_missing_info_reminder", "action": f"Reminder sent for {len(missing_fields)} fields"}
        
        return None
    
    async def auto_lock_converted_lead(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 15: Auto-lock lead when converted"""
        if trigger != "lead_converted":
            return None
        
        await db['mfg_leads'].update_one(
            {'lead_id': lead_data['lead_id']},
            {'$set': {'locked': True, 'locked_at': datetime.utcnow(), 'locked_by': 'System'}}
        )
        
        return {"rule": "auto_lock_converted_lead", "action": "Lead locked"}
    
    async def auto_create_evaluate_record(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 16: Auto-create Evaluate record"""
        if trigger != "lead_converted":
            return None
        
        evaluate_record = {
            "evaluate_id": f"EVAL-{lead_data['lead_id'].split('-')[-1]}",
            "lead_id": lead_data['lead_id'],
            "customer_id": lead_data['customer_id'],
            "quoted_price": lead_data.get('costing', {}).get('quoted_price'),
            "status": "Draft",
            "created_at": datetime.utcnow()
        }
        
        await db['evaluates'].insert_one(evaluate_record)
        
        return {"rule": "auto_create_evaluate_record", "action": f"Evaluate {evaluate_record['evaluate_id']} created"}
    
    async def auto_generate_analytics_events(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 17: Generate analytics events"""
        analytics_event = {
            "event_type": trigger,
            "lead_id": lead_data['lead_id'],
            "customer_id": lead_data.get('customer_id'),
            "industry": lead_data.get('customer_industry'),
            "value": lead_data.get('quantity', 0) * lead_data.get('costing', {}).get('quoted_price', 0),
            "timestamp": datetime.utcnow()
        }
        
        await db['mfg_analytics_events'].insert_one(analytics_event)
        
        return {"rule": "auto_generate_analytics_events", "action": "Analytics event generated"}
    
    async def auto_check_capacity_availability(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 18: Check capacity availability"""
        if trigger != "production_feasibility_check":
            return None
        
        # Mock capacity check
        required_capacity = lead_data.get('quantity', 0) * 0.5  # hours
        
        # Check if capacity available
        # This would integrate with actual capacity planning system
        capacity_available = True  # Mock
        
        if not capacity_available:
            await db['mfg_leads'].update_one(
                {'lead_id': lead_data['lead_id']},
                {'$set': {'capacity_constraint': True}}
            )
            
            return {"rule": "auto_check_capacity_availability", "action": "Capacity constraint identified"}
        
        return None
    
    async def auto_check_rm_availability(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 19: Check raw material availability"""
        if trigger != "production_feasibility_check":
            return None
        
        # Mock RM availability check
        rm_available = True  # Mock
        
        if not rm_available:
            await db['mfg_leads'].update_one(
                {'lead_id': lead_data['lead_id']},
                {'$set': {'rm_constraint': True}}
            )
            
            return {"rule": "auto_check_rm_availability", "action": "RM constraint identified"}
        
        return None
    
    async def auto_validate_delivery_date(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 20: Validate delivery date feasibility"""
        if trigger != "lead_created":
            return None
        
        delivery_date = datetime.fromisoformat(lead_data['delivery_date_required'])
        min_lead_time = 60  # days
        
        if (delivery_date - datetime.now()).days < min_lead_time:
            await db['mfg_leads'].update_one(
                {'lead_id': lead_data['lead_id']},
                {'$set': {'delivery_date_risk': True, 'risk_level': 'High'}}
            )
            
            return {"rule": "auto_validate_delivery_date", "action": "Delivery date risk flagged"}
        
        return None
    
    async def auto_assign_tooling(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 21: Auto-assign tooling"""
        if trigger != "bom_attached":
            return None
        
        # Check if tooling required
        if lead_data.get('tooling_required'):
            # Find available tooling
            # Mock assignment
            await db['mfg_leads'].update_one(
                {'lead_id': lead_data['lead_id']},
                {'$set': {'assigned_tooling_id': 'TOOL-001'}}
            )
            
            return {"rule": "auto_assign_tooling", "action": "Tooling assigned"}
        
        return None
    
    async def auto_check_certifications(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 22: Check required certifications"""
        if trigger != "lead_created":
            return None
        
        required_certs = lead_data.get('technical_specs', {}).get('certifications_required', [])
        
        if required_certs:
            # Check plant certifications
            # Mock check
            missing_certs = []
            
            if missing_certs:
                await db['mfg_leads'].update_one(
                    {'lead_id': lead_data['lead_id']},
                    {'$set': {'certification_gap': True, 'missing_certifications': missing_certs}}
                )
                
                return {"rule": "auto_check_certifications", "action": f"{len(missing_certs)} certifications missing"}
        
        return None
    
    async def auto_calculate_risk_score(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 23: Calculate overall risk score"""
        if trigger != "lead_created":
            return None
        
        risk_score = 0
        
        # Calculate risk based on various factors
        if lead_data.get('priority') == 'Urgent':
            risk_score += 20
        if lead_data.get('technical_specs', {}).get('tolerances'):
            risk_score += 15
        if lead_data.get('quantity', 0) > 10000:
            risk_score += 10
        if not lead_data.get('sku_id'):
            risk_score += 25  # New product
        
        # Determine risk level
        if risk_score > 50:
            risk_level = 'High'
        elif risk_score > 25:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'
        
        await db['mfg_leads'].update_one(
            {'lead_id': lead_data['lead_id']},
            {'$set': {'risk_score': risk_score, 'risk_level': risk_level}}
        )
        
        return {"rule": "auto_calculate_risk_score", "action": f"Risk score: {risk_score} ({risk_level})"}
    
    async def auto_notify_stakeholders(self, trigger: str, lead_data: Dict[str, Any]):
        """Rule 24: Notify relevant stakeholders"""
        # Notify on key events
        if trigger in ["lead_created", "stage_changed", "approval_completed"]:
            # Mock notification
            await db['mfg_notifications'].insert_one({
                "lead_id": lead_data['lead_id'],
                "notification_type": trigger,
                "recipients": ["sales-manager", "assigned-rep"],
                "timestamp": datetime.utcnow()
            })
            
            return {"rule": "auto_notify_stakeholders", "action": "Stakeholders notified"}
        
        return None


# Global automation engine instance
automation_engine = ManufacturingAutomationEngine()
