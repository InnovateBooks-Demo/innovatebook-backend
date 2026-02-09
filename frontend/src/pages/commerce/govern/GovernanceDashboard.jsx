import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Gauge,
  Crown,
  AlertTriangle,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernanceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    policies: [],
    limits: [],
    authorities: [],
    risks: [],
    audits: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [policiesRes, limitsRes, authRes, risksRes, auditsRes] =
        await Promise.all([
          fetch(`${API_URL}/api/commerce/modules/governance/policies`, {
            headers,
          }),
          fetch(`${API_URL}/api/commerce/modules/governance/limits`, {
            headers,
          }),
          fetch(`${API_URL}/api/commerce/modules/governance/authority`, {
            headers,
          }),
          fetch(`${API_URL}/api/commerce/modules/governance/risks`, {
            headers,
          }),
          fetch(`${API_URL}/api/commerce/modules/governance/audits`, {
            headers,
          }),
        ]);

      const [policies, limits, authorities, risks, audits] = await Promise.all([
        policiesRes.json(),
        limitsRes.json(),
        authRes.json(),
        risksRes.json(),
        auditsRes.json(),
      ]);

      setStats({
        policies: policies.policies || [],
        limits: limits.limits || [],
        authorities: authorities.authorities || [],
        risks: risks.risks || [],
        audits: audits.audits || [],
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const activePolicies = stats.policies.filter(
    (p) => p.status === "active",
  ).length;
  const criticalRisks = stats.risks.filter(
    (r) => r.severity === "critical" || r.severity === "high",
  ).length;
  const pendingAudits = stats.audits.filter(
    (a) => a.status === "in_progress" || a.status === "planned",
  ).length;

  const quickStats = [
    {
      label: "Active Policies",
      value: activePolicies,
      icon: Shield,
      color: "blue",
      change: "+5%",
      trend: "up",
    },
    {
      label: "Critical Risks",
      value: criticalRisks,
      icon: AlertTriangle,
      color: "red",
      change: "-12%",
      trend: "down",
    },
    {
      label: "Pending Audits",
      value: pendingAudits,
      icon: ClipboardList,
      color: "amber",
      change: "+3%",
      trend: "up",
    },
    {
      label: "Authorities",
      value: stats.authorities.length,
      icon: Crown,
      color: "purple",
      change: "+8%",
      trend: "up",
    },
  ];

  const modules = [
    {
      name: "Policies",
      count: stats.policies.length,
      active: activePolicies,
      path: "/commerce/govern/policies",
      icon: Shield,
      color: "blue",
    },
    {
      name: "Limits",
      count: stats.limits.length,
      active: stats.limits.filter((l) => l.status === "active").length,
      path: "/commerce/govern/limits",
      icon: Gauge,
      color: "emerald",
    },
    {
      name: "Authority",
      count: stats.authorities.length,
      active: stats.authorities.filter((a) => a.status === "active").length,
      path: "/commerce/govern/authority",
      icon: Crown,
      color: "purple",
    },
    {
      name: "Risks",
      count: stats.risks.length,
      active: stats.risks.filter((r) => r.status === "open").length,
      path: "/commerce/govern/risk",
      icon: AlertTriangle,
      color: "red",
    },
    {
      name: "Audits",
      count: stats.audits.length,
      active: pendingAudits,
      path: "/commerce/govern/audit",
      icon: ClipboardList,
      color: "amber",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#3A4E63]"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="governance-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Governance Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Compliance, risk, and policy management
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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {modules.map((module, idx) => (
            <div
              key={idx}
              onClick={() => navigate(module.path)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#3A4E63]/30 transition-all cursor-pointer group"
            >
              <div
                className={`h-10 w-10 rounded-lg bg-${module.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <module.icon className={`h-5 w-5 text-${module.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {module.name}
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-gray-900">
                    {module.count}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active</span>
                  <span className="font-medium text-emerald-600">
                    {module.active}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-[#3A4E63] font-medium group-hover:underline">
                  View all →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.policies.slice(0, 3).map((policy, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-[#033F99]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {policy.policy_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {policy.policy_type || "Policy"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;
