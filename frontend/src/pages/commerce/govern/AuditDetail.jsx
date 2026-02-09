import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuditDetail = () => {
  const { audit_id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudit();
  }, [audit_id]);

  const fetchAudit = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/governance/audits/${audit_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setAudit(data.audit);
    } catch (error) {
      toast.error("Failed to fetch audit");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this audit?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/commerce/modules/governance/audits/${audit_id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Audit deleted successfully");
      navigate("/commerce/govern/audit");
    } catch (error) {
      toast.error("Failed to delete audit");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "planned":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  if (!audit)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Audit not found</p>
        <button
          onClick={() => navigate("/commerce/govern/audit")}
          className="text-[#3A4E63] hover:underline"
        >
          Back to Audits
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="audit-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/govern/audit")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Back to Audits</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#3A4E63]/10 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-7 w-7 text-[#3A4E63]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {audit.audit_name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{audit.audit_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(`/commerce/govern/audit/${audit_id}/edit`)
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Audit Details
                </h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Audit Type
                  </p>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium capitalize">
                    {audit.audit_type}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Auditor
                  </p>
                  <span className="inline-flex items-center text-gray-900">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {audit.auditor || "Not assigned"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Scheduled Date
                  </p>
                  <span className="inline-flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {audit.scheduled_date || "Not set"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Completion Date
                  </p>
                  <span className="inline-flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {audit.completion_date || "Not completed"}
                  </span>
                </div>
              </div>
              {audit.scope && (
                <div className="px-6 pb-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Scope
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {audit.scope}
                  </p>
                </div>
              )}
              {audit.findings && (
                <div className="px-6 pb-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Findings
                  </p>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    {audit.findings}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Status</h2>
            </div>
            <div className="p-6">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(audit.status)}`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${audit.status === "completed" ? "bg-green-500" : audit.status === "in_progress" ? "bg-blue-500" : audit.status === "planned" ? "bg-yellow-500" : "bg-gray-500"}`}
                ></span>
                {audit.status?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDetail;
