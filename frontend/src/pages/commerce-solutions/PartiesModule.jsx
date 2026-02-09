import React from 'react';
import { Link } from 'react-router-dom';
import IBCommerceHub from '../IBCommerceHub';
import { 
  Users, Building2, Briefcase, Network, FileText,
  CheckCircle, AlertTriangle, TrendingUp, Shield, DollarSign,
  ArrowRight, Star, Target, Activity, BarChart3
} from 'lucide-react';

const PartiesModule = () => {
  const whyPartiesFirst = [
    {
      reason: 'Foundation of All Commerce',
      description: 'Every transaction requires a verified counterparty. Without knowing WHO you can transact with, nothing else matters.',
      icon: Users
    },
    {
      reason: 'Risk Prevention at Source',
      description: 'Bad customer? Risky vendor? Block at the party level before any deal, quote, or PO is created.',
      icon: Shield
    },
    {
      reason: 'Credit & Exposure Control',
      description: 'Set credit limits, monitor exposure, prevent overcommitment - all at the counterparty level.',
      icon: DollarSign
    },
    {
      reason: 'Progressive Intelligence',
      description: 'Party profiles evolve with history. Good behavior = increased limits. Poor behavior = tighter controls.',
      icon: Activity
    }
  ];

  const realWorldScenarios = [
    {
      title: 'Scenario 1: Customer Overexposure',
      problem: 'Sales team creates $150K deal with customer already at $450K exposure (limit: $500K)',
      without: {
        what: 'Deal proceeds, contract signed',
        then: 'Customer delays payment on existing $450K',
        result: 'Total exposure now $600K. $100K over limit. Customer leverage increases. Collection becomes difficult.',
        cost: '$100K+ stuck, reputation damage'
      },
      with: {
        what: 'System flags customer at 90% of limit',
        then: 'Deal creation allowed but blocked at Contract stage',
        result: 'CFO reviews, requests advance payment or parent guarantee. Deal restructured safely.',
        saved: 'Prevented $100K overexposure'
      }
    },
    {
      title: 'Scenario 2: Vendor Compliance Failure',
      problem: 'Procurement wants to engage vendor for $40K/month cloud services',
      without: {
        what: 'PO raised, contract signed, services start',
        then: '3 months in, audit reveals vendor lacks SOC2 compliance',
        result: 'Regulatory violation. Must terminate urgently. 3-month scramble for replacement. Project delays.',
        cost: 'Compliance fines, project delays, reputational risk'
      },
      with: {
        what: 'Vendor profile shows "Compliance: Pending SOC2"',
        then: 'Procurement intent allowed but Contract blocked',
        result: 'Vendor asked to provide SOC2 before contract. Alternative vendors identified. No commitment until compliant.',
        saved: 'Prevented compliance violation and project disruption'
      }
    },
    {
      title: 'Scenario 3: Partner Revenue Leakage',
      problem: 'Sales closes $200K deal in APAC region through partner channel',
      without: {
        what: 'Contract signed, delivery starts',
        then: 'Finance realizes partner gets 20% commission ($40K)',
        result: 'Commission not factored in pricing. Net revenue only $160K. Margin calculation was wrong. Deal unprofitable.',
        cost: '$40K margin leakage'
      },
      with: {
        what: 'Partner profile shows "APAC: 20% commission"',
        then: 'System auto-calculates net revenue at Quote stage',
        result: 'Pricing adjusted to maintain margin. Partner commission factored upfront. No surprises.',
        saved: 'Protected $40K margin'
      }
    }
  ];

  const subModules = [
    {
      name: 'Customers',
      icon: Users,
      path: '/solutions/commerce/parties/customers',
      tagline: 'Who Buys From You',
      keyFeatures: [
        'Credit limit management & monitoring',
        'Risk scoring (0-100 scale)',
        'Payment terms & history tracking',
        'Outstanding & overdue tracking',
        'Multi-currency support',
        'Progressive credit expansion'
      ],
      prevents: [
        'Customer overexposure',
        'Bad debt accumulation',
        'Payment default surprises'
      ],
      metrics: {
        reduction: '85% reduction in bad debt',
        control: '100% credit limit adherence',
        visibility: 'Real-time exposure tracking'
      }
    },
    {
      name: 'Vendors',
      icon: Building2,
      path: '/solutions/commerce/parties/vendors',
      tagline: 'Who You Pay',
      keyFeatures: [
        'Compliance status tracking (SOC2, ISO, etc.)',
        'Vendor risk assessment',
        'Spend limit enforcement',
        'Performance metrics',
        'Bank details & tax validation',
        'Contract validity tracking'
      ],
      prevents: [
        'Payments to risky vendors',
        'Shadow procurement',
        'Compliance violations'
      ],
      metrics: {
        reduction: '40% cost reduction via vendor optimization',
        control: '100% vendor verification',
        visibility: 'Complete spend visibility'
      }
    },
    {
      name: 'Partners',
      icon: Briefcase,
      path: '/solutions/commerce/parties/partners',
      tagline: 'Who You Share Revenue With',
      keyFeatures: [
        'Revenue share % management',
        'Territory allocation',
        'Performance tracking',
        'Commission automation',
        'Contract term management',
        'Partner tier progression'
      ],
      prevents: [
        'Forgotten revenue sharing',
        'Margin leakage',
        'Partner conflicts over territory'
      ],
      metrics: {
        reduction: 'Zero margin leakage',
        control: 'Automated commission calculation',
        visibility: 'Partner performance dashboard'
      }
    },
    {
      name: 'Channels',
      icon: Network,
      path: '/solutions/commerce/parties/channels',
      tagline: 'Sales Intermediaries',
      keyFeatures: [
        'Commission structure management',
        'Pricing band control',
        'Geography mapping',
        'Incentive programs',
        'Channel conflict resolution',
        'Performance metrics'
      ],
      prevents: [
        'Inflated revenue assumptions',
        'Channel conflicts',
        'Margin miscalculation'
      ],
      metrics: {
        reduction: '25% increase in channel efficiency',
        control: 'Automated pricing enforcement',
        visibility: 'Channel performance analytics'
      }
    },
    {
      name: 'Profiles',
      icon: FileText,
      path: '/solutions/commerce/parties/profiles',
      tagline: 'Progressive Commercial Identity',
      tag: 'MOST CRITICAL',
      keyFeatures: [
        'Document verification (legal, tax, compliance)',
        'Historical performance tracking',
        'Progressive risk scoring',
        'Dynamic limit adjustment',
        'Behavior-based progression',
        'Audit trail of all changes'
      ],
      prevents: [
        'Static master data',
        'One-size-fits-all treatment',
        'Lost opportunities due to outdated limits'
      ],
      metrics: {
        reduction: '10x credit growth for good customers',
        control: 'Risk-based limit progression',
        visibility: 'Complete party evolution history'
      }
    }
  ];

  const partyLifecycle = [
    { stage: 'Onboarding', desc: 'Initial verification & risk assessment', icon: Users },
    { stage: 'Initial Limits', desc: 'Conservative credit/spend limits set', icon: Shield },
    { stage: 'First Transactions', desc: 'Performance tracking begins', icon: Activity },
    { stage: 'Behavior Analysis', desc: 'Payment/delivery patterns evaluated', icon: BarChart3 },
    { stage: 'Profile Upgrade', desc: 'Good behavior = increased limits', icon: TrendingUp },
    { stage: 'Trusted Partner', desc: 'Streamlined approvals, higher limits', icon: Star }
  ];

  return (
    <IBCommerceHub>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-slate-900">Parties Module</h1>
              <p className="text-xl text-slate-600">Who You Are Allowed to Do Business With</p>
            </div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 inline-block">
            <p className="text-red-700 font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              WHY PARTIES IS FIRST: Every commercial failure starts with the wrong counterparty
            </p>
          </div>
        </div>

        {/* Why Parties First */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Parties Comes First</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {whyPartiesFirst.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`item-${index}`} className="bg-white p-6 rounded-2xl border-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">{item.reason}</h3>
                  </div>
                  <p className="text-slate-700">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Real World Scenarios */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Real-World Commercial Failures Prevented</h2>
          <div className="space-y-8">
            {realWorldScenarios.map((scenario, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b-2 border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{scenario.title}</h3>
                  <p className="text-lg text-slate-700 font-semibold">{scenario.problem}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Without Parties */}
                  <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                    <p className="text-sm font-bold text-red-700 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      WITHOUT PARTIES MODULE
                    </p>
                    <div className="space-y-3 text-sm text-slate-700">
                      <div>
                        <p className="font-semibold text-red-700">What Happens:</p>
                        <p>{scenario.without.what}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-700">Then:</p>
                        <p>{scenario.without.then}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-700">Result:</p>
                        <p>{scenario.without.result}</p>
                      </div>
                      <div className="pt-3 border-t border-red-200">
                        <p className="font-bold text-red-800">❌ Cost: {scenario.without.cost}</p>
                      </div>
                    </div>
                  </div>

                  {/* With Parties */}
                  <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                    <p className="text-sm font-bold text-green-700 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      WITH PARTIES MODULE
                    </p>
                    <div className="space-y-3 text-sm text-slate-700">
                      <div>
                        <p className="font-semibold text-green-700">What Happens:</p>
                        <p>{scenario.with.what}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-700">Then:</p>
                        <p>{scenario.with.then}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-700">Result:</p>
                        <p>{scenario.with.result}</p>
                      </div>
                      <div className="pt-3 border-t border-green-200">
                        <p className="font-bold text-green-800">✅ Saved: {scenario.with.saved}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Party Lifecycle */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Progressive Party Lifecycle</h2>
          <p className="text-lg text-slate-700 mb-6">
            Unlike static master data, Parties evolve based on performance. Good behavior = increased privileges. Poor behavior = tighter controls.
          </p>
          <div className="relative">
            {partyLifecycle.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={`item-${index}`} className="flex items-start gap-6 mb-6 last:mb-0">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    {index < partyLifecycle.length - 1 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-blue-300 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 bg-white p-6 rounded-2xl border-2 border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-900">{stage.stage}</h3>
                    </div>
                    <p className="text-slate-700">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sub-Modules */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">The 5 Party Types</h2>
          <div className="space-y-6">
            {subModules.map((subModule, index) => {
              const Icon = subModule.icon;
              return (
                <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-bold text-slate-900">{subModule.name}</h3>
                            {subModule.tag && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                {subModule.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 font-semibold">{subModule.tagline}</p>
                        </div>
                      </div>
                      <Link
                        to={subModule.path}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                      >
                        Learn More <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-3">KEY FEATURES</p>
                        <ul className="space-y-2">
                          {subModule.keyFeatures.map((feature, i) => (
                            <li key={`item-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-3">PREVENTS</p>
                        <ul className="space-y-2">
                          {subModule.prevents.map((prevent, i) => (
                            <li key={`item-${i}`} className="flex items-start gap-2 text-sm text-red-700">
                              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{prevent}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-3">BUSINESS IMPACT</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-slate-700">{subModule.metrics.reduction}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-slate-700">{subModule.metrics.control}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="text-slate-700">{subModule.metrics.visibility}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Prevent Commercial Failures?</h2>
          <p className="text-xl mb-6 opacity-90">
            Start with Parties - the foundation of commercial intelligence
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/solutions/commerce/parties/customers"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-xl transition-all"
            >
              Explore Customers Module
            </Link>
            <Link
              to="/auth/signup"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
    </IBCommerceHub>
  );
};

export default PartiesModule;