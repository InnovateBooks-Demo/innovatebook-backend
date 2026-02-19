import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Search,
  FileText,
  CheckCircle,
  FileCheck,
  DollarSign,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Receipt,
  Scale,
  Shield,
  ArrowRight,
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  Zap,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CommerceDashboardPremium = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/dashboard/stats`,
      );
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      // Set default stats on error
      setStats({
        totalRevenue: 2450000,
        activeLeads: 19,
        outstandingInvoices: 1,
        collectionsDue: 820000,
      });
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `₹${(stats?.totalRevenue / 100000).toFixed(1)}M`,
      icon: TrendingUp,
      color: "cyan",
      gradient: "from-[#033F99] to-[#033F99]",
      borderColor: "border-[#033F99]",
      bgGradient: "from-[#033F99]/10",
    },
    {
      title: "Active Leads",
      value: stats?.activeLeads || 19,
      icon: UserPlus,
      color: "blue",
      gradient: "from-[#0147CC] to-blue-700",
      borderColor: "border-blue-200",
      bgGradient: "from-[#033F99]/10",
    },
    {
      title: "Outstanding Invoices",
      value: stats?.outstandingInvoices || 1,
      icon: FileCheck,
      color: "purple",
      gradient: "from-purple-600 to-purple-700",
      borderColor: "border-purple-200",
      bgGradient: "from-purple-500/10",
    },
    {
      title: "Collections Due",
      value: `₹${((stats?.collectionsDue || 820000) / 100000).toFixed(1)}M`,
      icon: DollarSign,
      color: "emerald",
      gradient: "from-emerald-600 to-emerald-700",
      borderColor: "border-emerald-200",
      bgGradient: "from-emerald-500/10",
    },
  ];

  const quickActions = [
    {
      title: "Create Lead",
      description: "Click to create",
      icon: UserPlus,
      color: "from-[#033F99] to-[#033F99]",
      path: "/commerce/lead/create",
    },
    {
      title: "New Invoice",
      description: "Click to create",
      icon: FileCheck,
      color: "from-[#033F99] to-[#0147CC]",
      path: "/commerce/bill/create",
    },
    {
      title: "Add Procurement",
      description: "Click to create",
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      path: "/commerce/procure/create",
    },
    {
      title: "Record Payment",
      description: "Click to create",
      icon: Wallet,
      color: "from-emerald-500 to-emerald-600",
      path: "/commerce/pay/create",
    },
  ];

  const revenueModules = [
    { name: "Lead", icon: UserPlus, path: "/commerce/lead", count: 19 },
    { name: "Evaluate", icon: Search, path: "/commerce/evaluate", count: 7 },
    { name: "Commit", icon: FileText, path: "/commerce/commit", count: 3 },
    { name: "Execute", icon: CheckCircle, path: "/commerce/execute", count: 2 },
    { name: "Bill", icon: FileCheck, path: "/commerce/bill", count: 1 },
    { name: "Collect", icon: DollarSign, path: "/commerce/collect", count: 0 },
  ];

  const procurementModules = [
    {
      name: "Procure",
      icon: ShoppingCart,
      path: "/commerce/procure",
      count: 5,
    },
    { name: "Pay", icon: Wallet, path: "/commerce/pay", count: 5 },
    { name: "Spend", icon: TrendingUp, path: "/commerce/spend", count: 0 },
  ];

  const governanceModules = [
    { name: "Tax", icon: Receipt, path: "/commerce/tax", count: 5 },
    { name: "Reconcile", icon: Scale, path: "/commerce/reconcile", count: 0 },
    { name: "Govern", icon: Shield, path: "/commerce/govern", count: 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Commerce Dashboard
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Monitor and manage your business operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#033F99] text-[#033F99] font-semibold rounded-xl hover:bg-[#C4D9F4] hover:border-[#033F99] transition-all duration-200">
              <Calendar className="h-5 w-5" />
              <span>This Month</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-xl shadow-xl transition-all duration-200">
              <BarChart3 className="h-5 w-5" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 ${kpi.borderColor}/50 shadow-xl hover:shadow-2xl hover:${kpi.borderColor} transition-all duration-300`}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.bgGradient} to-transparent rounded-full -mr-16 -mt-16`}
              ></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-3 bg-gradient-to-br ${kpi.gradient} rounded-2xl shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p
                  className={`text-sm font-bold text-${kpi.color}-700 uppercase tracking-wider mb-1`}
                >
                  {kpi.title}
                </p>
                <p className={`text-4xl font-black text-${kpi.color}-900`}>
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2
          className="text-2xl font-bold text-[#033F99] mb-6"
          style={{ fontFamily: "Poppins" }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} to={action.path}>
                <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-slate-200 hover:border-[#033F99] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 bg-gradient-to-br ${action.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-slate-900">
                        {action.title}
                      </p>
                      <p className="text-sm text-slate-600 font-medium">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#033F99] group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Module Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Cycle */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#033F99]">
                Revenue Cycle
              </h3>
              <p className="text-sm text-[#033F99] font-medium">
                Customer lifecycle management
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {revenueModules.map((module, idx) => {
              const Icon = module.icon;
              return (
                <Link key={idx} to={module.path}>
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-[#C4D9F4] hover:to-[#033F99] rounded-xl border border-slate-200 hover:border-[#033F99] transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[#033F99]" />
                      <span className="font-semibold text-slate-900">
                        {module.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-[#033F99] text-white rounded-full text-sm font-bold">
                        {module.count}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#033F99] group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Procurement Cycle */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-900">
                Procurement Cycle
              </h3>
              <p className="text-sm text-purple-600 font-medium">
                Vendor & spend management
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {procurementModules.map((module, idx) => {
              const Icon = module.icon;
              return (
                <Link key={idx} to={module.path}>
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-purple-50 hover:to-purple-100 rounded-xl border border-slate-200 hover:border-purple-300 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-slate-900">
                        {module.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                        {module.count}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Governance Cycle */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-900">
                Governance Cycle
              </h3>
              <p className="text-sm text-emerald-600 font-medium">
                Compliance & controls
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {governanceModules.map((module, idx) => {
              const Icon = module.icon;
              return (
                <Link key={idx} to={module.path}>
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-emerald-50 hover:to-emerald-100 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-slate-900">
                        {module.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                        {module.count}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommerceDashboardPremium;
