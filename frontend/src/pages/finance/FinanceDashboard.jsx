import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  Building2,
  CreditCard,
  Wallet,
  Receipt,
  AlertCircle,
} from "lucide-react";

const FinanceDashboard = () => {
  const navigate = useNavigate();

  const kpiCards = [
    {
      title: "Total Cash",
      value: "₹45.2Cr",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-emerald-600 to-emerald-700",
      bgColor: "emerald",
    },
    {
      title: "Revenue (MTD)",
      value: "₹18.7Cr",
      change: "+8.3%",
      trend: "up",
      icon: TrendingUp,
      color: "from-[#033F99] to-[#033F99]",
      bgColor: "blue",
    },
    {
      title: "Expenses (MTD)",
      value: "₹12.4Cr",
      change: "-3.2%",
      trend: "down",
      icon: CreditCard,
      color: "from-amber-600 to-amber-700",
      bgColor: "amber",
    },
    {
      title: "Net Profit",
      value: "₹6.3Cr",
      change: "+15.7%",
      trend: "up",
      icon: Wallet,
      color: "from-purple-600 to-purple-700",
      bgColor: "purple",
    },
  ];

  const quickActions = [
    {
      title: "Bill",
      description: "Create & manage invoices",
      icon: Receipt,
      path: "/finance/bill",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      title: "Collect",
      description: "Track collections & receipts",
      icon: DollarSign,
      path: "/finance/collect",
      color: "from-[#033F99] to-[#033F99]",
    },
    {
      title: "Pay",
      description: "Manage vendor payments",
      icon: CreditCard,
      path: "/finance/pay",
      color: "from-amber-600 to-amber-700",
    },
    {
      title: "Spend",
      description: "Track expenses & spending",
      icon: Wallet,
      path: "/finance/spend",
      color: "from-purple-600 to-purple-700",
    },
    {
      title: "Cash Flow Actuals",
      description: "View real-time cash position",
      icon: TrendingUp,
      path: "/finance/cashflow/actuals",
      color: "from-teal-600 to-teal-700",
    },
    {
      title: "P&L Statement",
      description: "Profit & Loss reporting",
      icon: FileText,
      path: "/finance/financial-reporting/profit-loss",
      color: "from-rose-600 to-rose-700",
    },
    {
      title: "Cash Forecasting",
      description: "AI-powered predictions",
      icon: BarChart3,
      path: "/finance/cashflow/forecasting",
      color: "from-indigo-600 to-indigo-700",
    },
    {
      title: "Balance Sheet",
      description: "Assets & Liabilities",
      icon: Building2,
      path: "/finance/financial-reporting/balance-sheet",
      color: "from-cyan-600 to-cyan-700",
    },
  ];

  const recentActivities = [
    {
      type: "Invoice",
      description: "INV-2025-0045 created for Tata Motors",
      time: "2 hours ago",
      icon: Receipt,
    },
    {
      type: "Payment",
      description: "Payment received ₹5.2L from Siemens",
      time: "4 hours ago",
      icon: DollarSign,
    },
    {
      type: "Report",
      description: "Monthly P&L generated",
      time: "1 day ago",
      icon: FileText,
    },
    {
      type: "Budget",
      description: "Q1 budget approved",
      time: "2 days ago",
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <h1
          className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
          style={{ fontFamily: "Poppins" }}
        >
          Finance Dashboard
        </h1>
        <p className="text-[#033F99] mt-2 font-medium text-lg">
          Your complete financial overview at a glance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl hover:shadow-2xl hover:border-[#033F99] transition-all duration-300"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-10 rounded-full -mr-16 -mt-16`}
              ></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-3 bg-gradient-to-br ${kpi.color} rounded-2xl shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${kpi.trend === "up"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
                  {kpi.title}
                </p>
                <p className="text-3xl font-black text-[#033F99]">
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#033F99] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#033F99]/50 shadow-lg hover:shadow-2xl hover:border-[#033F99] transition-all duration-300 text-left"
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:opacity-10 transition-opacity`}
                ></div>
                <div
                  className={`p-3 bg-gradient-to-br ${action.color} rounded-xl shadow-lg inline-block mb-4`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#033F99] mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-[#033F99]/70 font-medium">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#033F99]">
            Recent Activities
          </h2>
          <button className="text-[#033F99] font-semibold hover:underline">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id || `${activity.type}-${activity.time}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#C4D9F4]/30 hover:bg-[#C4D9F4]/50 transition-all cursor-pointer"
              >
                <div className="p-2 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-lg">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#033F99]">
                    {activity.type}
                  </p>
                  <p className="text-sm text-[#033F99]/70 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[#033F99]/50 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
