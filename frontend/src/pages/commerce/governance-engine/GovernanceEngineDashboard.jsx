import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  FileText,
  Gauge,
  Users,
  AlertTriangle,
  History,
  Plus,
  ChevronRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernanceEngineDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [limits, setLimits] = useState([]);
  const [authorityRules, setAuthorityRules] = useState([]);
  const [riskRules, setRiskRules] = useState([]);
  const [policyStats, setPolicyStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [policiesRes, limitsRes, authorityRes, riskRes] = await Promise.all(
        [
          fetch(`${API_URL}/api/commerce/governance-engine/policies`, {
            headers,
          }),
          fetch(`${API_URL}/api/commerce/governance-engine/limits`, {
            headers,
          }),
          fetch(`${API_URL}/api/commerce/governance-engine/authority`, {
            headers,
          }),
          fetch(`${API_URL}/api/commerce/governance-engine/risk-rules`, {
            headers,
          }),
        ],
      );

      const [policiesData, limitsData, authorityData, riskData] =
        await Promise.all([
          policiesRes.json(),
          limitsRes.json(),
          authorityRes.json(),
          riskRes.json(),
        ]);

      if (policiesData.success) {
        setPolicies(policiesData.policies || []);
        setPolicyStats(policiesData.stats || {});
      }
      if (limitsData.success) setLimits(limitsData.limits || []);
      if (authorityData.success)
        setAuthorityRules(authorityData.authority_rules || []);
      if (riskData.success) setRiskRules(riskData.risk_rules || []);
    } catch (error) {
      toast.error("Failed to fetch governance data");
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: "policies",
      title: "Policies",
      description: "Rules that must never be violated",
      icon: FileText,
      color: "blue",
      count: policies.length,
      path: "/commerce/governance-engine/policies",
      stats: [
        { label: "Active", value: policyStats.active || 0 },
        { label: "Hard", value: policyStats.hard || 0 },
        { label: "Soft", value: policyStats.soft || 0 },
      ],
    },
    {
      id: "limits",
      title: "Limits",
      description: "Quantitative caps on risk & exposure",
      icon: Gauge,
      color: "purple",
      count: limits.length,
      path: "/commerce/governance-engine/limits",
      stats: [
        { label: "Total", value: limits.length },
        {
          label: "Near Breach",
          value: limits.filter((l) => l.utilization_percent > 80).length,
        },
      ],
    },
    {
      id: "authority",
      title: "Authority",
      description: "Who can approve what",
      icon: Users,
      color: "green",
      count: authorityRules.length,
      path: "/commerce/governance-engine/authority",
      stats: [
        { label: "Rules", value: authorityRules.length },
        {
          label: "Active",
          value: authorityRules.filter((r) => r.active).length,
        },
      ],
    },
    {
      id: "risk",
      title: "Risk Rules",
      description: "Risk thresholds and escalations",
      icon: AlertTriangle,
      color: "orange",
      count: riskRules.length,
      path: "/commerce/governance-engine/risk-rules",
      stats: [
        { label: "Rules", value: riskRules.length },
        {
          label: "Hard Blocks",
          value: riskRules.filter((r) => r.enforcement_type === "HARD").length,
        },
      ],
    },
  ];

  const getColorClasses = (color) =>
    ({
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: "text-[#033F99]",
        border: "border-[rgba(3,63,153,0.25)]",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: "text-purple-600",
        border: "border-purple-200",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "text-green-600",
        border: "border-green-200",
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: "text-orange-600",
        border: "border-orange-200",
      },
    })[color];

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="governance-engine-dashboard"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Governance Engine
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Commercial Constitution - Policies, Limits, Authority, Risk
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <Link
                to="/commerce/governance-engine/audit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <History className="h-4 w-4" />
                Audit Logs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Overview Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <Shield className="h-12 w-12 opacity-80" />
            <div>
              <h2 className="text-xl font-bold">Commercial Constitution</h2>
              <p className="text-amber-100 mt-1">
                Governance ensures every deal and spend follows rules, respects
                limits, routes through authority, and leaves an auditable trail.
              </p>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {modules.map((module) => {
            const colors = getColorClasses(module.color);
            return (
              <div
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}
                  >
                    <module.icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <span
                    className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm font-semibold`}
                  >
                    {module.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {module.description}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  {module.stats.map((stat, i) => (
                    <div key={i}>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="font-semibold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                  <div className="flex-1 flex justify-end">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Policies */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Active Policies
            </h2>
            <Link
              to="/commerce/governance-engine/policies"
              className="text-sm text-[#3A4E63] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {policies
              .filter((p) => p.active)
              .slice(0, 5)
              .map((policy) => (
                <div
                  key={policy.policy_id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${policy.enforcement_type === "HARD" ? "bg-red-100" : "bg-yellow-100"}`}
                    >
                      {policy.enforcement_type === "HARD" ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {policy.policy_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {policy.policy_type} • {policy.scope}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${policy.enforcement_type === "HARD" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {policy.enforcement_type}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Limits Utilization */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Limit Utilization
            </h2>
            <Link
              to="/commerce/governance-engine/limits"
              className="text-sm text-[#3A4E63] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {limits.slice(0, 4).map((limit) => {
                const utilization = limit.utilization_percent || 0;
                const isNearBreach = utilization > 80;
                const isBreach = utilization >= 100;

                return (
                  <div key={limit.limit_id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {limit.limit_name}
                      </span>
                      <span
                        className={`text-sm font-semibold ${isBreach ? "text-red-600" : isNearBreach ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {utilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${isBreach ? "bg-red-500" : isNearBreach ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>
                        ₹{(limit.current_usage || 0).toLocaleString()}
                      </span>
                      <span>
                        ₹{(limit.threshold_value || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceEngineDashboard;
