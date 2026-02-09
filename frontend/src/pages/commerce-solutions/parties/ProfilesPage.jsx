import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IBCommerceHub from '../../IBCommerceHub';
import { 
  FileText, DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  Shield, Activity, Clock, Target, BarChart3, Calendar,
  Award, Users, Star, ArrowLeft, Settings, Layers, CreditCard,
  Percent, Tag, Building2, Globe, Zap, Lock
} from 'lucide-react';

const ProfilesPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const profileManagementFeatures = [
    {
      feature: 'Credit Profiles',
      description: 'Pre-defined credit terms and limits based on customer segment, risk level, and relationship history.',
      profileTypes: [
        { profile: 'Enterprise Premium', creditLimit: '$5,000,000', paymentTerms: 'Net 60', earlyPayDiscount: '2% Net 10', riskTolerance: 'Low' },
        { profile: 'Enterprise Standard', creditLimit: '$1,000,000', paymentTerms: 'Net 45', earlyPayDiscount: '1.5% Net 10', riskTolerance: 'Medium' },
        { profile: 'Mid-Market', creditLimit: '$250,000', paymentTerms: 'Net 30', earlyPayDiscount: '1% Net 10', riskTolerance: 'Medium' },
        { profile: 'SMB Standard', creditLimit: '$50,000', paymentTerms: 'Net 30', earlyPayDiscount: 'None', riskTolerance: 'Low' },
        { profile: 'New Customer', creditLimit: '$10,000', paymentTerms: 'Net 15', earlyPayDiscount: 'None', riskTolerance: 'Very Low' },
        { profile: 'High Risk', creditLimit: '$5,000', paymentTerms: 'Prepay/COD', earlyPayDiscount: 'None', riskTolerance: 'None' }
      ],
      automation: [
        'Auto-assign profile based on customer segment and credit score',
        'Automatic upgrade/downgrade based on payment history',
        'Real-time credit check at quote creation',
        'Block orders exceeding credit limit',
        'Alert when approaching limit (80%, 90%, 100%)'
      ],
      example: {
        customer: 'TechCorp Industries',
        initialProfile: 'New Customer ($10K limit)',
        month6: 'Upgraded to SMB Standard ($50K) - perfect payment history',
        year2: 'Upgraded to Mid-Market ($250K) - revenue growth + good history',
        currentExposure: '$185,000 (74% utilized)',
        benefit: 'Enabled $2.1M in deals over 2 years with zero bad debt'
      },
      prevention: 'Prevents bad debt while enabling good customers to grow their business with you'
    },
    {
      feature: 'Pricing Profiles',
      description: 'Standardized pricing tiers and discount structures based on customer value and relationship.',
      profileTypes: [
        { profile: 'Strategic Account', baseDiscount: '25%', volumeDiscount: 'Up to 15% additional', specialPricing: 'Custom negotiated', approval: 'Pre-approved' },
        { profile: 'Premier Customer', baseDiscount: '20%', volumeDiscount: 'Up to 10% additional', specialPricing: 'Request basis', approval: 'Manager' },
        { profile: 'Standard Customer', baseDiscount: '10%', volumeDiscount: 'Up to 5% additional', specialPricing: 'None', approval: 'Auto' },
        { profile: 'New Customer', baseDiscount: '5%', volumeDiscount: 'None', specialPricing: 'None', approval: 'Auto' },
        { profile: 'Government/EDU', baseDiscount: '30%', volumeDiscount: 'Up to 10% additional', specialPricing: 'GSA Schedule', approval: 'Pre-approved' }
      ],
      rules: [
        'Profile automatically applied at quote creation',
        'Maximum discount enforced by system',
        'Approval workflow for exceptions',
        'Audit trail of all pricing decisions',
        'Margin floor protection regardless of profile'
      ],
      example: {
        scenario: 'Sales rep creates quote for Premier Customer',
        listPrice: '$100,000',
        profileDiscount: '20% = $80,000',
        volumeDiscount: '8% (volume tier) = $73,600',
        requestedAdditional: '5% additional requested',
        systemAction: 'Manager approval required (exceeds profile)',
        outcome: 'Manager approved 3% additional = $71,408 (28.6% total)'
      },
      prevention: 'Prevents margin erosion from inconsistent pricing while rewarding valuable customers'
    },
    {
      feature: 'Service Level Profiles',
      description: 'Tiered service levels defining support, delivery, and engagement expectations.',
      profileTypes: [
        { profile: 'Platinum Service', responseTime: '1 hour', accountManager: 'Dedicated', supportHours: '24/7/365', escalation: 'Direct to VP', reviews: 'Weekly' },
        { profile: 'Gold Service', responseTime: '4 hours', accountManager: 'Named', supportHours: '24/7', escalation: 'Manager', reviews: 'Bi-weekly' },
        { profile: 'Silver Service', responseTime: '8 hours', accountManager: 'Pooled', supportHours: 'Business hours', escalation: 'Standard', reviews: 'Monthly' },
        { profile: 'Bronze Service', responseTime: '24 hours', accountManager: 'None', supportHours: 'Business hours', escalation: 'Standard', reviews: 'Quarterly' },
        { profile: 'Self-Service', responseTime: 'Community', accountManager: 'None', supportHours: 'Self-serve portal', escalation: 'Ticket', reviews: 'None' }
      ],
      automation: [
        'Automatic routing based on customer profile',
        'SLA tracking and alerting',
        'Escalation workflow enforcement',
        'Reporting on SLA compliance',
        'Customer satisfaction measurement'
      ],
      example: {
        customer: 'Financial Services Corp',
        profile: 'Platinum Service',
        incident: 'Critical system issue reported at 2 AM',
        response: 'On-call engineer engaged within 15 minutes',
        resolution: 'Issue resolved in 2 hours',
        slaCompliance: '100% - within 1-hour response SLA',
        customerFeedback: 'NPS 10 - "This is why we pay for premium support"'
      },
      prevention: 'Prevents service level mismatches and ensures resources aligned with customer value'
    },
    {
      feature: 'Commercial Terms Profiles',
      description: 'Standardized contract terms and conditions based on deal type, customer segment, and risk.',
      termCategories: [
        { category: 'Liability', standard: 'Capped at contract value', enterprise: 'Negotiable up to 2x', government: 'Per regulation' },
        { category: 'Warranty', standard: '1 year', enterprise: 'Up to 3 years', government: 'Per specification' },
        { category: 'SLA Penalties', standard: 'Service credits only', enterprise: 'Up to 20% monthly fee', government: 'Per contract' },
        { category: 'Termination', standard: '30 days notice', enterprise: 'Negotiable', government: 'Per regulation' },
        { category: 'IP Rights', standard: 'License only', enterprise: 'Source code escrow', government: 'Per requirement' }
      ],
      profileApplication: [
        { profile: 'Standard Terms', applicability: 'SMB, standard products', deviation: 'None allowed' },
        { profile: 'Enterprise Terms', applicability: 'Enterprise customers, complex deals', deviation: 'Legal approval required' },
        { profile: 'Government Terms', applicability: 'Public sector', deviation: 'Pre-approved templates' },
        { profile: 'Partner Terms', applicability: 'Channel partners', deviation: 'Partner agreement governs' }
      ],
      example: {
        deal: '$2M enterprise software license',
        customerRequest: 'Unlimited liability + source code ownership',
        standardProfile: 'Enterprise Terms (2x liability cap, escrow only)',
        negotiation: 'Legal approved 3x cap with specific carve-outs, escrow with release triggers',
        outcome: 'Deal closed with balanced risk allocation',
        timeToClose: '3 days legal review vs 3 weeks without profiles'
      },
      prevention: 'Prevents legal bottlenecks and ensures consistent risk management across deals'
    },
    {
      feature: 'Segmentation Profiles',
      description: 'Customer categorization for targeted engagement, pricing, and service delivery.',
      dimensions: [
        { dimension: 'Revenue Tier', segments: 'Enterprise ($1M+), Mid-Market ($100K-$1M), SMB ($10K-$100K), Micro (<$10K)' },
        { dimension: 'Industry', segments: 'Financial Services, Healthcare, Technology, Manufacturing, Retail, Government' },
        { dimension: 'Geography', segments: 'North America, EMEA, APAC, LATAM' },
        { dimension: 'Lifecycle Stage', segments: 'Prospect, New Customer, Growing, Mature, At-Risk, Churned' },
        { dimension: 'Strategic Value', segments: 'Flagship, Strategic, Core, Transactional' }
      ],
      profileMatrix: [
        { combination: 'Enterprise + Financial Services + Strategic', profile: 'White Glove', pricing: 'Custom', service: 'Platinum', credit: 'Enterprise Premium' },
        { combination: 'Mid-Market + Technology + Growing', profile: 'High Touch', pricing: 'Premier', service: 'Gold', credit: 'Mid-Market' },
        { combination: 'SMB + Any + New', profile: 'Digital First', pricing: 'Standard', service: 'Silver', credit: 'New Customer' },
        { combination: 'Micro + Any + Any', profile: 'Self-Service', pricing: 'List', service: 'Self-Service', credit: 'Prepay' }
      ],
      automation: [
        'Auto-segment based on firmographic data',
        'Dynamic re-segmentation as customer evolves',
        'Profile inheritance from segment',
        'Personalized engagement recommendations',
        'Churn risk scoring by segment'
      ],
      example: {
        customer: 'Growing Healthcare Company',
        initialSegment: 'SMB + Healthcare + New',
        initialProfile: 'Digital First',
        year1Growth: 'Revenue grew from $25K to $120K',
        newSegment: 'Mid-Market + Healthcare + Growing',
        newProfile: 'High Touch (automatic upgrade)',
        benefit: 'Customer receives appropriate engagement without manual intervention'
      },
      prevention: 'Prevents one-size-fits-all approach and ensures optimal resource allocation'
    }
  ];

  const realWorldScenarios = [
    {
      title: 'The Credit Profile Success Story',
      company: 'Technology Distributor',
      situation: 'Rapid growth creating credit risk exposure without clear policies.',
      withoutProfiles: {
        what: 'Ad-hoc credit decisions by individual sales reps',
        result: 'Inconsistent limits, several large bad debts',
        loss: '$1.2M in write-offs over 2 years'
      },
      withProfiles: {
        what: 'Standardized credit profiles with automatic assignment',
        action: 'All customers mapped to appropriate profile based on segment + credit score',
        result: 'Consistent credit decisions, proactive monitoring',
        saved: 'Bad debt reduced by 85%, from $600K to $90K annually'
      },
      lesson: 'Standardized credit profiles reduce risk while enabling sales growth.'
    },
    {
      title: 'The Pricing Consistency Story',
      company: 'SaaS Platform',
      situation: 'Sales team giving inconsistent discounts, eroding margins.',
      beforeProfiles: {
        discountRange: '5% to 45% for similar customers',
        averageDiscount: '28%',
        grossMargin: '52%',
        customerComplaints: 'Frequent - "Why did they get a better deal?"'
      },
      afterProfiles: {
        discountRange: '10% to 25% within profile guidelines',
        averageDiscount: '18%',
        grossMargin: '62%',
        customerComplaints: 'Rare - clear value-based pricing'
      },
      improvement: {
        marginGain: '+10 points gross margin',
        revenueImpact: '$4.2M additional profit on $42M revenue',
        salesCycleReduction: '15% faster (less negotiation)'
      },
      lesson: 'Pricing profiles increase margins, reduce sales cycles, and improve customer trust.'
    },
    {
      title: 'The Service Level Alignment Story',
      company: 'Managed Services Provider',
      situation: 'All customers receiving same service level regardless of contract value.',
      problem: {
        issue: 'Small customers getting enterprise-level attention',
        result: 'High-value customers underserved, support costs unsustainable',
        churn: 'Lost 3 enterprise customers ($2.4M ARR) due to poor service'
      },
      solution: {
        action: 'Implemented tiered service profiles aligned with customer value',
        goldCustomers: 'Dedicated support, 4-hour SLA',
        silverCustomers: 'Priority queue, 8-hour SLA',
        bronzeCustomers: 'Standard queue, 24-hour SLA',
        selfService: 'Community + knowledge base'
      },
      outcome: {
        enterpriseNPS: '+45 points (from 32 to 77)',
        supportCostReduction: '25% through efficient resource allocation',
        churnReduction: 'Enterprise churn dropped from 15% to 3%'
      },
      lesson: 'Service profiles align resources with customer value, improving satisfaction and efficiency.'
    },
    {
      title: 'The Dynamic Segmentation Story',
      company: 'B2B E-commerce Platform',
      situation: 'Static customer segments missing growth opportunities.',
      challenge: [
        { issue: 'Customers stuck in original segment', impact: 'Growing customers treated as small' },
        { issue: 'Manual segment reviews', impact: 'Updates months behind reality' },
        { issue: 'One engagement model', impact: 'Missed upsell opportunities' }
      ],
      solution: [
        { change: 'Real-time segment recalculation', result: 'Customers move segments within 24 hours of qualifying' },
        { change: 'Automatic profile updates', result: 'Pricing, credit, service adjust automatically' },
        { change: 'Triggered engagement', result: 'Account manager assigned when customer hits threshold' }
      ],
      results: {
        upsellIncrease: '+35% upsell revenue from growing customers',
        accountCoverage: '100% of valuable accounts have appropriate coverage',
        customerSatisfaction: '+20 NPS points from dynamic treatment'
      },
      lesson: 'Dynamic segmentation captures growth opportunities and improves customer experience.'
    }
  ];

  const bestPractices = [
    {
      practice: 'Profile Design Principles',
      description: 'Guidelines for creating effective commercial profiles.',
      principles: [
        { principle: 'Simplicity', guideline: 'Limit to 5-7 profiles per category - too many creates confusion' },
        { principle: 'Clear Criteria', guideline: 'Objective, measurable criteria for profile assignment' },
        { principle: 'Meaningful Differentiation', guideline: 'Profiles must have meaningful differences that matter to customers and operations' },
        { principle: 'Business Alignment', guideline: 'Profiles should reflect business strategy and customer value' },
        { principle: 'Flexibility', guideline: 'Allow exceptions with proper approval workflow' },
        { principle: 'Regular Review', guideline: 'Review and adjust profiles quarterly based on business changes' }
      ]
    },
    {
      practice: 'Profile Assignment Process',
      description: 'How to assign and manage customer profiles effectively.',
      process: [
        { step: 'Data Collection', description: 'Gather firmographic, financial, and behavioral data' },
        { step: 'Scoring', description: 'Apply scoring model to determine segment and value' },
        { step: 'Profile Mapping', description: 'Map segment + value to appropriate profiles' },
        { step: 'Validation', description: 'Review high-value assignments manually' },
        { step: 'Communication', description: 'Inform customer-facing teams of profile and implications' },
        { step: 'Monitoring', description: 'Track profile performance and trigger re-evaluation' }
      ],
      automation: [
        'Automatic assignment for new customers based on initial data',
        'Triggered re-evaluation when key metrics change',
        'Alerts for profile mismatches (e.g., high spend in low tier)',
        'Approval workflow for profile upgrades/downgrades',
        'Audit trail of all profile changes'
      ]
    },
    {
      practice: 'Profile Governance',
      description: 'Maintain profile integrity and effectiveness over time.',
      governanceModel: [
        { role: 'Profile Owner', responsibility: 'Define profile criteria and thresholds', review: 'Quarterly' },
        { role: 'Data Steward', responsibility: 'Ensure data quality for profile assignment', review: 'Monthly' },
        { role: 'Business Analyst', responsibility: 'Monitor profile performance and recommend changes', review: 'Monthly' },
        { role: 'Executive Sponsor', responsibility: 'Approve profile changes and resolve disputes', review: 'Quarterly' }
      ],
      metrics: [
        { metric: 'Profile Distribution', target: 'Balanced distribution across profiles' },
        { metric: 'Assignment Accuracy', target: '>95% correct initial assignment' },
        { metric: 'Exception Rate', target: '<10% of transactions require exception' },
        { metric: 'Profile Churn', target: '<5% profile changes per quarter' },
        { metric: 'Business Impact', target: 'Measurable improvement in target metrics' }
      ]
    },
    {
      practice: 'Profile Communication',
      description: 'How to communicate profiles internally and externally.',
      internal: [
        'Sales training on profile implications for pricing, credit, service',
        'Account manager visibility into customer profiles',
        'Support team routing based on service profile',
        'Finance team understanding of credit profiles',
        'Executive dashboards showing profile distribution and performance'
      ],
      external: [
        'Clear communication of benefits at each tier',
        'Transparent criteria for tier progression',
        'Proactive notification of tier changes',
        'Self-service visibility into current tier and next level requirements',
        'Celebration of tier upgrades as relationship milestones'
      ]
    }
  ];

  const exampleProfiles = [
    { id: 'PRF-001', name: 'Enterprise Premium', type: 'Credit', creditLimit: '$5,000,000', terms: 'Net 60', discount: '25%', service: 'Platinum', customers: 12 },
    { id: 'PRF-002', name: 'Enterprise Standard', type: 'Credit', creditLimit: '$1,000,000', terms: 'Net 45', discount: '20%', service: 'Gold', customers: 45 },
    { id: 'PRF-003', name: 'Mid-Market', type: 'Credit', creditLimit: '$250,000', terms: 'Net 30', discount: '15%', service: 'Silver', customers: 180 },
    { id: 'PRF-004', name: 'SMB Standard', type: 'Credit', creditLimit: '$50,000', terms: 'Net 30', discount: '10%', service: 'Bronze', customers: 520 },
    { id: 'PRF-005', name: 'New Customer', type: 'Credit', creditLimit: '$10,000', terms: 'Net 15', discount: '5%', service: 'Self-Service', customers: 340 },
    { id: 'PRF-006', name: 'Government/EDU', type: 'Pricing', creditLimit: 'Per contract', terms: 'Net 45', discount: '30%', service: 'Gold', customers: 85 },
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
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl flex items-center justify-center shadow-xl">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-slate-900">Profiles Module</h1>
              <p className="text-2xl text-slate-600">Commercial Terms & Segmentation</p>
            </div>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <p className="text-lg text-amber-900 mb-2">
              <strong>Purpose:</strong> Standardize commercial terms, pricing, credit, and service levels through reusable profiles that ensure consistency and enable automation.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">6 Profile Types</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">+10% Margin Gain</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">85% Bad Debt Reduction</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">95% Auto-Assignment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'features', label: 'Profile Types', icon: Layers },
              { key: 'scenarios', label: 'Real Scenarios', icon: Target },
              { key: 'practices', label: 'Best Practices', icon: Award },
              { key: 'data', label: 'Example Data', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4 ${
                    activeTab === tab.key
                      ? 'border-amber-600 text-amber-600'
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Commercial Profiles Matter?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Profiles
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Inconsistent pricing erodes margins</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Ad-hoc credit decisions increase risk</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Service levels misaligned with value</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Every deal negotiated from scratch</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span><span>Customer experience varies wildly</span></li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Profiles
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Standardized pricing protects margins</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Credit profiles reduce bad debt 85%</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Service aligned with customer value</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Automatic profile assignment saves time</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Consistent, predictable experience</span></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Profile Types Visual */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Profile Categories</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { type: 'Credit Profiles', icon: CreditCard, items: ['Credit limits', 'Payment terms', 'Risk tolerance'], color: 'from-blue-600 to-blue-800' },
                  { type: 'Pricing Profiles', icon: Percent, items: ['Base discounts', 'Volume tiers', 'Approval rules'], color: 'from-green-600 to-green-800' },
                  { type: 'Service Profiles', icon: Star, items: ['SLA levels', 'Support access', 'Account coverage'], color: 'from-purple-600 to-purple-800' },
                  { type: 'Terms Profiles', icon: FileText, items: ['Contract terms', 'Liability caps', 'Warranties'], color: 'from-amber-600 to-amber-800' },
                  { type: 'Segment Profiles', icon: Users, items: ['Customer tiers', 'Industry rules', 'Geo settings'], color: 'from-indigo-600 to-indigo-800' },
                  { type: 'Combined Profiles', icon: Layers, items: ['Multi-profile bundles', 'Auto-assignment', 'Inheritance'], color: 'from-slate-600 to-slate-800' }
                ].map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={`item-${i}`} className={`bg-gradient-to-br ${t.color} p-6 rounded-2xl text-white`}>
                      <Icon className="h-10 w-10 mb-4" />
                      <h3 className="text-lg font-bold mb-3">{t.type}</h3>
                      <ul className="space-y-1 text-sm opacity-90">
                        {t.items.map((item, j) => (
                          <li key={j}>• {item}</li>
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
            {profileManagementFeatures.map((feature, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-white p-8 border-b-2 border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{feature.feature}</h2>
                  <p className="text-lg text-slate-700">{feature.description}</p>
                </div>
                <div className="p-8 space-y-6">
                  {feature.profileTypes && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Profile Options:</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              {Object.keys(feature.profileTypes[0]).map((key) => (
                                <th key={key} className="text-left p-3 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {feature.profileTypes.map((profile, i) => (
                              <tr key={`item-${i}`}>
                                {Object.values(profile).map((value, j) => (
                                  <td key={j} className={`p-3 ${j === 0 ? 'font-semibold' : ''}`}>{String(value)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {feature.automation && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Automation:</h3>
                      <ul className="space-y-2">
                        {feature.automation.map((item, i) => (
                          <li key={`item-${i}`} className="flex items-start gap-2">
                            <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feature.rules && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Rules:</h3>
                      <ul className="space-y-2">
                        {feature.rules.map((rule, i) => (
                          <li key={`item-${i}`} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feature.example && (
                    <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200">
                      <h3 className="text-xl font-bold text-amber-900 mb-4">Real Example:</h3>
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

                  {scenario.withoutProfiles && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                        <h3 className="text-xl font-bold text-red-900 mb-4">Without Profiles</h3>
                        <div className="space-y-3 text-sm">
                          <p><strong>What Happens:</strong> {scenario.withoutProfiles.what}</p>
                          <p><strong>Result:</strong> {scenario.withoutProfiles.result}</p>
                          <p className="font-bold text-red-800 text-lg pt-3 border-t border-red-200">Loss: {scenario.withoutProfiles.loss}</p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                        <h3 className="text-xl font-bold text-green-900 mb-4">With Profiles</h3>
                        <div className="space-y-3 text-sm">
                          <p><strong>What Happens:</strong> {scenario.withProfiles.what}</p>
                          <p><strong>Action:</strong> {scenario.withProfiles.action}</p>
                          <p><strong>Result:</strong> {scenario.withProfiles.result}</p>
                          <p className="font-bold text-green-800 text-lg pt-3 border-t border-green-200">Saved: {scenario.withProfiles.saved}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scenario.improvement && (
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(scenario.improvement).map(([key, value], i) => (
                        <div key={`item-${i}`} className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-2xl font-bold text-green-600">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-amber-900 font-semibold flex items-center gap-2">
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
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Profile Management Best Practices</h2>
              <p className="text-xl opacity-90">Guidelines for effective commercial profile implementation</p>
            </div>

            {bestPractices.map((practice, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{practice.practice}</h3>
                <p className="text-lg text-slate-700 mb-6">{practice.description}</p>
                
                {practice.principles && (
                  <div className="space-y-3 mb-6">
                    {practice.principles.map((p, i) => (
                      <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                        <span className="font-bold text-slate-900">{p.principle}:</span>
                        <span className="text-slate-600 ml-2">{p.guideline}</span>
                      </div>
                    ))}
                  </div>
                )}

                {practice.process && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Assignment Process:</h4>
                    <div className="space-y-2">
                      {practice.process.map((step, i) => (
                        <div key={`item-${i}`} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                          <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{step.step}:</span>
                            <span className="text-slate-600 ml-2">{step.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {practice.metrics && (
                  <div className="grid md:grid-cols-2 gap-3">
                    {practice.metrics.map((m, i) => (
                      <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                        <div className="font-bold text-slate-900">{m.metric}</div>
                        <p className="text-sm text-amber-600">Target: {m.target}</p>
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
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Active Commercial Profiles</h2>
              <p className="text-xl opacity-90">Example profile configuration and customer distribution</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Profile ID</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Credit Limit</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Terms</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Discount</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Service</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Customers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exampleProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{profile.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-amber-600" />
                          </div>
                          <span className="font-medium text-slate-900">{profile.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          {profile.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{profile.creditLimit}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{profile.terms}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{profile.discount}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{profile.service}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{profile.customers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Profiles</p>
                <p className="text-3xl font-bold text-slate-900">{exampleProfiles.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-blue-600">1,182</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Credit Exposure</p>
                <p className="text-3xl font-bold text-amber-600">$68.5M</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Auto-Assigned</p>
                <p className="text-3xl font-bold text-green-600">95%</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-amber-600 to-amber-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Standardize Your Commercial Terms?</h2>
          <p className="text-xl mb-6 opacity-90">
            See how IB Commerce profiles reduce risk, protect margins, and improve customer experience
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-amber-600 font-bold rounded-xl hover:shadow-xl transition-all"
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

export default ProfilesPage;
