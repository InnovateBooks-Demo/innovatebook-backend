"""
Manufacturing Lead Module - Phase 3: Reports & Analytics Module
Implements comprehensive analytics and reporting for manufacturing leads
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books_db']


class ManufacturingAnalytics:
    """Analytics engine for manufacturing leads"""
    
    async def get_pipeline_summary(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get pipeline summary with stage-wise metrics
        
        Returns:
            - Total leads by stage
            - Lead value by stage
            - Conversion rates
            - Average deal size
        """
        pipeline = []
        
        # Apply filters
        if filters:
            match_stage = {}
            if filters.get('industry'):
                match_stage['customer_industry'] = filters['industry']
            if filters.get('region'):
                match_stage['customer_region'] = filters['region']
            if filters.get('plant_id'):
                match_stage['plant_id'] = filters['plant_id']
            if filters.get('date_from'):
                match_stage['created_at'] = {'$gte': filters['date_from']}
            if filters.get('date_to'):
                if 'created_at' in match_stage:
                    match_stage['created_at']['$lte'] = filters['date_to']
                else:
                    match_stage['created_at'] = {'$lte': filters['date_to']}
            
            if match_stage:
                pipeline.append({'$match': match_stage})
        
        # Group by stage
        pipeline.extend([
            {
                '$group': {
                    '_id': '$current_stage',
                    'count': {'$sum': 1},
                    'total_value': {
                        '$sum': {
                            '$multiply': [
                                {'$ifNull': ['$quantity', 0]},
                                {'$ifNull': ['$costing.quoted_price', 0]}
                            ]
                        }
                    }
                }
            },
            {'$sort': {'_id': 1}}
        ])
        
        results = await db['mfg_leads'].aggregate(pipeline).to_list(length=100)
        
        # Format results
        stages = ['Intake', 'Feasibility', 'Costing', 'Approval', 'Won', 'Lost']
        stage_data = {}
        
        for stage in stages:
            stage_data[stage] = {
                'count': 0,
                'value': 0
            }
        
        total_leads = 0
        total_value = 0
        
        for result in results:
            stage = result['_id']
            count = result['count']
            value = result['total_value']
            
            if stage in stage_data:
                stage_data[stage]['count'] = count
                stage_data[stage]['value'] = value
                total_leads += count
                total_value += value
        
        # Calculate conversion rates
        won_count = stage_data['Won']['count']
        lost_count = stage_data['Lost']['count']
        closed_count = won_count + lost_count
        
        conversion_rate = (won_count / closed_count * 100) if closed_count > 0 else 0
        
        return {
            'total_leads': total_leads,
            'total_value': total_value,
            'conversion_rate': round(conversion_rate, 2),
            'average_deal_size': total_value / total_leads if total_leads > 0 else 0,
            'stages': stage_data,
            'won_leads': won_count,
            'lost_leads': lost_count
        }
    
    async def get_conversion_funnel(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get conversion funnel metrics
        
        Returns:
            - Stage-wise conversion rates
            - Drop-off analysis
            - Time in each stage
        """
        # Get all leads
        match_query = {}
        if filters:
            if filters.get('industry'):
                match_query['customer_industry'] = filters['industry']
            if filters.get('date_from'):
                match_query['created_at'] = {'$gte': filters['date_from']}
        
        leads = await db['mfg_leads'].find(match_query).to_list(length=10000)
        
        # Calculate funnel metrics
        funnel = {
            'Intake': {'entered': 0, 'converted': 0},
            'Feasibility': {'entered': 0, 'converted': 0},
            'Costing': {'entered': 0, 'converted': 0},
            'Approval': {'entered': 0, 'converted': 0},
            'Won': {'entered': 0, 'converted': 0}
        }
        
        for lead in leads:
            stage_history = lead.get('stage_history', [])
            current_stage = lead.get('current_stage')
            
            # Track which stages the lead passed through
            stages_entered = set([current_stage])
            for history in stage_history:
                stages_entered.add(history.get('stage'))
            
            # Count entries
            for stage in funnel.keys():
                if stage in stages_entered:
                    funnel[stage]['entered'] += 1
            
            # Count conversions (if moved to next stage)
            stage_order = ['Intake', 'Feasibility', 'Costing', 'Approval', 'Won']
            for i in range(len(stage_order) - 1):
                current = stage_order[i]
                next_stage = stage_order[i + 1]
                if current in stages_entered and next_stage in stages_entered:
                    funnel[current]['converted'] += 1
        
        # Calculate conversion rates
        for stage in funnel.keys():
            entered = funnel[stage]['entered']
            converted = funnel[stage]['converted']
            funnel[stage]['conversion_rate'] = (converted / entered * 100) if entered > 0 else 0
        
        return {'funnel': funnel}
    
    async def get_approval_bottleneck_analysis(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze approval bottlenecks
        
        Returns:
            - Average approval time by type
            - Pending approvals
            - Rejected approvals
            - Approval success rate
        """
        match_query = {'current_stage': 'Approval'}
        
        if filters:
            if filters.get('industry'):
                match_query['customer_industry'] = filters['industry']
        
        leads_in_approval = await db['mfg_leads'].find(match_query).to_list(length=1000)
        
        approval_stats = {
            'total_in_approval': len(leads_in_approval),
            'pending_count': 0,
            'approved_count': 0,
            'rejected_count': 0,
            'average_approval_time_days': 0,
            'by_type': {}
        }
        
        total_approval_time = 0
        approval_count = 0
        
        for lead in leads_in_approval:
            approvals = lead.get('approvals', [])
            
            for approval in approvals:
                approval_type = approval.get('approval_type')
                status = approval.get('status')
                
                if approval_type not in approval_stats['by_type']:
                    approval_stats['by_type'][approval_type] = {
                        'pending': 0,
                        'approved': 0,
                        'rejected': 0,
                        'average_time_days': 0
                    }
                
                if status == 'Pending':
                    approval_stats['pending_count'] += 1
                    approval_stats['by_type'][approval_type]['pending'] += 1
                elif status == 'Approved':
                    approval_stats['approved_count'] += 1
                    approval_stats['by_type'][approval_type]['approved'] += 1
                    
                    # Calculate approval time
                    submitted_at = approval.get('submitted_at')
                    approved_at = approval.get('approved_at')
                    if submitted_at and approved_at:
                        if isinstance(submitted_at, str):
                            submitted_at = datetime.fromisoformat(submitted_at)
                        if isinstance(approved_at, str):
                            approved_at = datetime.fromisoformat(approved_at)
                        
                        approval_time = (approved_at - submitted_at).days
                        total_approval_time += approval_time
                        approval_count += 1
                
                elif status == 'Rejected':
                    approval_stats['rejected_count'] += 1
                    approval_stats['by_type'][approval_type]['rejected'] += 1
        
        if approval_count > 0:
            approval_stats['average_approval_time_days'] = round(total_approval_time / approval_count, 1)
        
        return approval_stats
    
    async def get_time_to_conversion_metrics(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Calculate time to conversion metrics
        
        Returns:
            - Average time from Intake to Won
            - Time by stage
            - Fastest/Slowest deals
        """
        match_query = {'current_stage': 'Won'}
        
        if filters:
            if filters.get('industry'):
                match_query['customer_industry'] = filters['industry']
            if filters.get('date_from'):
                match_query['created_at'] = {'$gte': filters['date_from']}
        
        won_leads = await db['mfg_leads'].find(match_query).to_list(length=1000)
        
        total_time = 0
        lead_times = []
        
        for lead in won_leads:
            created_at = lead.get('created_at')
            won_date = lead.get('won_date')
            
            if created_at and won_date:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                if isinstance(won_date, str):
                    won_date = datetime.fromisoformat(won_date)
                
                days_to_conversion = (won_date - created_at).days
                total_time += days_to_conversion
                lead_times.append({
                    'lead_id': lead['lead_id'],
                    'days': days_to_conversion,
                    'value': lead.get('quantity', 0) * lead.get('costing', {}).get('quoted_price', 0)
                })
        
        # Sort by time
        lead_times.sort(key=lambda x: x['days'])
        
        return {
            'average_days_to_conversion': round(total_time / len(won_leads), 1) if len(won_leads) > 0 else 0,
            'fastest_deals': lead_times[:5] if lead_times else [],
            'slowest_deals': lead_times[-5:] if lead_times else [],
            'total_won_leads': len(won_leads)
        }
    
    async def get_industry_performance(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Get performance metrics by industry
        
        Returns:
            - Lead count by industry
            - Conversion rate by industry
            - Average deal size by industry
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$customer_industry',
                    'total_leads': {'$sum': 1},
                    'won_leads': {
                        '$sum': {
                            '$cond': [{'$eq': ['$current_stage', 'Won']}, 1, 0]
                        }
                    },
                    'total_value': {
                        '$sum': {
                            '$multiply': [
                                {'$ifNull': ['$quantity', 0]},
                                {'$ifNull': ['$costing.quoted_price', 0]}
                            ]
                        }
                    }
                }
            },
            {'$sort': {'total_value': -1}}
        ]
        
        results = await db['mfg_leads'].aggregate(pipeline).to_list(length=100)
        
        # Calculate metrics
        industry_performance = []
        for result in results:
            total_leads = result['total_leads']
            won_leads = result['won_leads']
            total_value = result['total_value']
            
            industry_performance.append({
                'industry': result['_id'],
                'total_leads': total_leads,
                'won_leads': won_leads,
                'conversion_rate': round(won_leads / total_leads * 100, 2) if total_leads > 0 else 0,
                'total_value': total_value,
                'average_deal_size': total_value / total_leads if total_leads > 0 else 0
            })
        
        return industry_performance
    
    async def get_sales_rep_performance(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Get performance metrics by sales rep
        
        Returns:
            - Lead count by rep
            - Conversion rate by rep
            - Total value by rep
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$assigned_to_name',
                    'total_leads': {'$sum': 1},
                    'won_leads': {
                        '$sum': {
                            '$cond': [{'$eq': ['$current_stage', 'Won']}, 1, 0]
                        }
                    },
                    'total_value': {
                        '$sum': {
                            '$multiply': [
                                {'$ifNull': ['$quantity', 0]},
                                {'$ifNull': ['$costing.quoted_price', 0]}
                            ]
                        }
                    }
                }
            },
            {'$sort': {'total_value': -1}}
        ]
        
        results = await db['mfg_leads'].aggregate(pipeline).to_list(length=100)
        
        # Calculate metrics
        rep_performance = []
        for result in results:
            total_leads = result['total_leads']
            won_leads = result['won_leads']
            total_value = result['total_value']
            
            rep_performance.append({
                'sales_rep': result['_id'],
                'total_leads': total_leads,
                'won_leads': won_leads,
                'conversion_rate': round(won_leads / total_leads * 100, 2) if total_leads > 0 else 0,
                'total_value': total_value,
                'average_deal_size': total_value / total_leads if total_leads > 0 else 0
            })
        
        return rep_performance
    
    async def get_risk_analysis(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze leads by risk level
        
        Returns:
            - Count by risk level
            - High risk lead details
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$risk_level',
                    'count': {'$sum': 1},
                    'total_value': {
                        '$sum': {
                            '$multiply': [
                                {'$ifNull': ['$quantity', 0]},
                                {'$ifNull': ['$costing.quoted_price', 0]}
                            ]
                        }
                    }
                }
            }
        ]
        
        results = await db['mfg_leads'].aggregate(pipeline).to_list(length=100)
        
        risk_data = {
            'Low': {'count': 0, 'value': 0},
            'Medium': {'count': 0, 'value': 0},
            'High': {'count': 0, 'value': 0}
        }
        
        for result in results:
            risk_level = result['_id']
            if risk_level in risk_data:
                risk_data[risk_level] = {
                    'count': result['count'],
                    'value': result['total_value']
                }
        
        # Get high risk leads
        high_risk_leads = await db['mfg_leads'].find(
            {'risk_level': 'High'}
        ).sort('risk_score', -1).limit(10).to_list(length=10)
        
        high_risk_details = []
        for lead in high_risk_leads:
            high_risk_details.append({
                'lead_id': lead['lead_id'],
                'customer_name': lead.get('customer_name'),
                'risk_score': lead.get('risk_score', 0),
                'risk_factors': lead.get('risk_factors', []),
                'value': lead.get('quantity', 0) * lead.get('costing', {}).get('quoted_price', 0)
            })
        
        return {
            'summary': risk_data,
            'high_risk_leads': high_risk_details
        }
    
    async def get_plant_utilization(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Get plant-wise lead distribution and value
        
        Returns:
            - Lead count by plant
            - Value by plant
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$plant_id',
                    'total_leads': {'$sum': 1},
                    'active_leads': {
                        '$sum': {
                            '$cond': [
                                {'$in': ['$current_stage', ['Feasibility', 'Costing', 'Approval']]},
                                1, 0
                            ]
                        }
                    },
                    'total_value': {
                        '$sum': {
                            '$multiply': [
                                {'$ifNull': ['$quantity', 0]},
                                {'$ifNull': ['$costing.quoted_price', 0]}
                            ]
                        }
                    }
                }
            },
            {'$sort': {'total_leads': -1}}
        ]
        
        results = await db['mfg_leads'].aggregate(pipeline).to_list(length=100)
        
        plant_data = []
        for result in results:
            plant_id = result['_id']
            
            # Get plant name from master
            plant = await db['mfg_plants'].find_one({'id': plant_id})
            plant_name = plant.get('plant_name') if plant else plant_id
            
            plant_data.append({
                'plant_id': plant_id,
                'plant_name': plant_name,
                'total_leads': result['total_leads'],
                'active_leads': result['active_leads'],
                'total_value': result['total_value']
            })
        
        return plant_data
    
    async def get_monthly_trend(self, months: int = 6) -> Dict[str, Any]:
        """
        Get monthly trend of leads
        
        Returns:
            - Monthly lead count
            - Monthly conversion rate
            - Monthly value
        """
        start_date = datetime.utcnow() - timedelta(days=months * 30)
        
        pipeline = [
            {
                '$match': {
                    'created_at': {'$gte': start_date.isoformat()}
                }
            },
            {
                '$group': {
                    '_id': {
                        'year': {'$year': {'$dateFromString': {'dateString': '$created_at'}}},
                        'month': {'$month': {'$dateFromString': {'dateString': '$created_at'}}}
                    },
                    'total_leads': {'$sum': 1},
                    'won_leads': {
                        '$sum': {
                            '$cond': [{'$eq': ['$current_stage', 'Won']}, 1, 0]
                        }
                    },
                    'total_value': {
                        '$sum': {
                            '$multiply': [
                                {'$ifNull': ['$quantity', 0]},
                                {'$ifNull': ['$costing.quoted_price', 0]}
                            ]
                        }
                    }
                }
            },
            {'$sort': {'_id.year': 1, '_id.month': 1}}
        ]
        
        try:
            results = await db['mfg_leads'].aggregate(pipeline).to_list(length=100)
        except:
            # Fallback if date parsing fails
            results = []
        
        monthly_data = []
        for result in results:
            total_leads = result['total_leads']
            won_leads = result['won_leads']
            
            monthly_data.append({
                'month': f"{result['_id']['year']}-{result['_id']['month']:02d}",
                'total_leads': total_leads,
                'won_leads': won_leads,
                'conversion_rate': round(won_leads / total_leads * 100, 2) if total_leads > 0 else 0,
                'total_value': result['total_value']
            })
        
        return {'monthly_trend': monthly_data}


# Global analytics instance
analytics_engine = ManufacturingAnalytics()
