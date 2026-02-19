import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Edit,
  ArrowRight,
  FileText,
  Building2,
  DollarSign,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureRequestDetail = () => {
  const { request_id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [request_id]);

  const fetchRequest = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/requests/${request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setRequest(data.request);
    } catch (error) {
      toast.error("Failed to fetch request");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForEvaluation = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/requests/${request_id}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Request submitted for evaluation");
        navigate(
          `/commerce/procure-workflow/evaluations/${data.evaluation_id}`,
        );
      } else {
        toast.error(data.detail || "Failed to submit");
      }
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-blue-100 text-blue-700";
      case "submitted":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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
  if (!request)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Request not found</p>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="procure-request-detail"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/procure-workflow/requests")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Back to Requests</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-[#033F99]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {request.title}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {request.request_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {request.status === "draft" && (
                <>
                  <button
                    onClick={handleSubmitForEvaluation}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Submit for Evaluation
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/commerce/procure-workflow/requests/${request_id}/edit`,
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </>
              )}
              {request.status === "submitted" && request.evaluation_id && (
                <button
                  onClick={() =>
                    navigate(
                      `/commerce/procure-workflow/evaluations/${request.evaluation_id}`,
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  View Evaluation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Request Details
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Description / Business Justification
                  </p>
                  <p className="text-gray-900">{request.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Request Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {request.request_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Priority</p>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityColor(request.priority)}`}
                    >
                      {request.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Needed By</p>
                    <p className="font-medium text-gray-900">
                      {request.needed_by_date || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requestor Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Requestor Information
                  </h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Department</p>
                  <p className="font-medium text-gray-900">
                    {request.requesting_department}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cost Center</p>
                  <p className="font-medium text-gray-900">
                    {request.cost_center}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Code</p>
                  <p className="font-medium text-gray-900">
                    {request.project_code || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Notes</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {request.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Spend Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Estimated Spend
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(request.estimated_cost || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recurring</p>
                  <p className="font-medium text-gray-900">
                    {request.is_recurring ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Status</h2>
              </div>
              <div className="p-6">
                <span
                  className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(request.status)}`}
                >
                  {request.status}
                </span>
                <p className="text-sm text-gray-500 mt-4">
                  {request.status === "draft" &&
                    "Request is in draft. Submit for evaluation when ready."}
                  {request.status === "submitted" &&
                    "Request submitted for vendor selection and cost evaluation."}
                  {request.status === "cancelled" &&
                    "Request has been cancelled."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcureRequestDetail;
