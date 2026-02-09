import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Building2,
  Wallet,
  DollarSign,
  Shield,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
} from "lucide-react";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IBCapitalDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ib-capital/dashboard`, {
        headers: { Authorization: `Bearer ${authService.getToken()}` },
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount?.toLocaleString("en-IN") || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63]"></div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const covenantStatus = dashboardData?.covenant_status || {};

  const modules = [
    {
      id: "ownership",
      name: "Ownership",
      description: "Cap table & shareholder registry",
      icon: PieChart,
      color: "from-blue-500 to-blue-600",
      path: "/ib-capital/ownership",
      stats: [
        { label: "Shareholders", value: summary.total_shareholders || 0 },
      ],
    },
    {
      id: "equity",
      name: "Equity",
      description: "Funding rounds & instruments",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      path: "/ib-capital/equity",
      stats: [
        {
          label: "Equity Value",
          value: formatCurrency(summary.total_equity_value),
        },
      ],
    },
    {
      id: "debt",
      name: "Debt",
      description: "Loans, notes & covenants",
      icon: Building2,
      color: "from-orange-500 to-orange-600",
      path: "/ib-capital/debt",
      stats: [
        {
          label: "Outstanding",
          value: formatCurrency(summary.total_debt_outstanding),
        },
      ],
    },
    {
      id: "treasury",
      name: "Treasury",
      description: "Cash & liquidity management",
      icon: Wallet,
      color: "from-purple-500 to-purple-600",
      path: "/ib-capital/treasury",
      stats: [
        {
          label: "Cash Position",
          value: formatCurrency(summary.total_cash_position),
        },
      ],
    },
    {
      id: "returns",
      name: "Returns",
      description: "Dividends, interest & buybacks",
      icon: DollarSign,
      color: "from-teal-500 to-teal-600",
      path: "/ib-capital/returns",
      stats: [
        {
          label: "Net Capital",
          value: formatCurrency(summary.net_capital_position),
        },
      ],
    },
    {
      id: "governance",
      name: "Governance",
      description: "Authority & investor controls",
      icon: Shield,
      color: "from-red-500 to-red-600",
      path: "/ib-capital/governance",
      stats: [{ label: "Pending", value: summary.pending_approvals || 0 }],
    },
    {
      id: "esop",
      name: "ESOP",
      description: "Employee stock option plans",
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      path: "/ib-capital/esop",
      stats: [{ label: "Manage", value: "Vesting" }],
    },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="ib-capital-dashboard"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A4E63] to-[#0557C2] flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IB Capital</h1>
            <p className="text-gray-500">
              Ownership, Funding & Capital Governance Engine
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#033F99]" />
            </div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              Stable
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.total_equity_value)}
          </p>
          <p className="text-sm text-gray-500">Total Equity Value</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-500 text-sm font-medium">
              {summary.active_debt_instruments} instruments
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.total_debt_outstanding)}
          </p>
          <p className="text-sm text-gray-500">Debt Outstanding</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              Healthy
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.total_cash_position)}
          </p>
          <p className="text-sm text-gray-500">Cash Position</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.net_capital_position)}
          </p>
          <p className="text-sm text-gray-500">Net Capital Position</p>
        </div>
      </div>

      {/* Module Cards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Capital Modules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.id}
              to={module.path}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              data-testid={`capital-module-${module.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-[#3A4E63] transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {module.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{module.description}</p>
              <div className="flex items-center gap-4">
                {module.stats.map((stat, idx) => (
                  <div key={idx}>
                    <p className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Covenant Status & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Covenant Health */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#3A4E63]" />
            Covenant Health
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {covenantStatus.compliant || 0}
              </p>
              <p className="text-xs text-gray-500">Compliant</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                {covenantStatus.warning || 0}
              </p>
              <p className="text-xs text-gray-500">Warning</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {covenantStatus.breach || 0}
              </p>
              <p className="text-xs text-gray-500">Breach</p>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3A4E63]" />
            Pending Approvals
          </h3>
          {dashboardData?.pending_approvals?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.pending_approvals.map((approval) => (
                <div
                  key={approval.approval_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {approval.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested by {approval.requested_by}
                    </p>
                  </div>
                  <Link
                    to={`/ib-capital/governance/approvals/${approval.approval_id}`}
                    className="px-3 py-1 bg-[#3A4E63] text-white text-xs rounded-lg hover:bg-[#022B6B]"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No pending approvals</p>
          )}
        </div>
      </div>

      {/* Recent Funding Rounds */}
      <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3A4E63]" />
            Recent Funding Rounds
          </h3>
          <Link
            to="/ib-capital/equity"
            className="text-sm text-[#3A4E63] hover:underline"
          >
            View All
          </Link>
        </div>
        {dashboardData?.recent_rounds?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Round
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Pre-Money
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Target
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Raised
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_rounds.map((round) => (
                  <tr
                    key={round.round_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {round.round_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatCurrency(round.pre_money_valuation)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatCurrency(round.target_amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatCurrency(round.raised_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          round.status === "closed"
                            ? "bg-green-100 text-green-700"
                            : round.status === "open"
                              ? "bg-blue-100 text-blue-700"
                              : round.status === "planned"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {round.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No funding rounds</p>
        )}
      </div>
    </div>
  );
};

export default IBCapitalDashboard;
