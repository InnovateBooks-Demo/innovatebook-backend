import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  FileCheck,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RevenueDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    evaluations: [],
    commits: [],
    contracts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [evalRes, commitRes, contractRes] = await Promise.all([
        fetch(`${API_URL}/api/commerce/modules/revenue/evaluations`, {
          headers,
        }),
        fetch(`${API_URL}/api/commerce/modules/revenue/commits`, { headers }),
        fetch(`${API_URL}/api/commerce/modules/revenue/contracts`, { headers }),
      ]);

      const [evaluations, commits, contracts] = await Promise.all([
        evalRes.json(),
        commitRes.json(),
        contractRes.json(),
      ]);

      setStats({
        evaluations: evaluations.evaluations || [],
        commits: commits.commits || [],
        contracts: contracts.contracts || [],
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = stats.contracts.reduce(
    (sum, c) => sum + (c.contract_value || c.value || 0),
    0,
  );
  const activeContracts = stats.contracts.filter(
    (c) => c.status === "active",
  ).length;
  const pendingCommits = stats.commits.filter(
    (c) => c.status === "pending" || c.status === "in_progress",
  ).length;

  const quickStats = [
    {
      label: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      icon: DollarSign,
      color: "emerald",
      change: "+18%",
      trend: "up",
    },
    {
      label: "Active Contracts",
      value: activeContracts,
      icon: FileCheck,
      color: "blue",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Evaluations",
      value: stats.evaluations.length,
      icon: Target,
      color: "purple",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Pending Commits",
      value: pendingCommits,
      icon: TrendingUp,
      color: "amber",
      change: "-5%",
      trend: "down",
    },
  ];

  const modules = [
    {
      name: "Evaluations",
      count: stats.evaluations.length,
      desc: "Lead evaluations",
      path: "/commerce/revenue/evaluations",
      icon: Target,
      color: "purple",
    },
    {
      name: "Commits",
      count: stats.commits.length,
      desc: "Sales proposals",
      path: "/commerce/revenue/commits",
      icon: Users,
      color: "blue",
    },
    {
      name: "Contracts",
      count: stats.contracts.length,
      desc: "Customer contracts",
      path: "/commerce/revenue/contracts",
      icon: FileCheck,
      color: "emerald",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#033F99]"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="revenue-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Revenue Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sales pipeline and contract performance
          </p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`h-12 w-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}
                >
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((module, idx) => (
            <div
              key={idx}
              onClick={() => navigate(module.path)}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#033F99]/30 transition-all cursor-pointer group"
            >
              <div
                className={`h-12 w-12 rounded-lg bg-${module.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <module.icon className={`h-6 w-6 text-${module.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {module.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{module.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {module.count}
                </span>
                <span className="text-sm text-[#033F99] font-medium group-hover:underline">
                  View all →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Pipeline Summary
              </h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                {
                  stage: "Evaluation",
                  count: stats.evaluations.length,
                  color: "purple",
                },
                {
                  stage: "Proposal",
                  count: stats.commits.length,
                  color: "blue",
                },
                {
                  stage: "Contract",
                  count: stats.contracts.length,
                  color: "emerald",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full bg-${item.color}-500`}
                  ></div>
                  <span className="flex-1 text-sm text-gray-700">
                    {item.stage}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Contracts
              </h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.contracts.slice(0, 4).map((contract, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#033F99] to-[#0550c8] flex items-center justify-center text-white text-xs font-semibold">
                    {contract.contract_name?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {contract.contract_name || contract.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contract.customer_name || "Customer"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">
                    ₹
                    {(
                      (contract.contract_value || contract.value || 0) / 1000
                    ).toFixed(0)}
                    K
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
