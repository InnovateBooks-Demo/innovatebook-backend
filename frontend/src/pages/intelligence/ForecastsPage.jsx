import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, ArrowLeft, ArrowUpRight, ArrowDownRight, Target, DollarSign, Wallet, BarChart3 } from 'lucide-react';

const ForecastsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'revenue', label: 'Revenue Forecast', path: '/intelligence/forecasts/revenue' },
    { id: 'spend', label: 'Spend Forecast', path: '/intelligence/forecasts/spend' },
    { id: 'cashflow', label: 'Cash Flow Forecast', path: '/intelligence/forecasts/cashflow' }
  ];

  const activeTab = tabs.find(t => location.pathname === t.path)?.id || 'revenue';

  const revenueData = {
    current: '₹124.5M',
    forecast: '₹156.8M',
    growth: '+26%',
    confidence: '94%',
    quarters: [
      { q: 'Q1 2026', actual: null, forecast: 42, target: 40 },
      { q: 'Q2 2026', actual: null, forecast: 48, target: 45 },
      { q: 'Q3 2026', actual: null, forecast: 38, target: 40 },
      { q: 'Q4 2026', actual: null, forecast: 52, target: 50 }
    ]
  };

  const spendData = {
    current: '₹78.3M',
    forecast: '₹92.1M',
    growth: '+18%',
    confidence: '91%',
    categories: [
      { name: 'Raw Materials', current: 35, forecast: 42 },
      { name: 'Services', current: 22, forecast: 26 },
      { name: 'Equipment', current: 15, forecast: 18 },
      { name: 'Other', current: 6, forecast: 6 }
    ]
  };

  const cashflowData = {
    current: '₹45.2M',
    forecast: '₹62.4M',
    growth: '+38%',
    confidence: '89%',
    months: [
      { month: 'Jan', inflow: 28, outflow: 22 },
      { month: 'Feb', inflow: 32, outflow: 25 },
      { month: 'Mar', inflow: 30, outflow: 24 },
      { month: 'Apr', inflow: 35, outflow: 27 },
      { month: 'May', inflow: 38, outflow: 28 },
      { month: 'Jun', inflow: 42, outflow: 30 }
    ]
  };

  const getData = () => {
    switch(activeTab) {
      case 'spend': return spendData;
      case 'cashflow': return cashflowData;
      default: return revenueData;
    }
  };

  const data = getData();

  return (
    <div className="min-h-screen bg-gray-50" data-testid="forecasts-page">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/intelligence')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Intelligence → Forecasts</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Forecasts</h1>
              <p className="text-sm text-gray-500 mt-1">Predictive analytics and projections</p>
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
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Current (YTD)</p>
            <p className="text-3xl font-bold text-gray-900">{data.current}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Forecast (Full Year)</p>
            <p className="text-3xl font-bold text-gray-900">{data.forecast}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Projected Growth</p>
            <p className="text-3xl font-bold text-green-600 flex items-center gap-2">
              <ArrowUpRight className="h-6 w-6" />
              {data.growth}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Model Confidence</p>
            <p className="text-3xl font-bold text-blue-600">{data.confidence}</p>
          </div>
        </div>

        {/* Revenue Forecast Chart */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quarterly Revenue Forecast</h3>
            <div className="h-64 flex items-end justify-around gap-8">
              {revenueData.quarters.map((q, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center gap-2 h-48">
                    <div className="w-12 bg-orange-500 rounded-t relative" style={{ height: `${q.forecast * 3}px` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-600">₹{q.forecast}M</span>
                    </div>
                    <div className="w-12 bg-gray-300 rounded-t" style={{ height: `${q.target * 3}px` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 mt-2 font-medium">{q.q}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded"></div><span className="text-sm text-gray-600">Forecast</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-300 rounded"></div><span className="text-sm text-gray-600">Target</span></div>
            </div>
          </div>
        )}

        {/* Spend Forecast */}
        {activeTab === 'spend' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spend by Category</h3>
            <div className="space-y-4">
              {spendData.categories.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm text-gray-500">₹{cat.current}M → ₹{cat.forecast}M</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: `${(cat.forecast / 50) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cash Flow Forecast */}
        {activeTab === 'cashflow' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">6-Month Cash Flow Projection</h3>
            <div className="h-64 flex items-end justify-around gap-4">
              {cashflowData.months.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div className="w-8 bg-green-500 rounded-t" style={{ height: `${m.inflow * 4}px` }}></div>
                    <div className="w-8 bg-red-400 rounded-t" style={{ height: `${m.outflow * 4}px` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 mt-2">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div><span className="text-sm text-gray-600">Inflow</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-400 rounded"></div><span className="text-sm text-gray-600">Outflow</span></div>
            </div>
          </div>
        )}

        {/* Key Assumptions */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Forecast Assumptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-white/80">Market Growth</p>
              <p className="text-xl font-bold">+8% YoY</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-white/80">Customer Retention</p>
              <p className="text-xl font-bold">92%</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-white/80">Price Increase</p>
              <p className="text-xl font-bold">+5%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastsPage;
