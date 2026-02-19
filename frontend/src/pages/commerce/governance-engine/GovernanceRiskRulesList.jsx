import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Plus,
  ArrowLeft,
  Loader2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Shield,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernanceRiskRulesList = () => {
  const navigate = useNavigate();
  const [riskRules, setRiskRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchRiskRules();
  }, [typeFilter]);

  const fetchRiskRules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_URL}/api/commerce/governance-engine/risk-rules`;
      if (typeFilter) url += `?risk_type=${typeFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRiskRules(data.risk_rules || []);
    } catch (error) {
      toast.error("Failed to fetch risk rules");
    } finally {
      setLoading(false);
    }
  };

  const getRiskTypeIcon = (type) => {
    const icons = {
      country_risk: "🌍",
      credit_risk: "💳",
      exposure_risk: "📊",
      sanctions_risk: "⚠️",
      industry_risk: "🏭",
    };
    return icons[type] || "📋";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="governance-risk-rules-list"
    >
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/governance-engine")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Governance Engine → Risk Rules
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Risk Rules
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Risk thresholds and escalation rules
                </p>
              </div>
            </div>
            <Link
              to="/commerce/governance-engine/risk-rules/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Add Risk Rule
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Total Rules</p>
            <p className="text-2xl font-bold mt-1">{riskRules.length}</p>
          </div>
          <div className="bg-red-100 text-red-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Hard Blocks</p>
            <p className="text-2xl font-bold mt-1">
              {riskRules.filter((r) => r.enforcement_type === "HARD").length}
            </p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Soft Warnings</p>
            <p className="text-2xl font-bold mt-1">
              {riskRules.filter((r) => r.enforcement_type === "SOFT").length}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Active</p>
            <p className="text-2xl font-bold mt-1">
              {riskRules.filter((r) => r.active).length}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">All Risk Types</option>
              <option value="country_risk">Country Risk</option>
              <option value="credit_risk">Credit Risk</option>
              <option value="exposure_risk">Exposure Risk</option>
              <option value="sanctions_risk">Sanctions Risk</option>
              <option value="industry_risk">Industry Risk</option>
            </select>
          </div>
        </div>

        {/* Risk Rules Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Risk Rule
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Risk Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Threshold
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Enforcement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riskRules.map((rule) => (
                <tr
                  key={rule.risk_rule_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/commerce/governance-engine/risk-rules/${rule.risk_rule_id}`,
                    )
                  }
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {getRiskTypeIcon(rule.risk_type)}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {rule.rule_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rule.risk_rule_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">
                      {rule.risk_type?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${rule.threshold >= 70 ? "bg-red-500" : rule.threshold >= 40 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${rule.threshold}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {rule.threshold}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${rule.enforcement_type === "HARD" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {rule.enforcement_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">
                      {rule.action?.replace(/_/g, " ") || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {rule.active ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {riskRules.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Risk Rules
            </h3>
            <p className="text-gray-500 mb-4">
              Create risk rules to define thresholds and actions
            </p>
            <Link
              to="/commerce/governance-engine/risk-rules/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Add First Rule
            </Link>
          </div>
        )}

        {/* Risk Level Legend */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Risk Threshold Legend
          </h3>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Low Risk (0-39)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Medium Risk (40-69)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">High Risk (70+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceRiskRulesList;
