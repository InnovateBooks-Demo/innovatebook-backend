import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckSquare, CheckCircle, AlertTriangle, FileText, Target, Award, Users, DollarSign, Clock, Shield, Handshake, TrendingUp, Send } from 'lucide-react';
import IBCommerceHub from '../../IBCommerceHub';

const CommitPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const commitComponents = [
    {
      name: 'Quote/Proposal',
      description: 'The formal offer sent to the customer',
      elements: ['Solution description', 'Scope & deliverables', 'Pricing & payment terms', 'Timeline', 'Terms & conditions'],
      controlPoints: ['Pricing within guidelines', 'Margin above minimum', 'Terms approved by legal']
    },
    {
      name: 'Internal Approvals',
      description: 'Sign-offs required before commitment',
      elements: ['Deal review completed', 'Pricing approved', 'Legal review (if required)', 'Delivery commitment', 'Executive sponsor (large deals)'],
      controlPoints: ['Approval matrix followed', 'All blockers resolved', 'Risk accepted or mitigated']
    },
    {
      name: 'Customer Agreement',
      description: 'Customer acceptance of the proposal',
      elements: ['Quote acceptance', 'Terms agreement', 'SOW sign-off', 'PO receipt', 'Contract signature'],
      controlPoints: ['Customer authority validated', 'No unauthorized changes', 'Binding commitment received']
    }
  ];

  const approvalMatrix = [
    { dealSize: '$0 - $50K', discount: '≤15%', terms: 'Standard', approvers: ['Sales Manager'] },
    { dealSize: '$50K - $250K', discount: '≤25%', terms: 'Standard', approvers: ['Sales Manager', 'Finance'] },
    { dealSize: '$250K - $1M', discount: '≤30%', terms: 'Extended OK', approvers: ['Sales Director', 'Finance', 'Legal'] },
    { dealSize: '$1M+', discount: 'Any', terms: 'Custom OK', approvers: ['VP Sales', 'CFO', 'Legal', 'CEO (>$5M)'] }
  ];

  const realScenarios = [
    {
      title: 'The Quote That Changed After Signature',
      company: 'Services Company',
      situation: 'Sales rep sent quote for $200K. Customer signed. Post-signature, rep realized cost estimate was wrong - actual cost $220K.',
      problem: {
        quotedPrice: '$200,000',
        actualCost: '$220,000',
        margin: '-10% (loss)',
        resolution: 'Had to honor quote. Absorbed $20K loss.'
      },
      rootCause: 'No costing verification before quote sent. Rep used old cost estimate.',
      withSystem: {
        controls: [
          'Quote generation requires fresh cost calculation',
          'Margin check blocks quotes below threshold',
          'Version control on all quotes',
          'Audit trail of quote changes'
        ],
        outcome: 'Cost discrepancy caught before quote sent. Price corrected to $250K. Won at $245K with 10% margin.'
      }
    },
    {
      title: 'The Unauthorized Discount Crisis',
      company: 'Software Company',
      situation: 'End of quarter. Rep promised 45% discount to close large deal. Normal max is 30%. Finance discovered after booking.',
      impact: {
        expected: '$500K booking at 40% margin',
        actual: '$275K booking at 8% margin',
        difference: '$225K in recognized revenue, margin collapse'
      },
      consequences: [
        'Revenue recognition issue with auditors',
        'Precedent set for future negotiations',
        'Other customers learned of discount',
        'Rep terminated'
      ],
      withSystem: {
        workflow: 'Quote for >30% discount triggers VP approval',
        visibility: 'All stakeholders see pending approvals',
        outcome: 'Discount request would have been visible. VP either approves with justification or requires negotiation. Either way, controlled.'
      }
    },
    {
      title: 'The SOW That Nobody Read',
      company: 'Consulting Firm',
      situation: 'Standard SOW template used for custom project. Customer signed. Scope was actually much larger than template assumed.',
      problem: {
        templateScope: '500 hours of consulting',
        actualNeed: '1,200 hours required',
        fixedPrice: '$150,000',
        actualCost: '$360,000',
        result: 'Complete project loss, customer disappointment'
      },
      withSystem: {
        process: [
          'SOW checklist requires scope validation',
          'Custom projects flagged for extra review',
          'Hours estimate linked to SOW',
          'Sign-off required from delivery team'
        ],
        outcome: 'Scope mismatch identified during review. SOW revised before sending. Project properly scoped.'
      }
    }
  ];

  const commitChecklist = [
    { category: 'Pre-Quote', items: ['Evaluation completed & approved', 'Cost estimate finalized', 'Delivery feasibility confirmed', 'Pricing approved'] },
    { category: 'Quote/Proposal', items: ['Solution scope clear', 'Assumptions documented', 'Terms reviewed', 'Expiry date set'] },
    { category: 'Approval', items: ['Required approvers signed off', 'Exceptions documented', 'Risk acceptance documented', 'Delivery commitment received'] },
    { category: 'Customer', items: ['Decision maker confirmed', 'No unauthorized changes', 'Signed acceptance received', 'PO/Contract obtained'] }
  ];

  return (
    <IBCommerceHub>
      <div className="max-w-6xl">
        {/* Header */}
        <Link to="/solutions/commerce/revenue" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 font-semibold">
          <ArrowLeft className="h-5 w-5" /> Back to Revenue Module
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-xl">
            <CheckSquare className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-slate-900">Commit Module</h1>
            <p className="text-2xl text-slate-600">Quote Management & Deal Closure</p>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-12">
          <p className="text-lg text-blue-900 mb-2">
            <strong>Purpose:</strong> The moment of truth. Once committed, you're bound. Ensure every commitment is profitable, deliverable, and approved.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Quote Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Approval Control</span>
            </div>
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Binding Commitment</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'components', label: 'Commit Components', icon: CheckSquare },
              { key: 'approvals', label: 'Approval Matrix', icon: Users },
              { key: 'scenarios', label: 'Real Scenarios', icon: Target }
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
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Commit Stage</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Commit Controls
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Quotes sent without cost verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Unauthorized discounts given</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Terms changed without legal review</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Commitments made without delivery buy-in</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>No audit trail of who approved what</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Commit
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Quotes linked to verified costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Discount limits enforced by system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Non-standard terms routed to legal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Delivery sign-off required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Complete approval audit trail</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">The Commit Principle</h2>
              <p className="text-xl leading-relaxed mb-6">
                A quote is a promise. A contract is binding. Before any commitment leaves your company, ensure it's accurate, profitable, and approved by the right people.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded-xl text-center">
                  <Send className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-bold">Quote</h4>
                  <p className="text-sm opacity-80">Your offer to customer</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-bold">Approvals</h4>
                  <p className="text-sm opacity-80">Internal sign-offs</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center">
                  <Handshake className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-bold">Agreement</h4>
                  <p className="text-sm opacity-80">Binding commitment</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Commit Checklist</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {commitChecklist.map((category, index) => (
                  <div key={`item-${index}`} className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{category.category}</h3>
                    <ul className="space-y-3">
                      {category.items.map((item, i) => (
                        <li key={`item-${i}`} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-8">
            {commitComponents.map((component, index) => (
              <div key={`item-${index}`} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900">{component.name}</h3>
                  <p className="text-slate-700">{component.description}</p>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Elements:</h4>
                    <ul className="space-y-2">
                      {component.elements.map((el, i) => (
                        <li key={`item-${i}`} className="flex items-center gap-2 text-slate-700">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          {el}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-3">Control Points:</h4>
                    <ul className="space-y-2">
                      {component.controlPoints.map((cp, i) => (
                        <li key={`item-${i}`} className="flex items-center gap-2 text-slate-700 bg-blue-50 p-2 rounded-lg">
                          <Shield className="h-4 w-4 text-blue-600" />
                          {cp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Approval Matrix</h2>
              <p className="text-blue-800">Who needs to approve what, based on deal characteristics</p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-bold text-slate-900">Deal Size</th>
                    <th className="text-left p-4 font-bold text-slate-900">Max Discount</th>
                    <th className="text-left p-4 font-bold text-slate-900">Terms</th>
                    <th className="text-left p-4 font-bold text-slate-900">Required Approvers</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalMatrix.map((row, i) => (
                    <tr key={`item-${i}`} className="border-t border-slate-200">
                      <td className="p-4 font-semibold text-slate-900">{row.dealSize}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-sm">{row.discount}</span>
                      </td>
                      <td className="p-4 text-slate-600">{row.terms}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {row.approvers.map((approver, j) => (
                            <span key={j} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{approver}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200">
              <h3 className="text-xl font-bold text-yellow-900 mb-4">Exception Handling</h3>
              <p className="text-yellow-800 mb-4">When deals require exceptions to standard matrix:</p>
              <ul className="space-y-2">
                {[
                  'Document the business justification',
                  'Escalate to next approval level',
                  'Legal review for any term modifications',
                  'CFO approval for margin exceptions',
                  'Exception logged in deal record for audit'
                ].map((item, i) => (
                  <li key={`item-${i}`} className="flex items-center gap-2 text-slate-700">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
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

                  {scenario.problem && (
                    <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                      <h3 className="text-xl font-bold text-red-900 mb-4">❌ The Problem</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(scenario.problem).map(([key, value], i) => (
                          <div key={`item-${i}`} className="flex justify-between">
                            <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-bold text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scenario.impact && (
                    <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                      <h3 className="text-xl font-bold text-red-900 mb-4">❌ Impact</h3>
                      <div className="space-y-3">
                        {Object.entries(scenario.impact).map(([key, value], i) => (
                          <div key={`item-${i}`} className="flex justify-between">
                            <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-bold text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scenario.consequences && (
                    <div className="bg-red-50 p-4 rounded-xl">
                      <h4 className="font-bold text-red-900 mb-2">Consequences:</h4>
                      <ul className="space-y-2">
                        {scenario.consequences.map((c, i) => (
                          <li key={`item-${i}`} className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scenario.rootCause && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <p className="font-semibold text-yellow-900">Root Cause: {scenario.rootCause}</p>
                    </div>
                  )}

                  {scenario.withSystem && (
                    <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                      <h3 className="text-xl font-bold text-green-900 mb-4">✅ With Commit Controls</h3>
                      {scenario.withSystem.controls && (
                        <ul className="space-y-2 mb-4">
                          {scenario.withSystem.controls.map((c, i) => (
                            <li key={`item-${i}`} className="flex items-center gap-2 text-slate-700">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                      {scenario.withSystem.process && (
                        <ul className="space-y-2 mb-4">
                          {scenario.withSystem.process.map((p, i) => (
                            <li key={`item-${i}`} className="flex items-center gap-2 text-slate-700">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                      {scenario.withSystem.workflow && (
                        <p className="text-slate-700 mb-2">{scenario.withSystem.workflow}</p>
                      )}
                      {scenario.withSystem.visibility && (
                        <p className="text-slate-700 mb-2">{scenario.withSystem.visibility}</p>
                      )}
                      <p className="font-bold text-green-800">{scenario.withSystem.outcome}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Commit With Confidence</h2>
          <p className="text-xl mb-6 opacity-90">
            Every quote accurate. Every deal approved. Every commitment profitable.
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

export default CommitPage;
