import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IBCommerceHub from '../../IBCommerceHub';
import { 
  Building2, DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  Shield, Activity, Clock, Target, BarChart3, Calendar,
  CreditCard, Bell, FileText, TrendingDown, Award, Lock, ArrowLeft, Star,
  Truck, Package, Users, Search, ClipboardCheck, Settings
} from 'lucide-react';

const VendorsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const vendorManagementFeatures = [
    {
      feature: 'Dynamic Spend Limits',
      description: 'Intelligent spend controls that adapt based on vendor performance, compliance status, and business criticality.',
      howItWorks: [
        'Initial spend limit set based on vendor assessment',
        'System monitors delivery quality and compliance continuously',
        'Auto-increase for vendors with consistent performance',
        'Auto-decrease if quality issues or compliance gaps detected',
        'Alerts sent before limit adjustments'
      ],
      example: {
        vendor: 'TechSupply Corp',
        year1: '$50,000/year (new vendor, trial period)',
        performance: '12 months, 98% on-time delivery, zero defects',
        year2: '$200,000/year (4x increase, preferred vendor)',
        year3: '$500,000/year (strategic partner status)'
      },
      prevention: 'Prevents over-reliance on unproven vendors and under-utilization of top performers'
    },
    {
      feature: 'Compliance & Risk Monitoring',
      description: 'Real-time tracking of vendor certifications, insurance, and regulatory compliance.',
      howItWorks: [
        'Tracks all vendor certifications and expiry dates',
        'Monitors insurance coverage levels',
        'Validates tax compliance and registrations',
        'Checks against sanctions and blacklists',
        'Automatically blocks non-compliant vendors from new POs'
      ],
      example: {
        scenario: 'Procurement creates PO for $100K services',
        vendorStatus: 'ISO certification expired 2 weeks ago',
        insuranceCoverage: '$500K (below required $1M)',
        systemAction: 'PO blocked at creation, compliance team alerted',
        resolution: 'Vendor updated certs within 48 hours, PO released'
      },
      prevention: 'Prevents contracts with non-compliant vendors that could create legal/regulatory exposure'
    },
    {
      feature: 'Vendor Risk Scoring (0-100)',
      description: 'Comprehensive risk assessment combining financial health, operational performance, and compliance.',
      factors: [
        { factor: 'Delivery Performance', weight: '30%', calculation: 'On-time %, quality scores, defect rates' },
        { factor: 'Financial Stability', weight: '25%', calculation: 'Credit rating, payment history to their suppliers' },
        { factor: 'Compliance Status', weight: '20%', calculation: 'Certifications, insurance, regulatory standing' },
        { factor: 'Business Continuity', weight: '15%', calculation: 'Backup capacity, geographic diversification' },
        { factor: 'Relationship Health', weight: '10%', calculation: 'Communication, responsiveness, flexibility' }
      ],
      example: {
        vendor: 'GlobalParts Inc',
        initialScore: '62 (Medium Risk)',
        month6: '71 (improving - better delivery)',
        month12: '85 (Low Risk - strategic partner)',
        impact: 'Longer payment terms offered, priority for new contracts'
      },
      prevention: 'Prevents critical dependencies on high-risk vendors'
    },
    {
      feature: 'Spend Concentration Monitoring',
      description: 'Track and control how much business goes to any single vendor to prevent dangerous dependencies.',
      howItWorks: [
        'Monitors spend by vendor as % of total category spend',
        'Alerts when vendor exceeds concentration threshold (e.g., 40%)',
        'Tracks alternative vendor availability',
        'Flags single-source dependencies',
        'Requires executive approval for high-concentration vendors'
      ],
      example: {
        category: 'Cloud Infrastructure',
        vendor: 'CloudMax Services',
        currentSpend: '$2.4M (68% of category)',
        threshold: '50% max concentration',
        systemAction: 'New POs blocked, CFO approval required',
        recommendation: 'Qualify secondary vendor within 90 days'
      },
      prevention: 'Prevents supply chain disruption from vendor failure or pricing leverage loss'
    },
    {
      feature: 'Payment Terms Optimization',
      description: 'Strategic payment terms based on vendor importance, cash flow needs, and relationship value.',
      termTiers: [
        { tier: 'Strategic Partners', terms: 'Net 60-90', discount: '2% early payment option', benefit: 'Maximum flexibility' },
        { tier: 'Preferred Vendors', terms: 'Net 45', discount: '1.5% for Net 15', benefit: 'Good terms, some flexibility' },
        { tier: 'Standard Vendors', terms: 'Net 30', discount: '1% for Net 10', benefit: 'Industry standard' },
        { tier: 'New/Trial Vendors', terms: 'Net 15 or Prepay', discount: 'None', benefit: 'Risk mitigation' }
      ],
      example: {
        vendor: 'Premium Logistics',
        currentTier: 'Standard (Net 30)',
        performance: '18 months excellent service',
        promotion: 'Upgraded to Preferred (Net 45)',
        annualBenefit: '$45,000 improved cash flow'
      },
      prevention: 'Prevents suboptimal cash management and missed discount opportunities'
    }
  ];

  const realWorldScenarios = [
    {
      title: 'The Vendor Fraud Prevention Story',
      company: 'Manufacturing Corp',
      situation: 'Long-standing vendor of 5 years suddenly requests bank account change for payments.',
      withoutSystem: {
        what: 'AP team processes change request via email',
        result: 'Next 3 payments ($340K) sent to fraudulent account',
        loss: '$340,000 lost to business email compromise fraud'
      },
      withSystem: {
        what: 'System flags bank change as high-risk action',
        action: 'Requires verbal confirmation + 30-day hold on changes',
        result: 'Fraud attempt detected, vendor contacted directly',
        saved: '$340,000 fraud prevented'
      },
      lesson: 'Automated controls on sensitive vendor data changes prevent sophisticated fraud schemes.'
    },
    {
      title: 'The Supply Chain Resilience Story',
      company: 'Electronics Manufacturer',
      situation: 'Primary component supplier (65% of chip supply) announced factory fire, 6-month recovery.',
      withoutSystem: {
        what: 'No visibility into vendor concentration risk',
        result: 'Production halted for 4 months waiting for alternatives',
        loss: '$12M in lost revenue + expedited shipping costs'
      },
      withSystem: {
        what: 'Concentration alerts triggered at 50% threshold 18 months earlier',
        action: 'Secondary supplier qualified and onboarded proactively',
        result: 'Production shifted to backup within 2 weeks',
        saved: '$10M+ in avoided production losses'
      },
      lesson: 'Proactive concentration monitoring enables supply chain resilience before disasters strike.'
    },
    {
      title: 'The Vendor Performance Journey',
      company: 'Retail Chain',
      situation: 'New packaging supplier started with trial contract, grew into strategic partner.',
      journey: [
        { phase: 'Trial Period', spend: '$25,000', terms: 'Net 15, prepay 50%', performance: '95% on-time, minor quality issues' },
        { phase: 'Probation', spend: '$75,000', terms: 'Net 30', performance: '98% on-time, quality improved' },
        { phase: 'Approved', spend: '$200,000', terms: 'Net 30, 1% discount', performance: '99% on-time, zero defects' },
        { phase: 'Preferred', spend: '$500,000', terms: 'Net 45, 2% discount', performance: 'Consistent excellence' },
        { phase: 'Strategic', spend: '$1.2M', terms: 'Net 60, joint planning', performance: 'Innovation partner, co-development' }
      ],
      totalValue: '$2M annual spend over 4 years',
      costSavings: '$180,000 from improved terms + quality',
      lesson: 'Structured vendor development creates long-term value through better terms and quality.'
    },
    {
      title: 'The Compliance Crisis Averted',
      company: 'Pharmaceutical Company',
      situation: 'Key raw material supplier failed FDA audit, putting entire product line at risk.',
      withoutSystem: {
        what: 'No proactive compliance monitoring',
        result: 'Discovered issue during own FDA inspection',
        loss: '$8M in fines + production shutdown + reputation damage'
      },
      withSystem: {
        what: 'System tracked vendor FDA status, flagged warning letter',
        action: 'Procurement paused, compliance review initiated',
        result: 'Alternative qualified supplier activated before crisis',
        saved: '$8M+ in avoided fines and shutdown costs'
      },
      lesson: 'Real-time compliance monitoring protects against regulatory exposure from vendor issues.'
    }
  ];

  const bestPractices = [
    {
      practice: 'Vendor Qualification Process',
      description: 'Structured assessment before any vendor can receive orders.',
      frequency: 'Before first PO, then annual review',
      checklist: [
        'Financial stability check (credit report, references)',
        'Compliance verification (certifications, insurance, licenses)',
        'Quality capability assessment (site visit if critical)',
        'Information security review (for data-handling vendors)',
        'Contract terms negotiation and legal review',
        'System setup (vendor master, payment details verified)'
      ]
    },
    {
      practice: 'Performance Scorecard Reviews',
      description: 'Regular assessment of vendor performance against agreed metrics.',
      frequency: 'Monthly for strategic, quarterly for others',
      metrics: [
        { metric: 'On-Time Delivery', target: '≥95%', weight: '30%' },
        { metric: 'Quality (Defect Rate)', target: '≤2%', weight: '25%' },
        { metric: 'Invoice Accuracy', target: '≥98%', weight: '15%' },
        { metric: 'Responsiveness', target: '≤24hr response', weight: '15%' },
        { metric: 'Cost Competitiveness', target: 'Within 5% of market', weight: '15%' }
      ],
      actions: [
        'Score 90+: Consider tier upgrade, longer terms',
        'Score 70-89: Maintain current terms, monitor',
        'Score 50-69: Performance improvement plan required',
        'Score <50: Reduce spend, find alternatives'
      ]
    },
    {
      practice: 'Vendor Segmentation Strategy',
      description: 'Categorize vendors by strategic importance and manage accordingly.',
      segments: [
        { segment: 'Strategic (Top 5%)', approach: 'Executive relationships, joint planning, innovation partnerships, best terms' },
        { segment: 'Preferred (Next 15%)', approach: 'Regular business reviews, preferred terms, development programs' },
        { segment: 'Approved (Next 30%)', approach: 'Standard terms, periodic reviews, competitive bidding' },
        { segment: 'Transactional (Bottom 50%)', approach: 'Spot purchases, standard terms, minimal management overhead' }
      ]
    },
    {
      practice: 'Risk Mitigation Planning',
      description: 'Proactive identification and mitigation of vendor-related risks.',
      riskCategories: [
        { category: 'Financial Risk', mitigation: 'Credit monitoring, payment terms adjustment, insurance requirements' },
        { category: 'Operational Risk', mitigation: 'Dual sourcing, safety stock, performance bonds' },
        { category: 'Compliance Risk', mitigation: 'Certification tracking, audit rights, indemnification clauses' },
        { category: 'Concentration Risk', mitigation: 'Spend limits per vendor, alternative qualification' },
        { category: 'Geopolitical Risk', mitigation: 'Geographic diversification, local alternatives' }
      ],
      signals: [
        'Sudden requests for faster payment',
        'Key personnel departures',
        'Negative news coverage',
        'Quality decline or delivery issues',
        'Unresponsiveness to communications'
      ],
      actions: [
        'Immediate risk score review',
        'Escalate to procurement leadership',
        'Activate backup vendor if available',
        'Adjust payment terms (shorter or prepay)',
        'Increase monitoring frequency'
      ]
    }
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
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl flex items-center justify-center shadow-xl">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-slate-900">Vendors Module</h1>
              <p className="text-2xl text-slate-600">Supplier Management & Risk Control</p>
            </div>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <p className="text-lg text-emerald-900 mb-2">
              <strong>Purpose:</strong> Ensure vendor compliance, optimize spend, prevent fraud, and build supply chain resilience.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">99% Compliance Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">$340K Fraud Prevented</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">15% Cost Reduction</span>
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
              { key: 'practices', label: 'Best Practices', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4 ${
                    activeTab === tab.key
                      ? 'border-emerald-600 text-emerald-600'
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
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Vendor Management Matters?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Proper Management
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Vendor fraud through fake invoices or bank changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Supply chain disruption from single-vendor dependency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Compliance violations from expired certifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Overpaying due to lack of performance visibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Quality issues discovered too late</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Vendors Module
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Bank changes require multi-level verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Concentration alerts before dangerous dependency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Auto-block POs for non-compliant vendors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Performance scorecards drive better terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Quality tracked in real-time with alerts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Vendor Lifecycle</h2>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Qualification', desc: 'Assess financial stability, compliance, and capability before first order' },
                  { step: '2', title: 'Onboarding', desc: 'Set up vendor master, verify bank details, establish initial terms and limits' },
                  { step: '3', title: 'Trial Period', desc: 'Conservative spend limits, close monitoring, frequent reviews' },
                  { step: '4', title: 'Performance Tracking', desc: 'Continuous monitoring of delivery, quality, and compliance metrics' },
                  { step: '5', title: 'Tier Progression', desc: 'Good performers earn better terms, higher limits, strategic status' },
                  { step: '6', title: 'Strategic Partnership', desc: 'Joint planning, innovation collaboration, executive relationships' }
                ].map((item, index) => (
                  <div key={`item-${index}`} className="flex items-start gap-4 bg-white p-6 rounded-2xl border-2 border-slate-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-700">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-12">
            {vendorManagementFeatures.map((feature, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-white p-8 border-b-2 border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{feature.feature}</h2>
                  <p className="text-lg text-slate-700">{feature.description}</p>
                </div>
                <div className="p-8 space-y-6">
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

                  {feature.factors && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Risk Factors:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {feature.factors.map((factor, i) => (
                          <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900">{factor.factor}</span>
                              <span className="text-emerald-600 font-bold">{factor.weight}</span>
                            </div>
                            <p className="text-sm text-slate-600">{factor.calculation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.termTiers && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Payment Term Tiers:</h3>
                      <div className="space-y-3">
                        {feature.termTiers.map((tier, i) => (
                          <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900">{tier.tier}</span>
                              <span className="text-emerald-600 font-bold">{tier.terms}</span>
                            </div>
                            <p className="text-sm text-slate-600">Discount: {tier.discount} | {tier.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.example && (
                    <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200">
                      <h3 className="text-xl font-bold text-emerald-900 mb-4">Real Example:</h3>
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
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Vendor Development Journey:</h3>
                      <div className="space-y-4">
                        {scenario.journey.map((stage, i) => (
                          <div key={`item-${i}`} className="flex items-start gap-4 bg-gradient-to-r from-emerald-50 to-white p-6 rounded-2xl border border-emerald-200">
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-bold text-slate-900">{stage.phase}</h4>
                                <span className="text-2xl font-bold text-emerald-600">{stage.spend}</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-1"><strong>Terms:</strong> {stage.terms}</p>
                              <p className="text-sm font-semibold text-slate-900">{stage.performance}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-slate-600">Total Value Generated:</p>
                          <p className="text-3xl font-bold text-green-600">{scenario.totalValue}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-slate-600">Cost Savings Achieved:</p>
                          <p className="text-3xl font-bold text-green-600">{scenario.costSavings}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <p className="text-emerald-900 font-semibold flex items-center gap-2">
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
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Vendor Management Best Practices</h2>
              <p className="text-xl opacity-90">Based on ISM, Gartner, and leading procurement organizations</p>
            </div>

            {bestPractices.map((practice, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{practice.practice}</h3>
                <p className="text-lg text-slate-700 mb-6">{practice.description}</p>
                
                {practice.frequency && (
                  <div className="bg-emerald-50 p-4 rounded-xl mb-6">
                    <p className="font-semibold text-emerald-900">
                      <Clock className="h-5 w-5 inline mr-2" />
                      Frequency: {practice.frequency}
                    </p>
                  </div>
                )}

                {practice.checklist && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Qualification Checklist:</h4>
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

                {practice.metrics && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3">Performance Metrics:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {practice.metrics.map((metric, i) => (
                        <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{metric.metric}</span>
                            <span className="text-emerald-600 font-bold">{metric.weight}</span>
                          </div>
                          <p className="text-sm text-slate-600">Target: {metric.target}</p>
                        </div>
                      ))}
                    </div>
                    {practice.actions && (
                      <div className="mt-4 bg-slate-50 p-4 rounded-xl">
                        <h5 className="font-bold text-slate-900 mb-2">Score-Based Actions:</h5>
                        <ul className="space-y-1 text-sm">
                          {practice.actions.map((action, i) => (
                            <li key={`item-${i}`} className="text-slate-700">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {practice.segments && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 mb-3">Vendor Segments:</h4>
                    {practice.segments.map((seg, i) => (
                      <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                        <span className="font-bold text-slate-900">{seg.segment}</span>
                        <p className="text-sm text-slate-700 mt-1">{seg.approach}</p>
                      </div>
                    ))}
                  </div>
                )}

                {practice.riskCategories && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 mb-3">Risk Categories & Mitigation:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {practice.riskCategories.map((risk, i) => (
                        <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                          <span className="font-bold text-slate-900">{risk.category}</span>
                          <p className="text-sm text-slate-700 mt-1">{risk.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {practice.signals && (
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3">Warning Signals:</h4>
                      <ul className="space-y-2">
                        {practice.signals.map((signal, i) => (
                          <li key={`item-${i}`} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3">Recommended Actions:</h4>
                      <ul className="space-y-2">
                        {practice.actions.map((action, i) => (
                          <li key={`item-${i}`} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Vendor Management?</h2>
          <p className="text-xl mb-6 opacity-90">
            See how IB Commerce prevents fraud, ensures compliance, and builds supply chain resilience
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:shadow-xl transition-all"
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

export default VendorsPage;
