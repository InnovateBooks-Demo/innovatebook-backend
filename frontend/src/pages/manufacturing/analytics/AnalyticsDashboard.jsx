import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pipelineSummary, setPipelineSummary] = useState(null);
  const [conversionFunnel, setConversionFunnel] = useState(null);
  const [approvalBottlenecks, setApprovalBottlenecks] = useState(null);
  const [industryPerformance, setIndustryPerformance] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data
      const [
        pipelineRes,
        funnelRes,
        approvalRes,
        industryRes,
        trendRes,
        riskRes
      ] = await Promise.all([
        fetch(`${BACKEND_URL}/api/manufacturing/analytics/pipeline-summary`),
        fetch(`${BACKEND_URL}/api/manufacturing/analytics/conversion-funnel`),
        fetch(`${BACKEND_URL}/api/manufacturing/analytics/approval-bottlenecks`),
        fetch(`${BACKEND_URL}/api/manufacturing/analytics/industry-performance`),
        fetch(`${BACKEND_URL}/api/manufacturing/analytics/monthly-trend?months=6`),
        fetch(`${BACKEND_URL}/api/manufacturing/analytics/risk-analysis`)
      ]);

      const [pipeline, funnel, approval, industry, trend, risk] = await Promise.all([
        pipelineRes.json(),
        funnelRes.json(),
        approvalRes.json(),
        industryRes.json(),
        trendRes.json(),
        riskRes.json()
      ]);

      setPipelineSummary(pipeline.summary);
      setConversionFunnel(funnel.funnel);
      setApprovalBottlenecks(approval.approval_analysis);
      setIndustryPerformance(industry.industry_performance);
      setMonthlyTrend(trend.monthly_trend?.monthly_trend || []);
      setRiskAnalysis(risk.risk_analysis);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare pipeline data for charts
  const pipelineChartData = pipelineSummary?.stages ? Object.keys(pipelineSummary.stages).map(stage => ({
    name: stage,
    count: pipelineSummary.stages[stage].count,
    value: pipelineSummary.stages[stage].value
  })) : [];

  // Prepare funnel data
  const funnelChartData = conversionFunnel?.funnel ? Object.keys(conversionFunnel.funnel).map(stage => ({
    name: stage,
    entered: conversionFunnel.funnel[stage].entered,
    converted: conversionFunnel.funnel[stage].converted,
    conversion_rate: conversionFunnel.funnel[stage].conversion_rate
  })) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturing Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Leads</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pipelineSummary?.total_leads || 0}</p>
          <p className="text-sm text-gray-500 mt-1">All pipeline stages</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{pipelineSummary?.conversion_rate || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">Won / (Won + Lost)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Pipeline Value</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            ₹{((pipelineSummary?.total_value || 0) / 10000000).toFixed(1)}Cr
          </p>
          <p className="text-sm text-gray-500 mt-1">Across all stages</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Deal Size</h3>
            <span className="text-2xl">💵</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            ₹{((pipelineSummary?.average_deal_size || 0) / 100000).toFixed(1)}L
          </p>
          <p className="text-sm text-gray-500 mt-1">Per lead</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline by Stage */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Lead Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entered" fill="#10B981" name="Entered" />
              <Bar dataKey="converted" fill="#3B82F6" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Industry Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="industry" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_leads" fill="#8B5CF6" name="Total Leads" />
              <Bar dataKey="won_leads" fill="#10B981" name="Won Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Low Risk', value: riskAnalysis?.summary?.Low?.count || 0 },
                  { name: 'Medium Risk', value: riskAnalysis?.summary?.Medium?.count || 0 },
                  { name: 'High Risk', value: riskAnalysis?.summary?.High?.count || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1, 2].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">6-Month Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_leads" stroke="#3B82F6" name="Total Leads" />
            <Line type="monotone" dataKey="won_leads" stroke="#10B981" name="Won Leads" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Approval Bottlenecks */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Bottlenecks</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">In Approval</p>
            <p className="text-2xl font-bold text-blue-600">{approvalBottlenecks?.total_in_approval || 0}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{approvalBottlenecks?.pending_count || 0}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approvalBottlenecks?.approved_count || 0}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg Approval Time</p>
            <p className="text-2xl font-bold text-red-600">{approvalBottlenecks?.average_approval_time_days || 0} days</p>
          </div>
        </div>

        {/* Approval by Type */}
        {approvalBottlenecks?.by_type && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-3">By Approval Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(approvalBottlenecks.by_type).map(type => (
                <div key={type} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">{type}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600">Pending: {approvalBottlenecks.by_type[type].pending}</span>
                    <span className="text-green-600">Approved: {approvalBottlenecks.by_type[type].approved}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* High Risk Leads */}
      {riskAnalysis?.high_risk_leads && riskAnalysis.high_risk_leads.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">High Risk Leads</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {riskAnalysis.high_risk_leads.map(lead => (
                  <tr key={lead.lead_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.lead_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {lead.risk_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{(lead.value / 100000).toFixed(1)}L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
