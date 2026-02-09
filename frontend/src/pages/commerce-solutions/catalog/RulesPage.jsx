import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Lock, Settings, FileText, Target, Award, Zap, Users, Globe, DollarSign } from 'lucide-react';
import IBCommerceHub from '../../IBCommerceHub';

const RulesPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const ruleCategories = [
    {
      name: 'Pricing Rules',
      icon: DollarSign,
      description: 'Control discounting and pricing boundaries',
      rules: [
        { rule: 'Maximum Discount', example: 'No discount > 25% without VP approval', enforcement: 'Quote blocked if exceeded' },
        { rule: 'Minimum Price', example: 'Floor price = Cost + 20% minimum margin', enforcement: 'Cannot quote below floor' },
        { rule: 'Bundle Pricing', example: 'When items bundled, apply 10% bundle discount', enforcement: 'Auto-calculated' },
        { rule: 'Promotional Limits', example: 'Promo codes limited to 15% off, $500 max', enforcement: 'Code rejected if exceeded' }
      ]
    },
    {
      name: 'Geographic Rules',
      icon: Globe,
      description: 'Control where products/services can be sold',
      rules: [
        { rule: 'Embargoed Countries', example: 'Cannot sell to sanctioned nations', enforcement: 'Deal blocked at creation' },
        { rule: 'Regional Licensing', example: 'Product X only available in US/EU', enforcement: 'Item hidden for other regions' },
        { rule: 'Local Entity Required', example: 'Enterprise deals need local subsidiary', enforcement: 'Partner assignment required' },
        { rule: 'Data Residency', example: 'Customer data must stay in-region', enforcement: 'Hosting region locked' }
      ]
    },
    {
      name: 'Compliance Rules',
      icon: Shield,
      description: 'Ensure regulatory and legal compliance',
      rules: [
        { rule: 'Contract Terms', example: 'Indemnification clause required for deals > $100K', enforcement: 'Legal review triggered' },
        { rule: 'Industry Certifications', example: 'Healthcare deals require HIPAA compliance', enforcement: 'Compliance checklist enforced' },
        { rule: 'Export Controls', example: 'Encryption products need export license', enforcement: 'Export approval workflow' },
        { rule: 'Privacy Requirements', example: 'GDPR DPA required for EU customers', enforcement: 'Document attachment required' }
      ]
    },
    {
      name: 'Approval Rules',
      icon: Users,
      description: 'Define who can approve what',
      rules: [
        { rule: 'Deal Size Thresholds', example: '>$500K needs CFO approval', enforcement: 'Approval workflow auto-triggered' },
        { rule: 'Payment Terms', example: 'Net 60+ needs Finance Director', enforcement: 'Cannot proceed without approval' },
        { rule: 'Custom Pricing', example: 'Any off-list pricing needs Sales VP', enforcement: 'Quote held pending approval' },
        { rule: 'Non-Standard Terms', example: 'SLA modifications need Legal review', enforcement: 'Legal task created' }
      ]
    }
  ];

  const realScenarios = [
    {
      title: 'The $2M Embargoed Deal',
      company: 'Enterprise Software Company',
      situation: 'Sales rep in EMEA identified a $2M opportunity with a company headquartered in a sanctioned country. Rep was unaware of export restrictions.',
      withoutRules: {
        what: 'Rep progresses deal through pipeline, creates quote, gets customer excited',
        discovery: 'Legal discovers issue at contract review stage',
        result: 'Deal cancelled after 4 months of work. Customer relationship damaged. Potential regulatory scrutiny.',
        cost: '4 months of sales effort wasted, reputation risk'
      },
      withRules: {
        what: 'System checks company HQ location at lead creation',
        action: 'Deal blocked immediately with clear explanation',
        result: 'Rep redirected to compliant opportunities. No wasted effort.',
        saved: '4 months of sales capacity, regulatory risk eliminated'
      }
    },
    {
      title: 'The 60% Discount Request',
      company: 'SaaS Platform',
      situation: 'Sales rep promised 60% discount to close a "strategic" deal. Normal max discount is 25%.',
      withoutRules: {
        what: 'Rep emails manager, manager forwards to VP, VP too busy to review details',
        approval: 'VP approves based on "it\'s strategic" justification',
        result: 'Deal closes at 10% margin instead of 45%. Similar discounts requested by other customers. Price integrity eroded.',
        cost: '$350K in margin erosion over next 6 months'
      },
      withRules: {
        what: 'System requires documented justification for >25% discount',
        workflow: 'Escalates to VP with full deal economics visible',
        review: 'VP sees this would set bad precedent, negotiates to 35% discount',
        result: 'Deal closes at 28% margin. Pricing integrity maintained.',
        saved: '$350K in margin protection'
      }
    },
    {
      title: 'The HIPAA Compliance Miss',
      company: 'Analytics Platform',
      situation: 'Account exec sells to hospital system without realizing healthcare compliance requirements.',
      withoutRules: {
        what: 'Standard contract signed, deployment begins',
        discovery: 'Customer legal team asks for BAA (Business Associate Agreement) post-signature',
        result: 'Deployment halted for 3 months while compliance achieved. Customer trust damaged.',
        cost: '3 months delay, emergency compliance work, relationship damage'
      },
      withRules: {
        what: 'System detects healthcare industry at opportunity creation',
        action: 'Compliance checklist auto-attached: BAA required, HIPAA controls needed',
        result: 'Sales involves compliance team early. Proper contracts from start.',
        saved: '3 months, customer trust maintained'
      }
    }
  ];

  const ruleTypes = [
    {
      type: 'Hard Rules (Blockers)',
      description: 'Cannot proceed without satisfaction',
      examples: ['Embargoed country = deal blocked', 'Below minimum margin = quote blocked', 'Missing compliance docs = contract blocked'],
      color: 'red'
    },
    {
      type: 'Soft Rules (Warnings)',
      description: 'Proceed with acknowledgment',
      examples: ['Approaching discount limit', 'Credit limit at 80%', 'Unusual payment terms'],
      color: 'yellow'
    },
    {
      type: 'Approval Rules (Gates)',
      description: 'Require specific approval to proceed',
      examples: ['Large deal needs CFO', 'Custom terms need Legal', 'Extended payment needs Finance'],
      color: 'blue'
    },
    {
      type: 'Automation Rules (Triggers)',
      description: 'Automatically execute actions',
      examples: ['Healthcare deal → add BAA checklist', 'International deal → add export review', 'Enterprise → assign solutions architect'],
      color: 'green'
    }
  ];

  return (
    <IBCommerceHub>
      <div className="max-w-6xl">
        {/* Header */}
        <Link to="/solutions/commerce/catalog" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 font-semibold">
          <ArrowLeft className="h-5 w-5" /> Back to Catalog Module
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-slate-900">Rules Module</h1>
            <p className="text-2xl text-slate-600">Commercial Guardrails & Policy Automation</p>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-12">
          <p className="text-lg text-red-900 mb-2">
            <strong>Purpose:</strong> Encode your commercial policies into the system. Rules prevent bad deals before they happen.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Policy Automation</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Compliance Enforcement</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Instant Decision Support</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'categories', label: 'Rule Categories', icon: Settings },
              { key: 'scenarios', label: 'Real Scenarios', icon: Target },
              { key: 'implementation', label: 'Implementation', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4 ${
                    activeTab === tab.key
                      ? 'border-red-600 text-red-600'
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
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Rules Matter</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Commercial Rules
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Sales gives unauthorized discounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Compliance issues discovered after contract</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Deals with embargoed entities progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Policy enforcement depends on who reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Legal/Finance bottlenecks from manual reviews</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Rules
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Discount limits enforced automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Compliance requirements triggered at deal creation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Blocked deals never reach sales pipeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Consistent policy enforcement across all deals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Auto-approvals for standard deals, escalation for exceptions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Four Rule Types</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {ruleTypes.map((type, index) => (
                  <div key={`item-${index}`} className={`p-6 rounded-2xl border-2 ${
                    type.color === 'red' ? 'bg-red-50 border-red-200' :
                    type.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                    type.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <h3 className={`text-xl font-bold mb-2 ${
                      type.color === 'red' ? 'text-red-900' :
                      type.color === 'yellow' ? 'text-yellow-900' :
                      type.color === 'blue' ? 'text-blue-900' :
                      'text-green-900'
                    }`}>{type.type}</h3>
                    <p className="text-slate-700 mb-4">{type.description}</p>
                    <ul className="space-y-2">
                      {type.examples.map((ex, i) => (
                        <li key={`item-${i}`} className="text-sm text-slate-600 flex items-start gap-2">
                          <span>•</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Rules = Encoded Wisdom</h2>
              <p className="text-xl leading-relaxed">
                Every bad deal your company has ever done taught you something. Rules encode that learning so it never happens again. Your best practices become system constraints.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            {ruleCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-white p-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{category.name}</h3>
                        <p className="text-slate-600">{category.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {category.rules.map((rule, i) => (
                        <div key={`item-${i}`} className="bg-slate-50 p-4 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-slate-900">{rule.rule}</h4>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Example: </span>
                              <span className="text-slate-700">{rule.example}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Enforcement: </span>
                              <span className="text-red-600 font-semibold">{rule.enforcement}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-8">
            {realScenarios.map((scenario, index) => (
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                      <h3 className="text-xl font-bold text-red-900 mb-4">❌ Without Rules</h3>
                      <div className="space-y-3 text-sm text-slate-700">
                        <div>
                          <p className="font-semibold text-red-700">What Happens:</p>
                          <p>{scenario.withoutRules.what}</p>
                        </div>
                        {scenario.withoutRules.discovery && (
                          <div>
                            <p className="font-semibold text-red-700">Discovery:</p>
                            <p>{scenario.withoutRules.discovery}</p>
                          </div>
                        )}
                        {scenario.withoutRules.approval && (
                          <div>
                            <p className="font-semibold text-red-700">Approval:</p>
                            <p>{scenario.withoutRules.approval}</p>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-red-700">Result:</p>
                          <p>{scenario.withoutRules.result}</p>
                        </div>
                        <div className="pt-3 border-t border-red-200">
                          <p className="font-bold text-red-800">💸 Cost: {scenario.withoutRules.cost}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                      <h3 className="text-xl font-bold text-green-900 mb-4">✅ With Rules</h3>
                      <div className="space-y-3 text-sm text-slate-700">
                        <div>
                          <p className="font-semibold text-green-700">What Happens:</p>
                          <p>{scenario.withRules.what}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-green-700">Action:</p>
                          <p>{scenario.withRules.action}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-green-700">Result:</p>
                          <p>{scenario.withRules.result}</p>
                        </div>
                        <div className="pt-3 border-t border-green-200">
                          <p className="font-bold text-green-800">💰 Saved: {scenario.withRules.saved}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'implementation' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 rounded-3xl text-white">
              <h2 className="text-3xl font-bold mb-4">Implementing Rules</h2>
              <p className="text-xl opacity-90">A phased approach to encoding your commercial policies</p>
            </div>

            {[
              {
                phase: 'Phase 1: Audit Current Policies',
                duration: 'Week 1-2',
                activities: [
                  'Document all existing commercial policies',
                  'Identify policies that are enforced inconsistently',
                  'List recent deal issues that could have been prevented',
                  'Prioritize rules by risk and frequency'
                ]
              },
              {
                phase: 'Phase 2: Define Rule Logic',
                duration: 'Week 3-4',
                activities: [
                  'Convert policies into IF-THEN logic',
                  'Define triggers (when does rule apply?)',
                  'Define actions (what happens when triggered?)',
                  'Determine rule type (hard block, warning, approval, automation)'
                ]
              },
              {
                phase: 'Phase 3: Configure & Test',
                duration: 'Week 5-6',
                activities: [
                  'Enter rules into system',
                  'Test with historical deals (would rule have caught issue?)',
                  'Adjust thresholds based on testing',
                  'Get stakeholder sign-off'
                ]
              },
              {
                phase: 'Phase 4: Go Live & Monitor',
                duration: 'Week 7+',
                activities: [
                  'Enable rules in production',
                  'Monitor rule triggers and outcomes',
                  'Gather feedback from sales team',
                  'Iterate and refine rules based on real usage'
                ]
              }
            ].map((phase, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{phase.phase}</h3>
                    <span className="text-slate-500">{phase.duration}</span>
                  </div>
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {index + 1}
                  </div>
                </div>
                <ul className="space-y-3">
                  {phase.activities.map((activity, i) => (
                    <li key={`item-${i}`} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Encode Your Commercial Wisdom</h2>
          <p className="text-xl mb-6 opacity-90">
            Turn lessons learned into automated guardrails. Never repeat past mistakes.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:shadow-xl transition-all"
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

export default RulesPage;
