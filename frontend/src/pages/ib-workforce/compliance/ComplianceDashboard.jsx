import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();

      const [dashRes, docsRes, violRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-workforce/compliance/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-workforce/compliance/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-workforce/compliance/violations?status=open`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboardData(data.data || {});
      }
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.data || []);
      }
      if (violRes.ok) {
        const data = await violRes.json();
        setViolations(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.documents?.total || 0,
      icon: FileText,
      color: "text-[#033F99]",
    },
    {
      label: "Verified",
      value: dashboardData.documents?.verified || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      label: "Expiring Soon",
      value: dashboardData.documents?.expiring_soon || 0,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Open Violations",
      value: dashboardData.violations?.open || 0,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "expired":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="compliance-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Compliance Management
                </h1>
                <p className="text-sm text-gray-500">
                  Statutory, policy & workforce risk control
                </p>
              </div>
            </div>
            <button
              onClick={() => toast.info("Add document feature coming soon")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] transition-colors"
              data-testid="add-document-btn"
            >
              <Plus className="h-4 w-4" />
              Add Document
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              People Compliance Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-600">Compliant</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {dashboardData.people?.compliant || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Non-Compliant</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {dashboardData.people?.non_compliant || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Document Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verification Rate</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {dashboardData.documents?.total > 0
                    ? Math.round(
                        (dashboardData.documents?.verified /
                          dashboardData.documents?.total) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${dashboardData.documents?.total > 0 ? (dashboardData.documents?.verified / dashboardData.documents?.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Violations Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Critical</span>
                </div>
                <span className="text-sm font-semibold text-red-600">
                  {dashboardData.violations?.critical || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-gray-600">Open</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">
                  {dashboardData.violations?.open || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Compliance Documents
              </h3>
              <button className="text-sm text-[#3A4E63] hover:underline">
                View All
              </button>
            </div>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No compliance documents found. Add documents to track
                compliance.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {documents.slice(0, 10).map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.document_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doc.person_id} • Expires: {doc.expiry_date || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.verification_status)}`}
                    >
                      {doc.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Violations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Open Violations
              </h3>
              <button className="text-sm text-[#3A4E63] hover:underline">
                View All
              </button>
            </div>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : violations.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-2" />
                <p>No open violations. Great job!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {violations.map((viol, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          viol.severity === "critical"
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {viol.violation_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {viol.person_id} • {viol.detected_on?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(viol.severity)}`}
                    >
                      {viol.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
