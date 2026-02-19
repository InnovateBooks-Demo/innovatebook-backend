import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Target,
  User,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RiskDetail = () => {
  const { risk_id } = useParams();
  const navigate = useNavigate();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisk();
  }, [risk_id]);

  const fetchRisk = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/governance/risks/${risk_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setRisk(data.risk);
    } catch (error) {
      toast.error("Failed to fetch risk");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this risk?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/commerce/modules/governance/risks/${risk_id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Risk deleted successfully");
      navigate("/commerce/govern/risk");
    } catch (error) {
      toast.error("Failed to delete risk");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  if (!risk)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Risk not found</p>
        <button
          onClick={() => navigate("/commerce/govern/risk")}
          className="text-[#033F99] hover:underline"
        >
          Back to Risks
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="risk-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/govern/risk")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Back to Risks</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {risk.risk_name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{risk.risk_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(`/commerce/govern/risk/${risk_id}/edit`)
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
                  Risk Details
                </h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Risk Type
                  </p>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium capitalize">
                    {risk.risk_type}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Severity
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium capitalize ${getSeverityColor(risk.severity)}`}
                  >
                    {risk.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Probability
                  </p>
                  <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium capitalize">
                    {risk.probability}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Impact Area
                  </p>
                  <span className="inline-flex items-center text-gray-900">
                    <Target className="h-4 w-4 mr-2 text-gray-400" />
                    {risk.impact_area}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Risk Owner
                  </p>
                  <span className="inline-flex items-center text-gray-900">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {risk.owner || "Not assigned"}
                  </span>
                </div>
              </div>
              {risk.mitigation_strategy && (
                <div className="px-6 pb-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Mitigation Strategy
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {risk.mitigation_strategy}
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
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold capitalize ${risk.status === "open" ? "bg-yellow-100 text-yellow-700" : risk.status === "mitigated" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${risk.status === "open" ? "bg-yellow-500" : risk.status === "mitigated" ? "bg-green-500" : "bg-gray-500"}`}
                ></span>
                {risk.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDetail;
