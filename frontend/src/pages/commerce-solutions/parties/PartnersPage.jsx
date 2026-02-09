import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IBCommerceHub from '../../IBCommerceHub';
import { 
  Briefcase, DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  Shield, Activity, Clock, Target, BarChart3, Calendar,
  Award, Users, Star, ArrowLeft, FileText, Percent, Gift,
  Handshake, Globe, Layers, Zap, Crown, Medal
} from 'lucide-react';

const PartnersPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const partnerManagementFeatures = [
    {
      feature: 'Partner Tiering System',
      description: 'Structured partner classification based on performance, commitment, and strategic value with automatic tier progression.',
      tiers: [
        { tier: 'Platinum', requirements: '$5M+ annual revenue, 95% satisfaction, certified team', benefits: '40% margin, priority support, co-marketing funds, executive sponsorship', color: 'from-slate-400 to-slate-600' },
        { tier: 'Gold', requirements: '$1M+ annual revenue, 90% satisfaction, 2+ certifications', benefits: '35% margin, dedicated account manager, lead sharing, training credits', color: 'from-yellow-400 to-yellow-600' },
        { tier: 'Silver', requirements: '$250K+ annual revenue, 85% satisfaction, 1 certification', benefits: '30% margin, partner portal access, quarterly reviews', color: 'from-slate-300 to-slate-400' },
        { tier: 'Bronze', requirements: 'Signed agreement, completed onboarding', benefits: '25% margin, basic portal access, self-service resources', color: 'from-amber-600 to-amber-800' }
      ],
      example: {
        partner: 'TechSolutions Inc',
        startTier: 'Bronze (Year 1)',
        year1Revenue: '$180,000',
        year2Tier: 'Silver (achieved $320K)',
        year3Tier: 'Gold (achieved $1.2M)',
        currentMargin: '35% ($420K profit)',
        journey: '3 years from Bronze to Gold'
      },
      prevention: 'Prevents partner dissatisfaction from unclear expectations and ensures top performers get rewarded'
    },
    {
      feature: 'Deal Registration & Protection',
      description: 'Secure deal registration system that protects partner investments and prevents channel conflict.',
      howItWorks: [
        'Partner registers opportunity with customer details',
        'System checks for conflicts (existing deals, direct sales activity)',
        'Approved deals get 90-day protection window',
        'Protected margin guaranteed regardless of competition',
        'Automatic extension if deal progresses to later stages',
        'Conflict resolution workflow for disputed deals'
      ],
      example: {
        scenario: 'Partner registers $500K opportunity at Acme Corp',
        protection: '90-day exclusive window',
        conflict: 'Direct sales team had prior contact',
        resolution: 'System flagged conflict, partner gets 60-day window + first right of refusal',
        outcome: 'Partner closes deal, earns full 35% margin ($175K)'
      },
      prevention: 'Prevents channel conflict, protects partner investments, ensures fair competition'
    },
    {
      feature: 'Commission & Rebate Management',
      description: 'Automated calculation and tracking of partner commissions, rebates, and incentive payments.',
      commissionTypes: [
        { type: 'Resale Margin', calculation: 'Discount from list price (25-40% based on tier)', frequency: 'Per transaction' },
        { type: 'Referral Fee', calculation: '5-10% of deal value for qualified referrals', frequency: 'Upon deal close' },
        { type: 'Quarterly Rebate', calculation: '2-5% additional based on volume targets', frequency: 'Quarterly' },
        { type: 'SPIFF', calculation: 'Fixed bonus for specific products/promotions', frequency: 'Per qualifying deal' },
        { type: 'MDF', calculation: 'Marketing development funds (2-4% of sales)', frequency: 'Quarterly allocation' }
      ],
      example: {
        partner: 'CloudFirst Partners',
        quarterlyRevenue: '$800,000',
        baseMargin: '32% = $256,000',
        volumeRebate: '3% = $24,000',
        spiffBonus: '$15,000 (new product launch)',
        mdfEarned: '$32,000',
        totalEarnings: '$327,000 (40.9% effective margin)'
      },
      prevention: 'Prevents commission disputes, ensures accurate payouts, motivates partner performance'
    },
    {
      feature: 'Partner Performance Scorecard',
      description: 'Comprehensive performance tracking across multiple dimensions with automated scoring and recommendations.',
      metrics: [
        { metric: 'Revenue Achievement', weight: '30%', measurement: 'Actual vs. target revenue' },
        { metric: 'Deal Registration Quality', weight: '20%', measurement: 'Registration-to-close ratio, accuracy' },
        { metric: 'Customer Satisfaction', weight: '20%', measurement: 'CSAT scores from joint customers' },
        { metric: 'Certification Compliance', weight: '15%', measurement: 'Team certifications current' },
        { metric: 'Engagement Level', weight: '15%', measurement: 'Portal usage, training, events' }
      ],
      example: {
        partner: 'Digital Dynamics',
        revenueScore: '92/100 (exceeded target by 15%)',
        dealRegScore: '78/100 (good registration, some late submissions)',
        csatScore: '88/100 (strong customer feedback)',
        certScore: '100/100 (all certs current)',
        engagementScore: '85/100 (active portal user)',
        overallScore: '88.1 - Gold tier, trending to Platinum'
      },
      prevention: 'Prevents surprise tier demotions, identifies improvement areas early, drives continuous improvement'
    },
    {
      feature: 'Co-Selling & Lead Sharing',
      description: 'Structured collaboration between direct sales and partners for complex opportunities.',
      programs: [
        { program: 'Lead Sharing', description: 'Qualified leads passed to partners based on territory/expertise', benefit: 'Partners get warm leads, vendor gets coverage' },
        { program: 'Co-Sell', description: 'Joint pursuit of large opportunities with shared resources', benefit: 'Combined expertise wins complex deals' },
        { program: 'Influenced Revenue', description: 'Partner influence recognized even on direct deals', benefit: 'Rewards partner ecosystem contribution' },
        { program: 'White-Glove', description: 'Vendor resources support partner-led deals', benefit: 'Technical expertise without direct involvement' }
      ],
      example: {
        opportunity: '$2M Enterprise Deal at GlobalCorp',
        model: 'Co-Sell',
        vendorContribution: 'Solution architecture, executive sponsorship',
        partnerContribution: 'Customer relationship, implementation services',
        revenueSpilt: 'Partner: $800K services, Vendor: $1.2M licenses',
        partnerMargin: '$280K on licenses + $320K on services'
      },
      prevention: 'Prevents missed opportunities, leverages combined strengths, maximizes deal size'
    }
  ];

  const realWorldScenarios = [
    {
      title: 'The Channel Conflict Resolution Story',
      company: 'Enterprise Software Vendor',
      situation: 'Two partners and direct sales all pursuing the same $1.5M opportunity at a Fortune 500 company.',
      withoutSystem: {
        what: 'All three compete aggressively, undercutting each other on price',
        result: 'Customer confused, deal delayed 6 months, margin eroded to 10%',
        loss: 'Lost $200K in margin, damaged partner relationships'
      },
      withSystem: {
        what: 'Deal registration system identified conflict immediately',
        action: 'Automated conflict resolution: Partner A had earliest registration, Partner B had deepest relationship',
        result: 'Structured co-sell with Partner B leading, Partner A supporting',
        saved: 'Full margin preserved ($450K), both partners compensated fairly'
      },
      lesson: 'Automated conflict detection and resolution protects margins and partner relationships.'
    },
    {
      title: 'The Partner Growth Journey',
      company: 'Cloud Services Provider',
      situation: 'Small regional partner wants to grow but lacks resources and expertise.',
      journey: [
        { phase: 'Bronze Start', investment: 'Basic onboarding only', revenue: '$50K Year 1', support: 'Self-service portal' },
        { phase: 'Enablement', investment: '$10K training investment', revenue: '$150K Year 2', support: 'Online certification' },
        { phase: 'Silver Achievement', investment: '$25K co-marketing', revenue: '$400K Year 3', support: 'Dedicated partner manager' },
        { phase: 'Gold Status', investment: '$50K joint business plan', revenue: '$1.2M Year 4', support: 'Executive sponsorship' },
        { phase: 'Strategic Partner', investment: '$100K innovation fund', revenue: '$3M Year 5', support: 'Joint solution development' }
      ],
      totalInvestment: '$185,000 over 5 years',
      totalRevenue: '$4.8M generated',
      roi: '26x return on partner investment',
      lesson: 'Structured partner development programs create exponential returns.'
    },
    {
      title: 'The Commission Dispute Prevention Story',
      company: 'Technology Distributor',
      situation: 'Partner claims $45K in unpaid commissions from complex multi-quarter deal.',
      withoutSystem: {
        what: 'Manual tracking lost records, conflicting spreadsheets',
        result: 'Dispute took 3 months to resolve, partner threatened to leave',
        loss: '$45K paid without verification + legal costs + damaged relationship'
      },
      withSystem: {
        what: 'Automated commission tracking from deal registration through payment',
        action: 'System showed complete audit trail: registrations, approvals, payments',
        result: 'Discrepancy identified in 2 hours - $12K legitimately owed, rest was duplicate claim',
        saved: '$33K in erroneous payment + relationship preserved with transparency'
      },
      lesson: 'Automated commission tracking prevents disputes and builds partner trust.'
    },
    {
      title: 'The Market Expansion Success',
      company: 'SaaS Platform Vendor',
      situation: 'Wanted to expand into LATAM market but had no local presence.',
      approach: [
        { step: 'Partner Recruitment', action: 'Identified 5 regional partners with complementary offerings', result: '3 qualified, 2 signed' },
        { step: 'Enablement Investment', action: '$150K in localization, training, marketing', result: 'Partners fully enabled in 90 days' },
        { step: 'Joint Go-to-Market', action: 'Co-branded campaigns, local events, reference customers', result: '47 qualified opportunities in Q1' },
        { step: 'First Year Results', action: 'Dedicated support, quarterly business reviews', result: '$2.3M revenue from LATAM' }
      ],
      investment: '$250,000 total',
      revenue: '$2.3M Year 1, $5.1M Year 2',
      alternative: 'Direct expansion would have cost $1.5M+ and taken 2+ years',
      lesson: 'Strategic partner programs enable faster, lower-risk market expansion.'
    }
  ];

  const bestPractices = [
    {
      practice: 'Partner Recruitment & Qualification',
      description: 'Structured process to identify, evaluate, and onboard the right partners.',
      frequency: 'Ongoing with quarterly pipeline reviews',
      criteria: [
        { criterion: 'Market Alignment', weight: '25%', evaluation: 'Target market overlap, geographic coverage' },
        { criterion: 'Technical Capability', weight: '25%', evaluation: 'Relevant expertise, certifications, delivery capacity' },
        { criterion: 'Financial Stability', weight: '20%', evaluation: 'Credit check, revenue history, growth trajectory' },
        { criterion: 'Cultural Fit', weight: '15%', evaluation: 'Values alignment, communication style, commitment level' },
        { criterion: 'Growth Potential', weight: '15%', evaluation: 'Market position, investment appetite, strategic vision' }
      ],
      checklist: [
        'Initial discovery call to assess mutual fit',
        'Business plan review and market analysis',
        'Reference checks with existing customers',
        'Technical assessment or proof of capability',
        'Contract negotiation and legal review',
        'Onboarding program completion'
      ]
    },
    {
      practice: 'Partner Business Planning',
      description: 'Annual joint business planning to align goals, investments, and activities.',
      frequency: 'Annual plan with quarterly reviews',
      components: [
        { component: 'Revenue Targets', description: 'Mutually agreed targets by product, segment, quarter' },
        { component: 'Investment Commitment', description: 'Training, certifications, marketing, headcount' },
        { component: 'Go-to-Market Activities', description: 'Campaigns, events, content, demand generation' },
        { component: 'Enablement Plan', description: 'Training schedule, certification goals, resource access' },
        { component: 'Success Metrics', description: 'KPIs for revenue, customer satisfaction, engagement' }
      ],
      template: {
        q1Focus: 'Pipeline building, certification completion',
        q2Focus: 'Campaign execution, deal acceleration',
        q3Focus: 'Customer success, reference development',
        q4Focus: 'Target achievement, next year planning'
      }
    },
    {
      practice: 'Partner Communication & Engagement',
      description: 'Regular, structured communication to maintain alignment and momentum.',
      touchpoints: [
        { touchpoint: 'Weekly', activity: 'Deal desk support, opportunity updates', owner: 'Partner Manager' },
        { touchpoint: 'Monthly', activity: 'Performance review, pipeline analysis', owner: 'Partner Manager' },
        { touchpoint: 'Quarterly', activity: 'Business review, strategy alignment', owner: 'Partner Director' },
        { touchpoint: 'Annual', activity: 'Executive business review, planning', owner: 'VP Partnerships' }
      ],
      channels: [
        'Partner portal for self-service resources',
        'Slack/Teams channel for real-time communication',
        'Monthly newsletter with updates and opportunities',
        'Partner advisory council for strategic input',
        'Annual partner summit for networking and recognition'
      ]
    },
    {
      practice: 'Partner Enablement Program',
      description: 'Comprehensive training and certification program to ensure partner success.',
      tracks: [
        { track: 'Sales Enablement', content: 'Product positioning, competitive differentiation, objection handling', certification: 'Sales Certified' },
        { track: 'Technical Training', content: 'Architecture, implementation, integration, troubleshooting', certification: 'Technical Certified' },
        { track: 'Delivery Excellence', content: 'Project methodology, best practices, quality standards', certification: 'Delivery Certified' },
        { track: 'Customer Success', content: 'Adoption strategies, expansion plays, renewal management', certification: 'Success Certified' }
      ],
      resources: [
        'On-demand video training library',
        'Live instructor-led workshops',
        'Hands-on lab environments',
        'Certification exams with badges',
        'Sales playbooks and battle cards',
        'Demo environments and trial licenses'
      ]
    }
  ];

  const examplePartners = [
    { id: 'PTR-001', name: 'CloudFirst Solutions', tier: 'Platinum', region: 'North America', revenue: '$5.2M', deals: 47, satisfaction: '96%', certifications: 12 },
    { id: 'PTR-002', name: 'Digital Dynamics', tier: 'Gold', region: 'EMEA', revenue: '$1.8M', deals: 23, satisfaction: '92%', certifications: 6 },
    { id: 'PTR-003', name: 'TechBridge Partners', tier: 'Gold', region: 'APAC', revenue: '$1.4M', deals: 19, satisfaction: '89%', certifications: 5 },
    { id: 'PTR-004', name: 'Innovate Systems', tier: 'Silver', region: 'North America', revenue: '$420K', deals: 8, satisfaction: '91%', certifications: 3 },
    { id: 'PTR-005', name: 'NextGen Consulting', tier: 'Silver', region: 'LATAM', revenue: '$380K', deals: 11, satisfaction: '87%', certifications: 2 },
    { id: 'PTR-006', name: 'Apex Integration', tier: 'Bronze', region: 'EMEA', revenue: '$95K', deals: 3, satisfaction: '85%', certifications: 1 },
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
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center shadow-xl">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-slate-900">Partners Module</h1>
              <p className="text-2xl text-slate-600">Channel & Alliance Management</p>
            </div>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <p className="text-lg text-purple-900 mb-2">
              <strong>Purpose:</strong> Recruit, enable, and grow a high-performing partner ecosystem that extends market reach and drives scalable revenue.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">40% Revenue via Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">150+ Active Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">26x Partner ROI</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">45 Countries Covered</span>
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
              { key: 'data', label: 'Example Data', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4 ${
                    activeTab === tab.key
                      ? 'border-purple-600 text-purple-600'
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Partner Management Matters?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Proper Management
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Channel conflict destroys margins and relationships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Commission disputes damage partner trust</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Top partners leave for competitors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Market coverage gaps limit growth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Inconsistent partner experience hurts brand</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Partners Module
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Automated deal registration prevents conflicts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Transparent commission tracking builds trust</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Performance-based tiering rewards top partners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Structured enablement accelerates partner success</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Co-selling programs maximize deal size</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Partner Lifecycle</h2>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Recruitment', desc: 'Identify, qualify, and sign partners aligned with strategy', icon: Users },
                  { step: '2', title: 'Onboarding', desc: 'Complete training, certification, and system setup', icon: Layers },
                  { step: '3', title: 'Enablement', desc: 'Ongoing training, resources, and support to drive capability', icon: Zap },
                  { step: '4', title: 'Activation', desc: 'Joint business planning, pipeline building, first deals', icon: Target },
                  { step: '5', title: 'Growth', desc: 'Expand engagement, increase tier, deepen relationship', icon: TrendingUp },
                  { step: '6', title: 'Strategic Partnership', desc: 'Co-innovation, executive alignment, market leadership', icon: Crown }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={`item-${index}`} className="flex items-start gap-4 bg-white p-6 rounded-2xl border-2 border-slate-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <Icon className="h-5 w-5 text-purple-600" />
                          {item.title}
                        </h3>
                        <p className="text-slate-700">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Partner Tier Visual */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Partner Tier Structure</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { tier: 'Platinum', icon: Crown, color: 'from-slate-600 to-slate-800', margin: '40%', benefits: 'Executive sponsorship, co-innovation, unlimited MDF' },
                  { tier: 'Gold', icon: Medal, color: 'from-yellow-500 to-yellow-700', margin: '35%', benefits: 'Dedicated manager, lead sharing, training credits' },
                  { tier: 'Silver', icon: Award, color: 'from-slate-400 to-slate-500', margin: '30%', benefits: 'Partner portal, quarterly reviews, deal registration' },
                  { tier: 'Bronze', icon: Star, color: 'from-amber-600 to-amber-800', margin: '25%', benefits: 'Basic portal access, self-service resources' }
                ].map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={`item-${i}`} className={`bg-gradient-to-br ${t.color} p-6 rounded-2xl text-white`}>
                      <Icon className="h-10 w-10 mb-4" />
                      <h3 className="text-xl font-bold mb-2">{t.tier}</h3>
                      <p className="text-3xl font-bold mb-2">{t.margin}</p>
                      <p className="text-sm opacity-90">{t.benefits}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-12">
            {partnerManagementFeatures.map((feature, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-white p-8 border-b-2 border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{feature.feature}</h2>
                  <p className="text-lg text-slate-700">{feature.description}</p>
                </div>
                <div className="p-8 space-y-6">
                  {feature.tiers && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Partner Tiers:</h3>
                      <div className="space-y-3">
                        {feature.tiers.map((tier, i) => (
                          <div key={`item-${i}`} className={`bg-gradient-to-r ${tier.color} p-4 rounded-xl text-white`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-lg">{tier.tier}</span>
                            </div>
                            <p className="text-sm opacity-90 mb-1"><strong>Requirements:</strong> {tier.requirements}</p>
                            <p className="text-sm opacity-90"><strong>Benefits:</strong> {tier.benefits}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.howItWorks && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">How It Works:</h3>
                      <ul className="space-y-2">
                        {feature.howItWorks.map((step, i) => (
                          <li key={`item-${i}`} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feature.commissionTypes && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Commission Types:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {feature.commissionTypes.map((comm, i) => (
                          <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                            <div className="font-bold text-slate-900 mb-1">{comm.type}</div>
                            <p className="text-sm text-slate-600">{comm.calculation}</p>
                            <p className="text-xs text-purple-600 mt-1">{comm.frequency}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.metrics && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Performance Metrics:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {feature.metrics.map((metric, i) => (
                          <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900">{metric.metric}</span>
                              <span className="text-purple-600 font-bold">{metric.weight}</span>
                            </div>
                            <p className="text-sm text-slate-600">{metric.measurement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.programs && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Co-Selling Programs:</h3>
                      <div className="space-y-3">
                        {feature.programs.map((prog, i) => (
                          <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                            <div className="font-bold text-slate-900 mb-1">{prog.program}</div>
                            <p className="text-sm text-slate-600">{prog.description}</p>
                            <p className="text-sm text-green-600 mt-1">✓ {prog.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.example && (
                    <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-200">
                      <h3 className="text-xl font-bold text-purple-900 mb-4">Real Example:</h3>
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

                  {scenario.withoutSystem && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                        <h3 className="text-xl font-bold text-red-900 mb-4">Without System</h3>
                        <div className="space-y-3 text-sm text-slate-700">
                          <p><strong>What Happens:</strong> {scenario.withoutSystem.what}</p>
                          <p><strong>Result:</strong> {scenario.withoutSystem.result}</p>
                          <p className="font-bold text-red-800 text-lg pt-3 border-t border-red-200">Loss: {scenario.withoutSystem.loss}</p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                        <h3 className="text-xl font-bold text-green-900 mb-4">With System</h3>
                        <div className="space-y-3 text-sm text-slate-700">
                          <p><strong>What Happens:</strong> {scenario.withSystem.what}</p>
                          <p><strong>Action:</strong> {scenario.withSystem.action}</p>
                          <p><strong>Result:</strong> {scenario.withSystem.result}</p>
                          <p className="font-bold text-green-800 text-lg pt-3 border-t border-green-200">Saved: {scenario.withSystem.saved}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scenario.journey && (
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Partner Development Journey:</h3>
                      <div className="space-y-4">
                        {scenario.journey.map((stage, i) => (
                          <div key={`item-${i}`} className="flex items-start gap-4 bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-200">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-bold text-slate-900">{stage.phase}</h4>
                                <span className="text-2xl font-bold text-purple-600">{stage.revenue}</span>
                              </div>
                              <p className="text-sm text-slate-600">Investment: {stage.investment}</p>
                              <p className="text-sm text-slate-600">Support: {stage.support}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 grid md:grid-cols-3 gap-4">
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                          <p className="text-sm text-slate-600">Total Investment:</p>
                          <p className="text-2xl font-bold text-purple-600">{scenario.totalInvestment}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-slate-600">Total Revenue:</p>
                          <p className="text-2xl font-bold text-green-600">{scenario.totalRevenue}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <p className="text-sm text-slate-600">ROI:</p>
                          <p className="text-2xl font-bold text-blue-600">{scenario.roi}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scenario.approach && (
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Expansion Approach:</h3>
                      <div className="space-y-4">
                        {scenario.approach.map((step, i) => (
                          <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                            <div className="font-bold text-slate-900">{step.step}</div>
                            <p className="text-sm text-slate-600">Action: {step.action}</p>
                            <p className="text-sm text-green-600">Result: {step.result}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl">
                          <p className="text-sm text-slate-600">Partner Route Results:</p>
                          <p className="text-xl font-bold text-green-600">Investment: {scenario.investment}</p>
                          <p className="text-xl font-bold text-green-600">Revenue: {scenario.revenue}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl">
                          <p className="text-sm text-slate-600">Direct Alternative:</p>
                          <p className="text-lg text-red-600">{scenario.alternative}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-purple-900 font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <strong>Key Lesson:</strong> {scenario.lesson}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'practices' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Partner Management Best Practices</h2>
              <p className="text-xl opacity-90">Based on ASAP, Forrester, and leading partner programs</p>
            </div>

            {bestPractices.map((practice, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{practice.practice}</h3>
                <p className="text-lg text-slate-700 mb-6">{practice.description}</p>
                
                {practice.frequency && (
                  <div className="bg-purple-50 p-4 rounded-xl mb-6">
                    <p className="font-semibold text-purple-900">
                      <Clock className="h-5 w-5 inline mr-2" />
                      Frequency: {practice.frequency}
                    </p>
                  </div>
                )}

                {practice.criteria && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Evaluation Criteria:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {practice.criteria.map((crit, i) => (
                        <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{crit.criterion}</span>
                            <span className="text-purple-600 font-bold">{crit.weight}</span>
                          </div>
                          <p className="text-sm text-slate-600">{crit.evaluation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {practice.checklist && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Recruitment Checklist:</h4>
                    <ul className="space-y-2">
                      {practice.checklist.map((item, i) => (
                        <li key={`item-${i}`} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {practice.components && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Business Plan Components:</h4>
                    <div className="space-y-3">
                      {practice.components.map((comp, i) => (
                        <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                          <span className="font-bold text-slate-900">{comp.component}:</span>
                          <span className="text-slate-600 ml-2">{comp.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {practice.touchpoints && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Communication Cadence:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {practice.touchpoints.map((tp, i) => (
                        <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                          <div className="font-bold text-purple-600 mb-1">{tp.touchpoint}</div>
                          <p className="text-sm text-slate-600">{tp.activity}</p>
                          <p className="text-xs text-slate-500 mt-1">Owner: {tp.owner}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {practice.tracks && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Enablement Tracks:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {practice.tracks.map((track, i) => (
                        <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                          <div className="font-bold text-slate-900 mb-1">{track.track}</div>
                          <p className="text-sm text-slate-600">{track.content}</p>
                          <p className="text-xs text-purple-600 mt-2">🎓 {track.certification}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Partner Directory</h2>
              <p className="text-xl opacity-90">Example partner data across tiers and regions</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Partner ID</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Tier</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Region</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Annual Revenue</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Deals</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">CSAT</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Certs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {examplePartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{partner.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="font-medium text-slate-900">{partner.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partner.tier === 'Platinum' ? 'bg-slate-200 text-slate-800' :
                          partner.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                          partner.tier === 'Silver' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {partner.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{partner.region}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{partner.revenue}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{partner.deals}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          parseInt(partner.satisfaction) >= 90 ? 'text-green-600' : 'text-yellow-600'
                        }`}>{partner.satisfaction}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-600 font-semibold">{partner.certifications}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Partners</p>
                <p className="text-3xl font-bold text-slate-900">{examplePartners.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">$9.3M</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Deals</p>
                <p className="text-3xl font-bold text-blue-600">111</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Avg Satisfaction</p>
                <p className="text-3xl font-bold text-purple-600">90%</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build a World-Class Partner Program?</h2>
          <p className="text-xl mb-6 opacity-90">
            See how IB Commerce helps you recruit, enable, and grow partners that drive 40%+ of revenue
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-xl transition-all"
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

export default PartnersPage;
