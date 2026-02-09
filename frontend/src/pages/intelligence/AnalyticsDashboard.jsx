import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, ShoppingCart, Users, ArrowLeft, ArrowUpRight, ArrowDownRight, PieChart, Activity, DollarSign } from 'lucide-react';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/intelligence/analytics/dashboard' },
    { id: 'revenue', label: 'Revenue Analytics', path: '/intelligence/analytics/revenue' },
    { id: 'procurement', label: 'Procurement Analytics', path: '/intelligence/analytics/procurement' },
    { id: 'parties', label: 'Party Analytics', path: '/intelligence/analytics/parties' }
  ];

  const activeTab = tabs.find(t => location.pathname === t.path)?.id || 'dashboard';

  const revenueMetrics = [
    { label: 'Total Revenue', value: '₹124.5M', change: '+18.2%', up: true },
    { label: 'New Deals', value: '45', change: '+12', up: true },
    { label: 'Win Rate', value: '68%', change: '+5%', up: true },
    { label: 'Avg Deal Size', value: '₹4.2L', change: '-3%', up: false }
  ];

  const procurementMetrics = [
    { label: 'Total Spend', value: '₹78.3M', change: '+8.5%', up: true },
    { label: 'Active POs', value: '156', change: '+23', up: true },
    { label: 'Vendor Count', value: '89', change: '+5', up: true },
    { label: 'Avg Savings', value: '12%', change: '+2%', up: true }
  ];

  const partyMetrics = [
    { label: 'Total Parties', value: '2,456', change: '+156', up: true },
    { label: 'Verified', value: '1,890', change: '77%', up: true },
    { label: 'High Risk', value: '45', change: '-12', up: true },
    { label: 'Blocked', value: '23', change: '+3', up: false }
  ];

  const getMetrics = () => {
    switch(activeTab) {
      case 'revenue': return revenueMetrics;
      case 'procurement': return procurementMetrics;
      case 'parties': return partyMetrics;
      default: return revenueMetrics;
    }
  };

  const chartData = [
    { month: 'Jul', revenue: 18, procurement: 12 },
    { month: 'Aug', revenue: 22, procurement: 14 },
    { month: 'Sep', revenue: 19, procurement: 11 },
    { month: 'Oct', revenue: 25, procurement: 16 },
    { month: 'Nov', revenue: 28, procurement: 18 },
    { month: 'Dec', revenue: 32, procurement: 20 }
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="analytics-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/intelligence')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Intelligence → Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time business intelligence and KPIs</p>
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {getMetrics().map((metric, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{metric.label}</p>
                <span className={`flex items-center gap-1 text-sm font-medium ${metric.up ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {metric.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart Placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            <div className="h-64 flex items-end justify-between gap-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end justify-center h-48">
                    <div className="w-5 bg-blue-500 rounded-t" style={{ height: `${d.revenue * 4}px` }}></div>
                    <div className="w-5 bg-purple-500 rounded-t" style={{ height: `${d.procurement * 4}px` }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span className="text-sm text-gray-600">Revenue</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded"></div><span className="text-sm text-gray-600">Procurement</span></div>
            </div>
          </div>

          {/* Pie Chart Placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="20" strokeDasharray="125.6 251.2" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="75.4 251.2" strokeDashoffset="-125.6" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="50.2 251.2" strokeDashoffset="-201" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">₹202M</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span className="text-sm text-gray-600">Revenue 50%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded"></div><span className="text-sm text-gray-600">Spend 30%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div><span className="text-sm text-gray-600">Profit 20%</span></div>
            </div>
          </div>
        </div>

        {/* Top Items Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Tata Motors Ltd', category: 'Automotive', value: '₹45.2M', growth: '+24%' },
                { name: 'Reliance Industries', category: 'Energy', value: '₹38.7M', growth: '+18%' },
                { name: 'Infosys Ltd', category: 'IT Services', value: '₹32.1M', growth: '+15%' },
                { name: 'HDFC Bank', category: 'Banking', value: '₹28.9M', growth: '+12%' },
                { name: 'Wipro Ltd', category: 'IT Services', value: '₹24.3M', growth: '+10%' }
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 text-right font-semibold">{item.value}</td>
                  <td className="px-6 py-4 text-right text-green-600 font-medium">{item.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
