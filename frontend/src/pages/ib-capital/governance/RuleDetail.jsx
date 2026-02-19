import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RuleDetail = () => {
  const { rule_id } = useParams();
  const navigate = useNavigate();
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchRule();
  }, [rule_id]);

  const fetchRule = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/governance/rules`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      const data = await response.json();
      const foundRule = data.rules?.find((r) => r.rule_id === rule_id);
      setRule(foundRule);
      setFormData(foundRule || {});
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/governance/rules/${rule_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rule_name: formData.rule_name,
            rule_type: formData.rule_type,
            applies_to: formData.applies_to,
            condition_expression: formData.condition_expression,
            enforcement_action: formData.enforcement_action,
            required_role: formData.required_role,
          }),
        },
      );
      if (response.ok) {
        setEditing(false);
        fetchRule();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this rule?"))
      return;

    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/governance/rules/${rule_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      if (response.ok) {
        navigate("/ib-capital/governance");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Rule not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="rule-detail">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/governance"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Governance
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${rule.is_active
                  ? "bg-gradient-to-br from-green-500 to-green-600"
                  : "bg-gradient-to-br from-gray-400 to-gray-500"
                }`}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {rule.rule_name}
              </h1>
              <p className="text-gray-500">Rule ID: {rule.rule_id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Deactivate
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(rule);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${rule.is_active
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-gray-100 text-gray-700 border-gray-200"
          }`}
      >
        {rule.is_active ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <AlertTriangle className="w-6 h-6" />
        )}
        <div>
          <p className="font-semibold">
            Status: {rule.is_active ? "Active" : "Inactive"}
          </p>
          <p className="text-sm">
            {rule.is_active
              ? "This rule is currently being enforced"
              : "This rule has been deactivated"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Configuration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rule Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Rule Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.rule_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rule_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                />
              ) : (
                <p className="font-medium text-gray-900">{rule.rule_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Rule Type
              </label>
              {editing ? (
                <select
                  value={formData.rule_type || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rule_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                >
                  <option value="approval">Approval</option>
                  <option value="restriction">Restriction</option>
                  <option value="notification">Notification</option>
                </select>
              ) : (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${rule.rule_type === "approval"
                      ? "bg-blue-100 text-blue-700"
                      : rule.rule_type === "restriction"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                >
                  {rule.rule_type}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Applies To
              </label>
              {editing ? (
                <select
                  value={formData.applies_to || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, applies_to: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                >
                  <option value="equity">Equity</option>
                  <option value="debt">Debt</option>
                  <option value="treasury">Treasury</option>
                  <option value="returns">Returns</option>
                  <option value="all">All</option>
                </select>
              ) : (
                <p className="font-medium text-gray-900 capitalize">
                  {rule.applies_to}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Required Role
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.required_role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, required_role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                />
              ) : (
                <p className="font-medium text-gray-900 capitalize">
                  {rule.required_role}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rule Logic */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rule Logic
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Condition Expression
              </label>
              {editing ? (
                <textarea
                  value={formData.condition_expression || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition_expression: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] font-mono text-sm"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-3">
                  <code className="text-sm text-gray-700">
                    {rule.condition_expression}
                  </code>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Enforcement Action
              </label>
              {editing ? (
                <select
                  value={formData.enforcement_action || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enforcement_action: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                >
                  <option value="require_approval">Require Approval</option>
                  <option value="block">Block</option>
                  <option value="warn">Warn</option>
                  <option value="notify">Notify</option>
                </select>
              ) : (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${rule.enforcement_action === "require_approval"
                      ? "bg-yellow-100 text-yellow-700"
                      : rule.enforcement_action === "block"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >
                  {rule.enforcement_action?.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Rule ID</p>
            <p className="font-medium text-gray-900 font-mono">
              {rule.rule_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium text-gray-900">
              {rule.created_at
                ? new Date(rule.created_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-2 py-1 text-xs rounded-full ${rule.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              {rule.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-900">
              {rule.updated_at
                ? new Date(rule.updated_at).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleDetail;
