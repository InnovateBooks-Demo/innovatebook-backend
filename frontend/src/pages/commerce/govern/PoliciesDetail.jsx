import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Shield,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PoliciesDetail = () => {
  const { policy_id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, [policy_id]);

  const fetchPolicy = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/governance/policies/${policy_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setPolicy(data.policy);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch policy");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/commerce/modules/governance/policies/${policy_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Policy deleted successfully");
      navigate("/commerce/govern/policies");
    } catch (error) {
      toast.error("Failed to delete policy");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "archived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <FileText className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Policy not found</p>
        <button
          onClick={() => navigate("/commerce/govern/policies")}
          className="text-[#3A4E63] hover:underline"
        >
          Back to Policies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="policies-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/govern/policies")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Back to Policies</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#3A4E63]/10 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-[#3A4E63]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {policy.policy_name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{policy.policy_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(`/commerce/govern/policies/${policy_id}/edit`)
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
                  Policy Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Policy Type
                    </p>
                    <span className="inline-flex items-center px-3 py-1 bg-[rgba(3,63,153,0.08)] text-blue-700 rounded-lg text-sm font-medium capitalize">
                      <Shield className="h-4 w-4 mr-2" />
                      {policy.policy_type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Approval Required
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${policy.approval_required ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {policy.approval_required ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Effective Date
                    </p>
                    <span className="inline-flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {policy.effective_date || "Not set"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Expiry Date
                    </p>
                    <span className="inline-flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {policy.expiry_date || "No expiry"}
                    </span>
                  </div>
                </div>
                {policy.description && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Description
                    </p>
                    <p className="text-gray-700">{policy.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Status</h2>
              </div>
              <div className="p-6">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(policy.status)}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${policy.status === "active" ? "bg-green-500" : policy.status === "draft" ? "bg-yellow-500" : "bg-gray-500"}`}
                  ></span>
                  {policy.status}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() =>
                    navigate(`/commerce/govern/policies/${policy_id}/edit`)
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 text-gray-400" />
                  Edit Policy
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesDetail;
