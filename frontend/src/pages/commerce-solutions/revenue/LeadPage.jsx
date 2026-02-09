import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, CheckCircle, AlertTriangle, Users, TrendingUp, Filter, Zap, Calendar, FileText, Star, Award, BarChart3, Phone, Mail, Globe } from 'lucide-react';
import IBCommerceHub from '../../IBCommerceHub';

const LeadPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const leadQualificationFramework = {
    bant: {
      name: 'BANT Framework',
      criteria: [
        { letter: 'B', name: 'Budget', question: 'Do they have budget allocated?', score: '25 points' },
        { letter: 'A', name: 'Authority', question: 'Are we talking to decision maker?', score: '25 points' },
        { letter: 'N', name: 'Need', question: 'Is there a clear business need?', score: '25 points' },
        { letter: 'T', name: 'Timeline', question: 'When do they need to decide?', score: '25 points' }
      ],
      scoring: {
        '75-100': 'Hot Lead - Immediate follow-up',
        '50-74': 'Warm Lead - Nurture with priority',
        '25-49': 'Cool Lead - Long-term nurture',
        '0-24': 'Cold Lead - Marketing recycling'
      }
    }
  };

  const leadSources = [
    { source: 'Inbound Web', avgScore: 65, conversionRate: '18%', costPerLead: '$45' },
    { source: 'Trade Shows', avgScore: 72, conversionRate: '22%', costPerLead: '$180' },
    { source: 'Referrals', avgScore: 85, conversionRate: '35%', costPerLead: '$25' },
    { source: 'Outbound SDR', avgScore: 45, conversionRate: '8%', costPerLead: '$120' },
    { source: 'Partner', avgScore: 68, conversionRate: '20%', costPerLead: '$0 (rev share)' }
  ];

  const leadStages = [
    {
      stage: 'New',
      description: 'Just captured, not yet contacted',
      sla: 'Contact within 24 hours',
      actions: ['Validate contact info', 'Enrich data', 'Assign to rep'],
      exitCriteria: 'First contact made'
    },
    {
      stage: 'Contacted',
      description: 'Initial outreach completed',
      sla: 'Qualify within 5 business days',
      actions: ['Discovery call scheduled', 'Understand basic need', 'Collect BANT info'],
      exitCriteria: 'Qualification complete'
    },
    {
      stage: 'Qualified',
      description: 'Meets qualification criteria',
      sla: 'Convert to opportunity within 10 days',
      actions: ['Deep discovery', 'Identify stakeholders', 'Scope initial solution'],
      exitCriteria: 'Opportunity created'
    },
    {
      stage: 'Nurture',
      description: 'Not ready now, future potential',
      sla: 'Touch every 30 days',
      actions: ['Add to nurture campaign', 'Share relevant content', 'Monitor engagement'],
      exitCriteria: 'Re-engagement signal'
    },
    {
      stage: 'Disqualified',
      description: 'Not a fit for our solution',
      sla: 'N/A',
      actions: ['Document reason', 'Return to marketing if appropriate'],
      exitCriteria: 'N/A'
    }
  ];

  const realScenarios = [
    {
      title: 'The Million-Dollar Lead Leak',
      company: 'B2B Software Company',
      situation: 'Marketing generated 500 leads/month. Sales complained about "low quality." Actually, leads were going cold due to slow follow-up.',
      metrics: {
        leadsPerMonth: 500,
        avgResponseTime: '4.5 days',
        qualificationRate: '8%',
        pipelineGenerated: '$2.1M/month'
      },
      problem: 'Research shows lead conversion drops 80% after first hour. 4.5 day response = dead leads.',
      withSystem: {
        changes: [
          'Auto-routing to available rep within 15 minutes',
          'SLA alerts when leads age',
          'Round-robin distribution for fairness',
          'Manager dashboard showing response times'
        ],
        newMetrics: {
          avgResponseTime: '23 minutes',
          qualificationRate: '18%',
          pipelineGenerated: '$4.7M/month'
        },
        improvement: '$2.6M additional monthly pipeline (124% increase)'
      }
    },
    {
      title: 'The Hidden Champion Problem',
      company: 'Enterprise Services Firm',
      situation: 'Reps focused on leads with biggest titles. Missed that many enterprise deals start with middle managers who have budget authority.',
      problem: {
        focus: 'C-level only (15% of leads)',
        ignored: 'Director/Manager level (60% of leads)',
        result: 'Low conversion, long cycles, missing influencer relationships'
      },
      withSystem: {
        approach: [
          'Multi-stakeholder tracking per lead',
          'Authority scoring considers actual buying patterns',
          'Historical win analysis shows Director-level starts',
          'Champion identification and tracking'
        ],
        outcome: 'Discovered 40% of $500K+ deals started with Director-level contacts. Adjusted scoring. Conversion improved 45%.'
      }
    }
  ];

  return (
    <IBCommerceHub>
      <div className="max-w-6xl">
        {/* Header */}
        <Link to="/solutions/commerce/revenue" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 font-semibold">
          <ArrowLeft className="h-5 w-5" /> Back to Revenue Module
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-800 rounded-3xl flex items-center justify-center shadow-xl">
            <Target className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-slate-900">Lead Management</h1>
            <p className="text-2xl text-slate-600">Capture, Qualify & Convert Opportunities</p>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-12">
          <p className="text-lg text-green-900 mb-2">
            <strong>Purpose:</strong> Ensure no potential revenue slips through the cracks. Systematic lead handling increases conversion by 3-5x.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">15-Minute Response SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Automated Qualification</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">3x Pipeline Improvement</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'qualification', label: 'Qualification', icon: Filter },
              { key: 'stages', label: 'Lead Stages', icon: BarChart3 },
              { key: 'scenarios', label: 'Real Scenarios', icon: Target }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4 ${
                    activeTab === tab.key
                      ? 'border-green-600 text-green-600'
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
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Lead Management Matters</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Lead Management
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Leads sit in inbox for days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Best leads go to loudest reps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>No visibility into lead source ROI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Unqualified leads clog pipeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Marketing and Sales blame each other</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Lead Management
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Sub-hour response time guaranteed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Fair, round-robin distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Source-to-revenue tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Automated qualification scoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Shared metrics and accountability</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Lead Source Performance</h2>
              <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-bold text-slate-900">Source</th>
                      <th className="text-left p-4 font-bold text-slate-900">Avg Score</th>
                      <th className="text-left p-4 font-bold text-slate-900">Conversion</th>
                      <th className="text-left p-4 font-bold text-slate-900">Cost/Lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadSources.map((source, i) => (
                      <tr key={`item-${i}`} className="border-t border-slate-200">
                        <td className="p-4 font-semibold text-slate-900">{source.source}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${source.avgScore > 70 ? 'bg-green-500' : source.avgScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${source.avgScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono">{source.avgScore}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full font-bold ${
                            parseInt(source.conversionRate) > 25 ? 'bg-green-100 text-green-700' :
                            parseInt(source.conversionRate) > 15 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{source.conversionRate}</span>
                        </td>
                        <td className="p-4 text-slate-600">{source.costPerLead}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Speed to Lead = Speed to Revenue</h2>
              <p className="text-xl leading-relaxed mb-6">
                Research shows contacting a lead within 5 minutes makes you 9x more likely to convert. After 30 minutes, your odds drop by 21x.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded-xl text-center">
                  <div className="text-4xl font-bold mb-2">5 min</div>
                  <p className="text-sm opacity-80">Optimal response time</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center">
                  <div className="text-4xl font-bold mb-2">9x</div>
                  <p className="text-sm opacity-80">Higher conversion</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center">
                  <div className="text-4xl font-bold mb-2">21x</div>
                  <p className="text-sm opacity-80">Drop after 30 min</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'qualification' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">{leadQualificationFramework.bant.name}</h2>
              <div className="space-y-4">
                {leadQualificationFramework.bant.criteria.map((criterion, i) => (
                  <div key={`item-${i}`} className="flex items-start gap-4 bg-slate-50 p-6 rounded-xl">
                    <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                      {criterion.letter}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{criterion.name}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-sm">{criterion.score}</span>
                      </div>
                      <p className="text-slate-700">{criterion.question}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Score Interpretation</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(leadQualificationFramework.bant.scoring).map(([range, action], i) => (
                    <div key={`item-${i}`} className={`p-4 rounded-xl ${
                      i === 0 ? 'bg-red-50 border-2 border-red-200' :
                      i === 1 ? 'bg-orange-50 border-2 border-orange-200' :
                      i === 2 ? 'bg-yellow-50 border-2 border-yellow-200' :
                      'bg-slate-50 border-2 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{range}</span>
                        <span className="text-sm text-slate-600">{action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stages' && (
          <div className="space-y-6">
            {leadStages.map((stage, index) => (
              <div key={`item-${index}`} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                <div className={`p-4 ${
                  stage.stage === 'New' ? 'bg-blue-50' :
                  stage.stage === 'Contacted' ? 'bg-yellow-50' :
                  stage.stage === 'Qualified' ? 'bg-green-50' :
                  stage.stage === 'Nurture' ? 'bg-purple-50' :
                  'bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{stage.stage}</h3>
                    <span className="px-4 py-1 bg-white rounded-full text-sm font-semibold text-slate-600">
                      SLA: {stage.sla}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1">{stage.description}</p>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Required Actions:</h4>
                    <ul className="space-y-2">
                      {stage.actions.map((action, i) => (
                        <li key={`item-${i}`} className="flex items-center gap-2 text-slate-700">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-2">Exit Criteria:</h4>
                    <p className="text-slate-700">{stage.exitCriteria}</p>
                  </div>
                </div>
              </div>
            ))}
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

                  {scenario.metrics && (
                    <div className="grid md:grid-cols-4 gap-4">
                      {Object.entries(scenario.metrics).map(([key, value], i) => (
                        <div key={`item-${i}`} className="bg-red-50 p-4 rounded-xl text-center">
                          <p className="text-2xl font-bold text-red-600">{value}</p>
                          <p className="text-sm text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {scenario.problem && typeof scenario.problem === 'string' && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                      <p className="text-red-800">{scenario.problem}</p>
                    </div>
                  )}

                  {scenario.withSystem && (
                    <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                      <h3 className="text-xl font-bold text-green-900 mb-4">✅ With Lead Management System</h3>
                      {scenario.withSystem.changes && (
                        <ul className="space-y-2 mb-4">
                          {scenario.withSystem.changes.map((change, i) => (
                            <li key={`item-${i}`} className="flex items-center gap-2 text-slate-700">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      )}
                      {scenario.withSystem.newMetrics && (
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          {Object.entries(scenario.withSystem.newMetrics).map(([key, value], i) => (
                            <div key={`item-${i}`} className="bg-white p-3 rounded-lg text-center">
                              <p className="text-xl font-bold text-green-600">{value}</p>
                              <p className="text-xs text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {scenario.withSystem.improvement && (
                        <p className="font-bold text-green-800 text-lg">{scenario.withSystem.improvement}</p>
                      )}
                      {scenario.withSystem.outcome && (
                        <p className="font-bold text-green-800">{scenario.withSystem.outcome}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss Another Lead</h2>
          <p className="text-xl mb-6 opacity-90">
            Turn marketing investment into pipeline with systematic lead management
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:shadow-xl transition-all"
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

export default LeadPage;
