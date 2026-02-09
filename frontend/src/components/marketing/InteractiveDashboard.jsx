import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
  Clock, ArrowUpRight, ArrowDownRight, Activity, BarChart3,
  PieChart, RefreshCw, Play, Pause, Zap, Eye
} from 'lucide-react';

/**
 * InteractiveDashboard - An animated demo dashboard component for solution overview pages
 * Shows live-updating metrics and charts to demonstrate platform capabilities
 * 
 * @param {string} type - Type of dashboard: 'commerce' | 'finance' | 'operations' | 'workforce' | 'capital'
 * @param {string} title - Dashboard title
 */
const InteractiveDashboard = ({ type = 'commerce', title = 'Live Dashboard Preview' }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard configurations by type
  const dashboardConfigs = {
    commerce: {
      color: 'blue',
      gradient: 'from-blue-500 to-blue-700',
      lightGradient: 'from-blue-50 to-blue-100',
      metrics: [
        { key: 'revenue', label: 'Revenue MTD', prefix: '₹', suffix: 'L', baseValue: 45, icon: DollarSign, trend: 'up' },
        { key: 'orders', label: 'Orders Today', prefix: '', suffix: '', baseValue: 124, icon: ShoppingCart, trend: 'up' },
        { key: 'customers', label: 'Active Leads', prefix: '', suffix: '', baseValue: 847, icon: Users, trend: 'up' },
        { key: 'conversion', label: 'Conversion', prefix: '', suffix: '%', baseValue: 12.4, icon: TrendingUp, trend: 'neutral' },
      ],
      chartLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      tabs: ['overview', 'revenue', 'pipeline', 'forecast']
    },
    finance: {
      color: 'green',
      gradient: 'from-green-500 to-emerald-700',
      lightGradient: 'from-green-50 to-emerald-100',
      metrics: [
        { key: 'receivables', label: 'Receivables', prefix: '₹', suffix: 'L', baseValue: 32.5, icon: DollarSign, trend: 'up' },
        { key: 'payables', label: 'Payables', prefix: '₹', suffix: 'L', baseValue: 18.2, icon: Clock, trend: 'down' },
        { key: 'cashflow', label: 'Net Cash Flow', prefix: '₹', suffix: 'L', baseValue: 14.3, icon: Activity, trend: 'up' },
        { key: 'dso', label: 'DSO', prefix: '', suffix: ' days', baseValue: 42, icon: Clock, trend: 'down' },
      ],
      chartLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      tabs: ['overview', 'ar', 'ap', 'reports']
    },
    operations: {
      color: 'orange',
      gradient: 'from-orange-500 to-amber-700',
      lightGradient: 'from-orange-50 to-amber-100',
      metrics: [
        { key: 'projects', label: 'Active Projects', prefix: '', suffix: '', baseValue: 24, icon: BarChart3, trend: 'up' },
        { key: 'tasks', label: 'Tasks Due Today', prefix: '', suffix: '', baseValue: 47, icon: Clock, trend: 'neutral' },
        { key: 'sla', label: 'SLA Compliance', prefix: '', suffix: '%', baseValue: 94.2, icon: TrendingUp, trend: 'up' },
        { key: 'utilization', label: 'Utilization', prefix: '', suffix: '%', baseValue: 78, icon: Activity, trend: 'up' },
      ],
      chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      tabs: ['overview', 'projects', 'tasks', 'resources']
    },
    workforce: {
      color: 'purple',
      gradient: 'from-purple-500 to-violet-700',
      lightGradient: 'from-purple-50 to-violet-100',
      metrics: [
        { key: 'employees', label: 'Active Employees', prefix: '', suffix: '', baseValue: 156, icon: Users, trend: 'up' },
        { key: 'attendance', label: 'Attendance Today', prefix: '', suffix: '%', baseValue: 92, icon: Clock, trend: 'up' },
        { key: 'pending', label: 'Pending Leaves', prefix: '', suffix: '', baseValue: 8, icon: Activity, trend: 'down' },
        { key: 'payroll', label: 'Payroll Due', prefix: '₹', suffix: 'L', baseValue: 28.5, icon: DollarSign, trend: 'neutral' },
      ],
      chartLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      tabs: ['overview', 'people', 'time', 'payroll']
    },
    capital: {
      color: 'red',
      gradient: 'from-red-500 to-rose-700',
      lightGradient: 'from-red-50 to-rose-100',
      metrics: [
        { key: 'balance', label: 'Cash Position', prefix: '₹', suffix: 'Cr', baseValue: 4.2, icon: DollarSign, trend: 'up' },
        { key: 'runway', label: 'Runway', prefix: '', suffix: ' months', baseValue: 18, icon: Clock, trend: 'up' },
        { key: 'debt', label: 'Debt Outstanding', prefix: '₹', suffix: 'Cr', baseValue: 1.5, icon: Activity, trend: 'down' },
        { key: 'roi', label: 'Treasury ROI', prefix: '', suffix: '%', baseValue: 7.2, icon: TrendingUp, trend: 'up' },
      ],
      chartLabels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2'],
      tabs: ['overview', 'treasury', 'debt', 'equity']
    }
  };

  const config = dashboardConfigs[type] || dashboardConfigs.commerce;

  // Initialize metrics on mount or type change
  useEffect(() => {
    const currentConfig = dashboardConfigs[type] || dashboardConfigs.commerce;
    const initial = {};
    currentConfig.metrics.forEach(m => {
      initial[m.key] = m.baseValue;
    });
    setMetrics(initial);
    
    // Initialize chart data
    setChartData(currentConfig.chartLabels.map(() => 
      Math.floor(Math.random() * 40) + 60
    ));
  }, [type]);

  // Simulate live updates
  useEffect(() => {
    if (!isPlaying) return;
    
    const currentConfig = dashboardConfigs[type] || dashboardConfigs.commerce;
    
    const interval = setInterval(() => {
      setMetrics(prev => {
        const updated = { ...prev };
        currentConfig.metrics.forEach(m => {
          const change = (Math.random() - 0.5) * 2;
          updated[m.key] = Math.max(0, +(prev[m.key] + change).toFixed(1));
        });
        return updated;
      });

      setChartData(prev => {
        const newData = [...prev.slice(1), Math.floor(Math.random() * 40) + 60];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, type]);

  const getColorClasses = (color) => ({
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100', border: 'border-blue-200' },
    green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100', border: 'border-green-200' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100', border: 'border-orange-200' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100', border: 'border-purple-200' },
    red: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100', border: 'border-red-200' },
  }[color]);

  const colors = getColorClasses(config.color);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
      {/* Dashboard Header */}
      <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-white/80 text-sm">Interactive demo • Data updates live</p>
            </div>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          {config.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-slate-900' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {config.metrics.map((metric) => {
          const Icon = metric.icon;
          const value = metrics[metric.key] || metric.baseValue;
          const TrendIcon = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : Activity;
          const trendColor = metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-slate-500';
          
          return (
            <div 
              key={metric.key} 
              className={`p-4 rounded-2xl ${colors.light} ${colors.border} border transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {metric.prefix}{typeof value === 'number' ? value.toLocaleString() : value}{metric.suffix}
              </p>
              <p className="text-sm text-slate-600">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Mini Chart */}
      <div className="px-6 pb-6">
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${config.lightGradient} border ${colors.border}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-700">Trend Analysis</p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw className={`h-4 w-4 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>Live</span>
            </div>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-24">
            {chartData.map((value, index) => (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div 
                  className={`w-full rounded-t-lg ${colors.bg} transition-all duration-500`}
                  style={{ height: `${value}%` }}
                />
                <span className="text-xs text-slate-500">{config.chartLabels[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Zap className={`h-4 w-4 ${colors.text}`} />
            <span>AI-powered insights updating in real-time</span>
          </div>
          <a 
            href="/auth/signup" 
            className={`text-sm font-semibold ${colors.text} hover:underline`}
          >
            Try Full Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDashboard;
