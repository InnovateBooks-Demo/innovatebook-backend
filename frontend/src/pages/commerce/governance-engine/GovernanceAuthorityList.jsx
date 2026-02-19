import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  ArrowLeft,
  Loader2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Shield,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernanceAuthorityList = () => {
  const navigate = useNavigate();
  const [authorityRules, setAuthorityRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchAuthorityRules();
  }, [roleFilter]);

  const fetchAuthorityRules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_URL}/api/commerce/governance-engine/authority`;
      if (roleFilter) url += `?role_id=${roleFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAuthorityRules(data.authority_rules || []);
    } catch (error) {
      toast.error("Failed to fetch authority rules");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );

  // Group rules by role
  const rulesByRole = authorityRules.reduce((acc, rule) => {
    const role = rule.role_id || "Unknown";
    if (!acc[role]) acc[role] = [];
    acc[role].push(rule);
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="governance-authority-list"
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
              Governance Engine → Authority
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Authority Matrix
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Define who can approve what and up to what limit
                </p>
              </div>
            </div>
            <Link
              to="/commerce/governance-engine/authority/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Add Authority Rule
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Total Rules</p>
            <p className="text-2xl font-bold mt-1">{authorityRules.length}</p>
          </div>
          <div className="bg-green-100 text-green-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Active</p>
            <p className="text-2xl font-bold mt-1">
              {authorityRules.filter((r) => r.active).length}
            </p>
          </div>
          <div className="bg-blue-100 text-blue-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Revenue Rules</p>
            <p className="text-2xl font-bold mt-1">
              {
                authorityRules.filter(
                  (r) => r.scope === "revenue" || r.scope === "both",
                ).length
              }
            </p>
          </div>
          <div className="bg-purple-100 text-purple-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Procurement Rules</p>
            <p className="text-2xl font-bold mt-1">
              {
                authorityRules.filter(
                  (r) => r.scope === "procurement" || r.scope === "both",
                ).length
              }
            </p>
          </div>
        </div>

        {/* Authority Matrix by Role */}
        {Object.entries(rulesByRole).map(([role, rules]) => (
          <div
            key={role}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6"
          >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-medium text-gray-900 capitalize">
                {role.replace("_", " ")}
              </h2>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                {rules.length} rules
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <div
                  key={rule.authority_id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/commerce/governance-engine/authority/${rule.authority_id}`,
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${rule.active ? "bg-green-100" : "bg-gray-100"}`}
                    >
                      <DollarSign
                        className={`h-5 w-5 ${rule.active ? "text-green-600" : "text-gray-400"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {rule.action_type}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                          {rule.scope}
                        </span>
                        {rule.conditions && (
                          <span className="text-xs text-gray-500">
                            • {Object.keys(rule.conditions).length} condition(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Max Amount</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(rule.max_amount || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {rule.active ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {authorityRules.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Authority Rules
            </h3>
            <p className="text-gray-500 mb-4">
              Create authority rules to define approval limits
            </p>
            <Link
              to="/commerce/governance-engine/authority/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Add First Rule
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernanceAuthorityList;
