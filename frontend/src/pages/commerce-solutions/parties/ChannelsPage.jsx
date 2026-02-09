import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IBCommerceHub from '../../IBCommerceHub';
import { 
  Target, DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  Shield, Activity, Clock, BarChart3, Calendar,
  Award, Users, Star, ArrowLeft, FileText, Globe, Layers,
  ShoppingCart, Monitor, Phone, Building2, Truck, Zap
} from 'lucide-react';

const ChannelsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const channelManagementFeatures = [
    {
      feature: 'Multi-Channel Revenue Attribution',
      description: 'Track and attribute revenue across all sales channels with accurate margin analysis and performance comparison.',
      channels: [
        { channel: 'Direct Sales', description: 'Enterprise field sales team', avgDealSize: '$250K', margin: '45%', cycle: '90 days' },
        { channel: 'Inside Sales', description: 'SMB telesales team', avgDealSize: '$25K', margin: '50%', cycle: '30 days' },
        { channel: 'Channel Partners', description: 'Resellers and VARs', avgDealSize: '$75K', margin: '30%', cycle: '60 days' },
        { channel: 'E-Commerce', description: 'Self-service online', avgDealSize: '$5K', margin: '65%', cycle: '1 day' },
        { channel: 'Marketplace', description: 'AWS/Azure/GCP marketplaces', avgDealSize: '$45K', margin: '55%', cycle: '14 days' }
      ],
      example: {
        quarter: 'Q4 2024',
        totalRevenue: '$12.5M',
        directSales: '$5.2M (41.6%)',
        channelPartners: '$3.8M (30.4%)',
        eCommerce: '$1.8M (14.4%)',
        marketplace: '$1.2M (9.6%)',
        insideSales: '$0.5M (4.0%)',
        blendedMargin: '42.3%'
      },
      prevention: 'Prevents revenue leakage from untracked channels and enables data-driven channel investment decisions'
    },
    {
      feature: 'Channel Pricing & Margin Control',
      description: 'Manage channel-specific pricing, protect margins, and prevent unauthorized discounting.',
      pricingRules: [
        { rule: 'List Price', application: 'E-Commerce, marketplace', discount: '0%', margin: '65%' },
        { rule: 'Volume Discount', application: 'Direct sales, inside sales', discount: '10-20%', margin: '45-55%' },
        { rule: 'Partner Discount', application: 'Channel partners', discount: '25-40%', margin: '25-40%' },
        { rule: 'Enterprise Agreement', application: 'Strategic accounts', discount: '15-30%', margin: '35-50%' },
        { rule: 'Promotional', application: 'Time-limited campaigns', discount: '20-35%', margin: '30-45%' }
      ],
      controls: [
        'Minimum advertised price (MAP) enforcement',
        'Floor price protection by channel',
        'Discount approval workflows',
        'Real-time margin calculation',
        'Cross-channel price consistency monitoring'
      ],
      example: {
        scenario: 'Partner attempts to sell below floor price',
        requestedPrice: '$8,000 (33% discount)',
        floorPrice: '$9,000 (25% discount)',
        systemAction: 'Quote blocked, manager approval required',
        resolution: 'Manager approved at $8,500 with justification',
        marginProtected: '$500 per unit'
      },
      prevention: 'Prevents margin erosion from unauthorized discounts and maintains channel price integrity'
    },
    {
      feature: 'Channel Conflict Management',
      description: 'Detect, prevent, and resolve conflicts between channels pursuing the same opportunities.',
      conflictTypes: [
        { type: 'Direct vs Partner', description: 'Both pursuing same customer', resolution: 'Deal registration + first contact rule' },
        { type: 'Partner vs Partner', description: 'Multiple partners on same deal', resolution: 'Registration timestamp + customer preference' },
        { type: 'Online vs Offline', description: 'Customer comparing web vs sales price', resolution: 'Price matching + value-add justification' },
        { type: 'New vs Renewal', description: 'Different channels for initial vs renewal', resolution: 'Account ownership rules + handoff process' }
      ],
      resolutionWorkflow: [
        'Automated conflict detection at opportunity creation',
        'Notification to all parties with conflict details',
        'Escalation path with defined SLAs',
        'Resolution options: split, assign, co-sell',
        'Audit trail of all conflict resolutions'
      ],
      example: {
        opportunity: '$300K deal at TechCorp',
        conflict: 'Direct sales + 2 partners all claiming',
        detection: 'System flagged within 2 hours',
        resolution: 'Partner A (first registration) leads, direct sales supports, Partner B compensated for referral',
        outcome: 'Deal closed at $340K with co-sell premium'
      },
      prevention: 'Prevents lost deals from channel in-fighting and maintains healthy channel relationships'
    },
    {
      feature: 'Channel Performance Analytics',
      description: 'Comprehensive analytics to optimize channel mix and investment allocation.',
      metrics: [
        { metric: 'Revenue by Channel', insight: 'Which channels drive the most revenue?' },
        { metric: 'Margin by Channel', insight: 'Which channels are most profitable?' },
        { metric: 'CAC by Channel', insight: 'Customer acquisition cost comparison' },
        { metric: 'Sales Velocity', insight: 'Time-to-close by channel' },
        { metric: 'Win Rate', insight: 'Competitive win rate by channel' },
        { metric: 'Customer Lifetime Value', insight: 'Long-term value by acquisition channel' }
      ],
      dashboards: [
        'Channel mix trending over time',
        'Revenue vs target by channel',
        'Margin waterfall analysis',
        'Channel ROI comparison',
        'Pipeline health by channel',
        'Forecast accuracy by channel'
      ],
      example: {
        insight: 'E-commerce has 65% margin but only 14% of revenue',
        analysis: 'Self-service works for SMB but enterprise needs direct touch',
        action: 'Invest in product-led growth for mid-market',
        result: 'E-commerce revenue grew 45% next quarter while maintaining margin'
      },
      prevention: 'Prevents suboptimal channel investment and enables data-driven go-to-market decisions'
    },
    {
      feature: 'Omnichannel Customer Experience',
      description: 'Unified customer view across all channels with seamless handoffs and consistent experience.',
      capabilities: [
        { capability: 'Single Customer View', description: 'All interactions across channels in one place', benefit: 'No repetition, personalized experience' },
        { capability: 'Channel Handoff', description: 'Smooth transition between channels', benefit: 'Customer doesn\'t restart conversation' },
        { capability: 'Consistent Pricing', description: 'Same pricing regardless of channel', benefit: 'Trust and transparency' },
        { capability: 'Universal Cart', description: 'Save items across channels', benefit: 'Convenience and flexibility' },
        { capability: 'Cross-Channel Support', description: 'Support knows all channel history', benefit: 'Faster resolution, better satisfaction' }
      ],
      customerJourney: [
        { touchpoint: 'Website', action: 'Research products, get pricing', channel: 'E-Commerce' },
        { touchpoint: 'Chat', action: 'Ask technical questions', channel: 'Inside Sales' },
        { touchpoint: 'Demo', action: 'Schedule and attend demo', channel: 'Direct Sales' },
        { touchpoint: 'Quote', action: 'Receive customized proposal', channel: 'Direct Sales' },
        { touchpoint: 'Purchase', action: 'Buy via preferred channel', channel: 'Any' },
        { touchpoint: 'Support', action: 'Get help when needed', channel: 'Support' }
      ],
      example: {
        customer: 'Mid-market company',
        journey: 'Started on website → Chat with questions → Demo with sales → Quote via partner → Purchased on marketplace',
        experience: 'Seamless, all context preserved',
        result: 'Deal closed in 21 days vs 45-day average'
      },
      prevention: 'Prevents customer frustration from disconnected experiences and accelerates sales cycles'
    }
  ];

  const realWorldScenarios = [
    {
      title: 'The Channel Optimization Story',
      company: 'B2B Software Company',
      situation: 'Company relied 80% on direct sales, struggling with scale and CAC.',
      withoutAnalytics: {
        what: 'No visibility into channel-specific metrics',
        result: 'Continued investing in highest-cost channel',
        loss: 'CAC 3x industry average, flat growth'
      },
      withAnalytics: {
        what: 'Channel performance dashboard revealed opportunities',
        action: 'Shifted 30% of budget to partner and e-commerce channels',
        result: 'Revenue grew 40% while CAC dropped 35%',
        saved: '$2.1M in customer acquisition costs annually'
      },
      lesson: 'Data-driven channel optimization can transform unit economics while accelerating growth.'
    },
    {
      title: 'The MAP Enforcement Success',
      company: 'Hardware Manufacturer',
      situation: 'Online resellers undercutting prices, damaging brand and margins.',
      withoutEnforcement: {
        what: 'Manual monitoring of thousands of listings',
        result: 'Prices eroded 20% below MAP, retailers stopped carrying',
        loss: '$8M in lost retailer revenue + brand damage'
      },
      withEnforcement: {
        what: 'Automated MAP monitoring and enforcement',
        action: 'Violators warned, repeat offenders terminated',
        result: 'Price integrity restored within 60 days',
        saved: 'Retailer relationships restored, $8M revenue protected'
      },
      lesson: 'Automated price monitoring protects brand value and channel relationships.'
    },
    {
      title: 'The Multi-Channel Growth Story',
      company: 'SaaS Platform',
      situation: 'Enterprise-only go-to-market missing SMB opportunity.',
      evolution: [
        { year: 'Year 1', channels: 'Direct only', revenue: '$5M', margin: '45%', customers: 50 },
        { year: 'Year 2', channels: '+ Inside sales', revenue: '$12M', margin: '48%', customers: 250 },
        { year: 'Year 3', channels: '+ Channel partners', revenue: '$28M', margin: '42%', customers: 800 },
        { year: 'Year 4', channels: '+ E-commerce', revenue: '$52M', margin: '46%', customers: 3500 },
        { year: 'Year 5', channels: '+ Marketplace', revenue: '$85M', margin: '48%', customers: 8000 }
      ],
      totalGrowth: '17x revenue in 5 years',
      keyInsight: 'Each channel unlocked new customer segment without cannibalizing existing',
      lesson: 'Strategic multi-channel expansion creates compounding growth.'
    },
    {
      title: 'The Conflict Resolution Framework',
      company: 'Technology Distributor',
      situation: 'Constant conflicts between direct and partner sales destroying relationships.',
      beforeFramework: {
        conflicts: '~50 per quarter',
        resolutionTime: '2-3 weeks average',
        partnerSatisfaction: '62%',
        lostDeals: '~15% of pipeline'
      },
      afterFramework: {
        conflicts: '~50 per quarter (same)',
        resolutionTime: '2-3 days average',
        partnerSatisfaction: '89%',
        lostDeals: '<3% of pipeline'
      },
      improvement: {
        resolutionSpeed: '85% faster',
        partnerSatisfaction: '+27 points',
        recoveredDeals: '$4.2M per quarter'
      },
      lesson: 'Clear conflict resolution rules preserve deals and relationships.'
    }
  ];

  const bestPractices = [
    {
      practice: 'Channel Strategy Development',
      description: 'Define clear channel strategy aligned with customer segments and business objectives.',
      framework: [
        { element: 'Customer Segmentation', description: 'Map customer segments to ideal channels based on deal size, complexity, support needs' },
        { element: 'Channel Roles', description: 'Define clear responsibilities and boundaries for each channel' },
        { element: 'Economics Model', description: 'Understand CAC, margin, and LTV by channel' },
        { element: 'Coverage Rules', description: 'Define which channel serves which accounts/territories' },
        { element: 'Conflict Resolution', description: 'Pre-define rules for common conflict scenarios' }
      ],
      segmentMapping: [
        { segment: 'Enterprise ($500K+)', primaryChannel: 'Direct Sales', supportChannels: 'Partner for delivery' },
        { segment: 'Mid-Market ($50-500K)', primaryChannel: 'Inside Sales + Partners', supportChannels: 'Direct for complex deals' },
        { segment: 'SMB ($5-50K)', primaryChannel: 'Partners + E-commerce', supportChannels: 'Inside sales for upgrades' },
        { segment: 'Self-Service (<$5K)', primaryChannel: 'E-commerce + Marketplace', supportChannels: 'Chat support' }
      ]
    },
    {
      practice: 'Channel Enablement',
      description: 'Equip all channels with tools and training for success.',
      elements: [
        { element: 'Sales Playbooks', description: 'Channel-specific messaging, pricing, and competitive positioning' },
        { element: 'Technical Training', description: 'Product knowledge and solution selling skills' },
        { element: 'Tools Access', description: 'CRM, CPQ, demo environments, marketing assets' },
        { element: 'Support Resources', description: 'Pre-sales support, deal desk, technical assistance' },
        { element: 'Incentive Programs', description: 'SPIFFs, contests, accelerators to drive behavior' }
      ],
      metrics: [
        { metric: 'Time to First Deal', target: '<90 days for new reps/partners' },
        { metric: 'Certification Rate', target: '100% within 60 days' },
        { metric: 'Tool Adoption', target: '>80% active usage' },
        { metric: 'Win Rate Improvement', target: '+10% within 6 months' }
      ]
    },
    {
      practice: 'Channel Performance Management',
      description: 'Regular review and optimization of channel performance.',
      reviewCadence: [
        { frequency: 'Weekly', focus: 'Pipeline and forecast by channel', owner: 'Channel Managers' },
        { frequency: 'Monthly', focus: 'Revenue, margin, win rate analysis', owner: 'Channel Director' },
        { frequency: 'Quarterly', focus: 'Channel ROI, investment allocation', owner: 'VP Sales/CRO' },
        { frequency: 'Annual', focus: 'Channel strategy review and planning', owner: 'Executive Team' }
      ],
      actionTriggers: [
        { trigger: 'Win rate drops >10%', action: 'Competitive analysis, enablement review' },
        { trigger: 'Margin below floor', action: 'Pricing audit, discount approval review' },
        { trigger: 'Pipeline coverage <3x', action: 'Lead generation acceleration' },
        { trigger: 'Partner churn >20%', action: 'Partner satisfaction survey, program review' }
      ]
    },
    {
      practice: 'Technology Stack Integration',
      description: 'Ensure seamless data flow and user experience across channel systems.',
      integrations: [
        { system: 'CRM', purpose: 'Unified customer and opportunity data', channels: 'All' },
        { system: 'PRM', purpose: 'Partner portal, deal registration, MDF', channels: 'Partners' },
        { system: 'CPQ', purpose: 'Consistent pricing and quoting', channels: 'All' },
        { system: 'E-commerce', purpose: 'Self-service transactions', channels: 'Online, Marketplace' },
        { system: 'Marketing Automation', purpose: 'Lead routing and nurture', channels: 'All' },
        { system: 'Analytics', purpose: 'Cross-channel reporting', channels: 'All' }
      ],
      dataRequirements: [
        'Real-time opportunity visibility across channels',
        'Automated lead routing based on rules',
        'Single source of truth for pricing',
        'Customer interaction history across touchpoints',
        'Attribution tracking for marketing and sales'
      ]
    }
  ];

  const exampleChannels = [
    { id: 'CHN-001', name: 'Enterprise Direct', type: 'Direct', region: 'Global', revenue: '$45.2M', margin: '46%', deals: 185, avgDeal: '$244K' },
    { id: 'CHN-002', name: 'Inside Sales', type: 'Direct', region: 'North America', revenue: '$8.5M', margin: '52%', deals: 420, avgDeal: '$20K' },
    { id: 'CHN-003', name: 'Partner Network', type: 'Indirect', region: 'Global', revenue: '$32.1M', margin: '32%', deals: 890, avgDeal: '$36K' },
    { id: 'CHN-004', name: 'E-Commerce', type: 'Digital', region: 'Global', revenue: '$12.8M', margin: '68%', deals: 4200, avgDeal: '$3K' },
    { id: 'CHN-005', name: 'AWS Marketplace', type: 'Marketplace', region: 'Global', revenue: '$6.2M', margin: '55%', deals: 310, avgDeal: '$20K' },
    { id: 'CHN-006', name: 'Azure Marketplace', type: 'Marketplace', region: 'Global', revenue: '$4.1M', margin: '54%', deals: 195, avgDeal: '$21K' },
  ];

  return (
    <IBCommerceHub>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <Link to="/solutions/commerce/parties" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-semibold">
            <ArrowLeft className="h-5 w-5" />
            Back to Parties Module
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl flex items-center justify-center shadow-xl">
              <Target className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-slate-900">Channels Module</h1>
              <p className="text-2xl text-slate-600">Multi-Channel Revenue & Distribution</p>
            </div>
          </div>
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
            <p className="text-lg text-indigo-900 mb-2">
              <strong>Purpose:</strong> Orchestrate multiple go-to-market channels with unified pricing, conflict resolution, and performance analytics.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">6 Active Channels</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">$108.9M Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">45% Avg Margin</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">85% Faster Resolution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'features', label: 'Features', icon: Star },
              { key: 'scenarios', label: 'Real Scenarios', icon: Target },
              { key: 'practices', label: 'Best Practices', icon: Award },
              { key: 'data', label: 'Example Data', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4 ${
                    activeTab === tab.key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Channel Management Matters?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Proper Management
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Price wars between channels destroy margins</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Channel conflicts lose deals and partners</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>No visibility into channel performance</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Customers frustrated by inconsistent experience</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Suboptimal channel mix limits growth</span></li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Channels Module
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Automated pricing controls protect margins</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Clear conflict resolution preserves deals</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Real-time analytics optimize channel mix</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Omnichannel experience delights customers</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Data-driven investment maximizes ROI</span></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Channel Types Visual */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Channel Types</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { type: 'Direct', icon: Users, channels: ['Enterprise Sales', 'Inside Sales', 'Account Management'], color: 'from-blue-600 to-blue-800' },
                  { type: 'Indirect', icon: Building2, channels: ['Resellers', 'VARs', 'System Integrators', 'MSPs'], color: 'from-purple-600 to-purple-800' },
                  { type: 'Digital', icon: Monitor, channels: ['E-Commerce', 'Marketplace', 'Self-Service'], color: 'from-indigo-600 to-indigo-800' }
                ].map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={`item-${i}`} className={`bg-gradient-to-br ${t.color} p-6 rounded-2xl text-white`}>
                      <Icon className="h-10 w-10 mb-4" />
                      <h3 className="text-xl font-bold mb-4">{t.type} Channels</h3>
                      <ul className="space-y-2">
                        {t.channels.map((ch, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            {ch}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-12">
            {channelManagementFeatures.map((feature, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-white p-8 border-b-2 border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{feature.feature}</h2>
                  <p className="text-lg text-slate-700">{feature.description}</p>
                </div>
                <div className="p-8 space-y-6">
                  {feature.channels && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Channel Performance:</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left p-3">Channel</th>
                              <th className="text-left p-3">Description</th>
                              <th className="text-left p-3">Avg Deal</th>
                              <th className="text-left p-3">Margin</th>
                              <th className="text-left p-3">Cycle</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {feature.channels.map((ch, i) => (
                              <tr key={`item-${i}`}>
                                <td className="p-3 font-semibold">{ch.channel}</td>
                                <td className="p-3 text-slate-600">{ch.description}</td>
                                <td className="p-3">{ch.avgDealSize}</td>
                                <td className="p-3 text-green-600 font-semibold">{ch.margin}</td>
                                <td className="p-3">{ch.cycle}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {feature.pricingRules && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Pricing Rules:</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {feature.pricingRules.map((rule, i) => (
                          <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                            <div className="font-bold text-slate-900">{rule.rule}</div>
                            <p className="text-sm text-slate-600">{rule.application}</p>
                            <div className="flex justify-between mt-2 text-sm">
                              <span>Discount: {rule.discount}</span>
                              <span className="text-green-600 font-semibold">Margin: {rule.margin}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.controls && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Controls:</h3>
                      <ul className="space-y-2">
                        {feature.controls.map((control, i) => (
                          <li key={`item-${i}`} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{control}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feature.example && (
                    <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-200">
                      <h3 className="text-xl font-bold text-indigo-900 mb-4">Real Example:</h3>
                      <div className="space-y-2 text-sm">
                        {Object.entries(feature.example).map(([key, value], i) => (
                          <div key={`item-${i}`} className="flex justify-between items-start">
                            <span className="text-slate-700 font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-slate-900 font-bold text-right max-w-md">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-green-900 font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      What This Prevents: {feature.prevention}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="space-y-8">
            {realWorldScenarios.map((scenario, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{scenario.title}</h2>
                  <p className="text-xl opacity-90">{scenario.company}</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Situation:</h3>
                    <p className="text-lg text-slate-700">{scenario.situation}</p>
                  </div>

                  {scenario.withoutAnalytics && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                        <h3 className="text-xl font-bold text-red-900 mb-4">Without Analytics</h3>
                        <div className="space-y-3 text-sm">
                          <p><strong>What Happens:</strong> {scenario.withoutAnalytics.what}</p>
                          <p><strong>Result:</strong> {scenario.withoutAnalytics.result}</p>
                          <p className="font-bold text-red-800 text-lg pt-3 border-t border-red-200">Impact: {scenario.withoutAnalytics.loss}</p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                        <h3 className="text-xl font-bold text-green-900 mb-4">With Analytics</h3>
                        <div className="space-y-3 text-sm">
                          <p><strong>What Happens:</strong> {scenario.withAnalytics.what}</p>
                          <p><strong>Action:</strong> {scenario.withAnalytics.action}</p>
                          <p><strong>Result:</strong> {scenario.withAnalytics.result}</p>
                          <p className="font-bold text-green-800 text-lg pt-3 border-t border-green-200">Saved: {scenario.withAnalytics.saved}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scenario.evolution && (
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Channel Evolution:</h3>
                      <div className="space-y-3">
                        {scenario.evolution.map((stage, i) => (
                          <div key={`item-${i}`} className="bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl border border-indigo-200">
                            <div className="grid grid-cols-5 gap-4 text-sm">
                              <div><span className="font-bold">{stage.year}</span></div>
                              <div><span className="text-slate-600">{stage.channels}</span></div>
                              <div><span className="text-green-600 font-bold">{stage.revenue}</span></div>
                              <div><span>{stage.margin} margin</span></div>
                              <div><span>{stage.customers} customers</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 bg-indigo-50 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-indigo-600">{scenario.totalGrowth}</p>
                        <p className="text-slate-600">{scenario.keyInsight}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <p className="text-indigo-900 font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <strong>Key Lesson:</strong> {scenario.lesson}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Best Practices Tab */}
        {activeTab === 'practices' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Channel Management Best Practices</h2>
              <p className="text-xl opacity-90">Based on Forrester, Gartner, and leading go-to-market strategies</p>
            </div>

            {bestPractices.map((practice, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{practice.practice}</h3>
                <p className="text-lg text-slate-700 mb-6">{practice.description}</p>
                
                {practice.framework && (
                  <div className="space-y-3 mb-6">
                    {practice.framework.map((f, i) => (
                      <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                        <span className="font-bold text-slate-900">{f.element}:</span>
                        <span className="text-slate-600 ml-2">{f.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {practice.segmentMapping && (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-3">Segment</th>
                          <th className="text-left p-3">Primary Channel</th>
                          <th className="text-left p-3">Support Channels</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {practice.segmentMapping.map((seg, i) => (
                          <tr key={`item-${i}`}>
                            <td className="p-3 font-semibold">{seg.segment}</td>
                            <td className="p-3">{seg.primaryChannel}</td>
                            <td className="p-3 text-slate-600">{seg.supportChannels}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {practice.elements && (
                  <div className="grid md:grid-cols-2 gap-3 mb-6">
                    {practice.elements.map((el, i) => (
                      <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                        <div className="font-bold text-slate-900">{el.element}</div>
                        <p className="text-sm text-slate-600">{el.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Channel Performance Data</h2>
              <p className="text-xl opacity-90">Example data across all go-to-market channels</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Channel ID</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Revenue</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Margin</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Deals</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Avg Deal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exampleChannels.map((channel) => (
                    <tr key={channel.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{channel.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Target className="h-5 w-5 text-indigo-600" />
                          </div>
                          <span className="font-medium text-slate-900">{channel.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          channel.type === 'Direct' ? 'bg-blue-100 text-blue-700' :
                          channel.type === 'Indirect' ? 'bg-purple-100 text-purple-700' :
                          channel.type === 'Digital' ? 'bg-green-100 text-green-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {channel.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{channel.revenue}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{channel.margin}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{channel.deals}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{channel.avgDeal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Channels</p>
                <p className="text-3xl font-bold text-slate-900">{exampleChannels.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">$108.9M</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Deals</p>
                <p className="text-3xl font-bold text-blue-600">6,200</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Blended Margin</p>
                <p className="text-3xl font-bold text-indigo-600">45%</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Channel Strategy?</h2>
          <p className="text-xl mb-6 opacity-90">
            See how IB Commerce helps you orchestrate multiple channels for maximum reach and profitability
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:shadow-xl transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </IBCommerceHub>
  );
};

export default ChannelsPage;
