import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IBCommerceHub from '../../IBCommerceHub';
import { 
  Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  Shield, Activity, Clock, Target, BarChart3, Calendar,
  CreditCard, Bell, FileText, TrendingDown, Award, Lock, ArrowLeft, Star
} from 'lucide-react';

const CustomersPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const creditManagementFeatures = [
    {
      feature: 'Dynamic Credit Limits',
      description: 'AI-powered credit limits that adapt based on payment behavior, transaction history, and financial health.',
      howItWorks: [
        'Initial limit set based on credit assessment',
        'System monitors payment patterns continuously',
        'Auto-increase for customers with 100% on-time payment',
        'Auto-decrease if payment delays exceed threshold',
        'Alerts sent before limit adjustments'
      ],
      example: {
        customer: 'Acme Corp',
        year1: '$25,000 (new customer, conservative)',
        behavior: '12 months, 100% on-time payments',
        year2: '$100,000 (4x increase, auto-approved)',
        year3: '$250,000 (10x original limit)'
      },
      prevention: 'Prevents both underutilization (lost revenue) and overexposure (bad debt risk)'
    },
    {
      feature: 'Real-Time Exposure Monitoring',
      description: 'Track current exposure across all pending deals, invoices, and receivables in real-time.',
      howItWorks: [
        'Aggregates all open deals (not yet invoiced)',
        'Adds all unpaid invoices',
        'Calculates total exposure vs. credit limit',
        'Flags customers approaching limit (90%)',
        'Blocks new deals if limit would be exceeded'
      ],
      example: {
        scenario: 'Sales creates $50K deal with customer',
        creditLimit: '$200,000',
        unpaidInvoices: '$130,000',
        pendingDeals: '$40,000',
        totalExposure: '$170,000',
        availableCredit: '$30,000',
        action: 'New $50K deal blocked at Quote stage'
      },
      prevention: 'Prevents customer overexposure before contract signature'
    },
    {
      feature: 'Risk Scoring (0-100)',
      description: 'Multi-factor risk assessment that updates automatically based on behavior.',
      factors: [
        { factor: 'Payment History', weight: '35%', calculation: 'On-time %, average delay days' },
        { factor: 'Financial Health', weight: '25%', calculation: 'Credit bureau score, financial statements' },
        { factor: 'Business Stability', weight: '20%', calculation: 'Years in business, market position' },
        { factor: 'Geographic Risk', weight: '10%', calculation: 'Country stability, currency risk' },
        { factor: 'Industry Risk', weight: '10%', calculation: 'Sector health, cyclicality' }
      ],
      example: {
        customer: 'TechStart Inc',
        initialScore: '55 (Medium)',
        month6: '65 (improving)',
        month12: '78 (Low Risk)',
        impact: 'Approval requirements relaxed, better terms'
      },
      prevention: 'Prevents deals with high-risk customers without proper oversight'
    }
  ];

  const realWorldScenarios = [
    {
      title: 'The Bad Debt Prevention Story',
      company: 'Manufacturing Company',
      situation: 'Major customer showing financial stress signs: delayed payments, news of layoffs, reduced orders.',
      withoutSystem: {
        what: 'Sales team unaware of customer financial issues',
        result: 'Continued shipping products on credit',
        loss: '$450,000 write-off when customer filed bankruptcy'
      },
      withSystem: {
        what: 'Risk score dropped from 72 to 45 automatically',
        action: 'System blocked new orders, alerted sales and finance',
        result: 'Required advance payment for new orders',
        saved: '$450,000 in potential bad debt'
      },
      lesson: 'Early warning systems combined with automated actions prevent catastrophic losses.'
    },
    {
      title: 'The Credit Growth Story',
      company: 'Software Services Provider',
      situation: 'New customer started with conservative $25K credit limit, proved to be exceptional.',
      journey: [
        { year: 'Year 1', limit: '$25,000', reasoning: 'New customer - conservative start', result: '100% on-time payments' },
        { year: 'Year 2', limit: '$100,000', reasoning: 'Perfect history, auto-increased', result: 'Major project won' },
        { year: 'Year 3', limit: '$250,000', reasoning: 'Trusted partner status', result: 'Enterprise deal closed' },
        { year: 'Year 4', limit: '$500,000', reasoning: 'Strategic account', result: 'Multi-year contract signed' }
      ],
      totalRevenue: '$2.3M over 4 years',
      badDebt: '$0',
      lesson: 'Progressive credit expansion rewards good customers and drives revenue growth.'
    }
  ];

  const bestPractices = [
    {
      practice: 'Regular Credit Reviews',
      description: 'Scheduled assessment of customer creditworthiness based on recent behavior and market conditions.',
      frequency: 'Quarterly for major accounts, annually for others',
      checklist: [
        'Review payment history for last quarter',
        'Check for any negative news or industry changes',
        'Assess current exposure vs. credit limit',
        'Evaluate customer growth and stability',
        'Document any limit adjustments with reasons'
      ]
    },
    {
      practice: 'Tiered Approval Authority',
      description: 'Different approval levels based on deal size, customer risk, and terms requested.',
      segments: [
        { segment: 'Standard deals (within limit, good history)', approach: 'Auto-approved by system' },
        { segment: 'Above-limit deals (up to 20% over)', approach: 'Manager approval required' },
        { segment: 'High-risk or large deals (50%+ over limit)', approach: 'Director/CFO approval' },
        { segment: 'New customers or distressed accounts', approach: 'Credit committee review' }
      ]
    },
    {
      practice: 'Proactive Monitoring',
      description: 'Continuous monitoring of customer health indicators to catch issues early.',
      signals: [
        'Payment patterns changing (previously on-time, now delayed)',
        'Order patterns shifting (smaller, more frequent)',
        'Credit inquiries increasing (seeking credit elsewhere)',
        'Negative news (layoffs, leadership changes, market issues)',
        'Industry downturn affecting customer sector'
      ],
      actions: [
        'Immediate review of credit limit',
        'Discussion with account manager',
        'Request updated financial information',
        'Consider reducing limit or tighter terms',
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
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-xl">
              <Users className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-slate-900">Customers Module</h1>
              <p className="text-2xl text-slate-600">Credit Management & Risk Intelligence</p>
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <p className="text-lg text-blue-900 mb-2">
              <strong>Purpose:</strong> Prevent bad debt, manage credit exposure, and enable progressive credit expansion for trustworthy customers.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">85% Bad Debt Reduction</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">100% Credit Limit Adherence</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">10x Credit Growth Possible</span>
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
                      ? 'border-blue-600 text-blue-600'
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
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Customer Credit Management?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Proper Management
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Bad debts discovered after contracts signed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Customer overexposure not visible until too late</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Good customers stuck at low credit limits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Manual credit checks slow down deals</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Customers Module
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Deals blocked before contract if customer at limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Real-time exposure visible across all pending deals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Auto-increase limits for good payers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Instant credit checks at quote stage</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">How It Works: The Credit Journey</h2>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'New Customer Onboarding', desc: 'Initial credit assessment, conservative limit set' },
                  { step: '2', title: 'First Transaction', desc: 'System monitors payment behavior, tracks against terms' },
                  { step: '3', title: 'Continuous Monitoring', desc: 'Risk score updates automatically' },
                  { step: '4', title: 'Performance Review', desc: 'Good behavior triggers limit increase review' },
                  { step: '5', title: 'Progressive Expansion', desc: 'Limits increase based on performance' },
                  { step: '6', title: 'Trusted Partner Status', desc: 'Premium terms, higher limits, streamlined approvals' }
                ].map((item, index) => (
                  <div key={`item-${index}`} className="flex items-start gap-4 bg-white p-6 rounded-2xl border-2 border-slate-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
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
            {creditManagementFeatures.map((feature, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-white p-8 border-b-2 border-slate-200">
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
                              <span className="text-blue-600 font-bold">{factor.weight}</span>
                            </div>
                            <p className="text-sm text-slate-600">{factor.calculation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feature.example && (
                    <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
                      <h3 className="text-xl font-bold text-blue-900 mb-4">Real Example:</h3>
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
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Customer Journey:</h3>
                      <div className="space-y-4">
                        {scenario.journey.map((stage, i) => (
                          <div key={`item-${i}`} className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl border border-blue-200">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-bold text-slate-900">{stage.year}</h4>
                                <span className="text-2xl font-bold text-blue-600">{stage.limit}</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{stage.reasoning}</p>
                              <p className="text-sm font-semibold text-slate-900">{stage.result}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-slate-600">Total Revenue Generated:</p>
                          <p className="text-3xl font-bold text-green-600">{scenario.totalRevenue}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-slate-600">Bad Debt Incurred:</p>
                          <p className="text-3xl font-bold text-green-600">{scenario.badDebt}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-blue-900 font-semibold flex items-center gap-2">
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Industry Best Practices</h2>
              <p className="text-xl opacity-90">Based on research from NACM, Gartner, and leading B2B companies</p>
            </div>

            {bestPractices.map((practice, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{practice.practice}</h3>
                <p className="text-lg text-slate-700 mb-6">{practice.description}</p>
                
                {practice.frequency && (
                  <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <p className="font-semibold text-blue-900">
                      <Clock className="h-5 w-5 inline mr-2" />
                      Frequency: {practice.frequency}
                    </p>
                  </div>
                )}

                {practice.checklist && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Checklist:</h4>
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

                {practice.segments && (
                  <div className="space-y-3">
                    {practice.segments.map((seg, i) => (
                      <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                        <span className="font-bold text-slate-900">{seg.segment}</span>
                        <p className="text-sm text-slate-700 mt-1">{seg.approach}</p>
                      </div>
                    ))}
                  </div>
                )}

                {practice.signals && (
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3">Early Warning Signals:</h4>
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
                            <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
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
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Eliminate Bad Debt?</h2>
          <p className="text-xl mb-6 opacity-90">
            See how IB Commerce prevents $450K+ in potential losses through intelligent credit management
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-xl transition-all"
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

export default CustomersPage;
