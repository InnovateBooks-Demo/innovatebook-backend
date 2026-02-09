import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, ArrowLeft, Lightbulb, AlertTriangle, TrendingUp, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react';

const InsightsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'ai', label: 'AI Insights', path: '/intelligence/insights/ai' },
    { id: 'recommendations', label: 'Recommendations', path: '/intelligence/insights/recommendations' },
    { id: 'anomalies', label: 'Anomalies', path: '/intelligence/insights/anomalies' }
  ];

  const activeTab = tabs.find(t => location.pathname === t.path)?.id || 'ai';

  const aiInsights = [
    {
      id: 1,
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: 'Based on historical patterns, Q1 typically sees 15% higher deal closures. Consider increasing sales team capacity.',
      impact: 'High',
      confidence: '92%',
      created: '2 hours ago'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Procurement Cost Spike',
      description: 'Raw material costs have increased by 8% in the last month. Review supplier contracts for renegotiation opportunities.',
      impact: 'Medium',
      confidence: '87%',
      created: '5 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Customer Retention Improved',
      description: 'Customer churn rate has decreased by 12% following the new support initiative. Continue investing in customer success.',
      impact: 'High',
      confidence: '95%',
      created: '1 day ago'
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: 'Optimize Payment Terms',
      description: 'Extend payment terms for top 20 vendors from Net 30 to Net 45 to improve cash flow by approximately ₹2.5Cr',
      category: 'Finance',
      priority: 'high',
      savings: '₹2.5Cr',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Consolidate Suppliers',
      description: 'Merge orders from 5 similar vendors to get volume discounts. Estimated savings of 8-12% on procurement costs.',
      category: 'Procurement',
      priority: 'medium',
      savings: '₹1.8Cr',
      status: 'in_review'
    },
    {
      id: 3,
      title: 'Automate Invoice Processing',
      description: 'Implement automated invoice matching to reduce processing time by 60% and minimize errors.',
      category: 'Operations',
      priority: 'medium',
      savings: '₹45L',
      status: 'implemented'
    }
  ];

  const anomalies = [
    {
      id: 1,
      severity: 'critical',
      title: 'Unusual Payment Pattern',
      description: 'Vendor VND-0045 received 3 payments totaling ₹15L in the last 24 hours, 400% above normal.',
      detected: '30 mins ago',
      status: 'investigating'
    },
    {
      id: 2,
      severity: 'warning',
      title: 'Invoice Amount Deviation',
      description: 'Invoice INV-2025-0892 is 45% higher than the average for this customer. Review for accuracy.',
      detected: '2 hours ago',
      status: 'resolved'
    },
    {
      id: 3,
      severity: 'info',
      title: 'Approval Delay Detected',
      description: '12 purchase requests have been pending approval for more than 5 days. Review bottleneck.',
      detected: '1 day ago',
      status: 'acknowledged'
    }
  ];

  const getInsightIcon = (type) => {
    switch(type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Lightbulb className="h-5 w-5 text-purple-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="insights-page">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/intelligence')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Intelligence → Insights</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Insights</h1>
              <p className="text-sm text-gray-500 mt-1">AI-powered recommendations and anomaly detection</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-t border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* AI Insights */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {aiInsights.map(insight => (
              <div key={insight.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {insight.impact} Impact
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <span className="text-sm text-gray-500">Confidence: <strong>{insight.confidence}</strong></span>
                      <span className="text-sm text-gray-400">{insight.created}</span>
                      <div className="flex items-center gap-2 ml-auto">
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium">
                          Take Action <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Recommendation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Est. Savings</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recommendations.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{rec.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{rec.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rec.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">{rec.savings}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rec.status === 'implemented' ? 'bg-green-100 text-green-700' :
                        rec.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Anomalies */}
        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className={`rounded-xl border p-6 ${getSeverityColor(anomaly.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className={`h-6 w-6 ${
                      anomaly.severity === 'critical' ? 'text-red-600' :
                      anomaly.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{anomaly.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{anomaly.description}</p>
                      <p className="text-xs text-gray-400 mt-2">Detected: {anomaly.detected}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    anomaly.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    anomaly.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {anomaly.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
