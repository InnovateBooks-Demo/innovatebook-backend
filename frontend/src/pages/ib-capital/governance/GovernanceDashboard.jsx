import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernanceDashboard = () => {
  const [rules, setRules] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [authorityMatrix, setAuthorityMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approvals");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, approvalsRes, matrixRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-capital/governance/rules`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
        fetch(`${API_URL}/api/ib-capital/governance/approvals`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
        fetch(`${API_URL}/api/ib-capital/governance/authority-matrix`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
      ]);
      setRules((await rulesRes.json()).rules || []);
      setApprovals((await approvalsRes.json()).approvals || []);
      setAuthorityMatrix((await matrixRes.json()).matrix || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  const pendingApprovals = approvals.filter((a) => a.decision === "pending");
  const activeRules = rules.filter((r) => r.is_active);

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="governance-dashboard"
    >
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Capital
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Governance</h1>
              <p className="text-gray-500">Authority & Investor Controls</p>
            </div>
          </div>
          <Link
            to="/ib-capital/governance/rules/create"
            className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pending Approvals</p>
          <p className="text-2xl font-bold text-yellow-600">
            {pendingApprovals.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Approvals</p>
          <p className="text-2xl font-bold text-gray-900">{approvals.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Rules</p>
          <p className="text-2xl font-bold text-green-600">
            {activeRules.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Rules</p>
          <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4">
          <div className="flex gap-6">
            {["approvals", "rules", "authority"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                    ? "border-[#033F99] text-[#033F99]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab === "approvals"
                  ? "Approval Queue"
                  : tab === "rules"
                    ? "Governance Rules"
                    : "Authority Matrix"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "approvals" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Action Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Requested By
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Decision
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr
                    key={approval.approval_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {approval.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {approval.action_type?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {approval.requested_by}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {approval.decision === "approved" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {approval.decision === "pending" && (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        {approval.decision === "rejected" && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${approval.decision === "approved"
                              ? "bg-green-100 text-green-700"
                              : approval.decision === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {approval.decision}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/ib-capital/governance/approvals/${approval.approval_id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg inline-block"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "rules" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Rule Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Applies To
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Enforcement
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr
                    key={rule.rule_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {rule.rule_name}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">
                      {rule.applies_to}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${rule.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {rule.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/ib-capital/governance/rules/${rule.rule_id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg inline-block"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "authority" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Threshold
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Required Approval
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {authorityMatrix.map((item) => (
                  <tr
                    key={item.action || item.threshold}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 capitalize">
                      {item.action?.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.threshold}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.required_approval}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${item.level === "unanimous"
                            ? "bg-red-100 text-red-700"
                            : item.level === "majority"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                      >
                        {item.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;
