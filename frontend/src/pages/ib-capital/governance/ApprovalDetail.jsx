import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileCheck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ApprovalDetail = () => {
  const { approval_id } = useParams();
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    fetchApproval();
  }, [approval_id]);

  const fetchApproval = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/governance/approvals/${approval_id}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      const data = await response.json();
      setApproval(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    setDeciding(true);
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/governance/approvals/${approval_id}/decide?decision=${decision}&decided_by=Current User`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        fetchApproval();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setDeciding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Approval not found</p>
      </div>
    );
  }

  const getDecisionIcon = () => {
    switch (approval.decision) {
      case "approved":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getDecisionColor = () => {
    switch (approval.decision) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="approval-detail">
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
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${approval.decision === "approved"
                  ? "bg-gradient-to-br from-green-500 to-green-600"
                  : approval.decision === "rejected"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-yellow-500 to-yellow-600"
                }`}
            >
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {approval.description}
              </h1>
              <p className="text-gray-500">
                Approval ID: {approval.approval_id}
              </p>
            </div>
          </div>
          {approval.decision === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleDecision("approved")}
                disabled={deciding}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => handleDecision("rejected")}
                disabled={deciding}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`mb-6 p-4 rounded-xl border ${getDecisionColor()} flex items-center gap-3`}
      >
        {getDecisionIcon()}
        <div>
          <p className="font-semibold capitalize">
            Status: {approval.decision}
          </p>
          {approval.decision === "pending" ? (
            <p className="text-sm">This request is awaiting a decision</p>
          ) : (
            <p className="text-sm">
              Decided by {approval.decided_by || "System"} on{" "}
              {approval.decision_date
                ? new Date(approval.decision_date).toLocaleDateString()
                : "N/A"}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Request Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Action Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {approval.action_type?.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested By</p>
                <p className="font-medium text-gray-900">
                  {approval.requested_by}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested Date</p>
                <p className="font-medium text-gray-900">
                  {approval.created_at
                    ? new Date(approval.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
            {approval.action_reference_id && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reference ID</p>
                  <p className="font-medium text-gray-900 font-mono">
                    {approval.action_reference_id}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decision Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Decision Details
          </h2>
          {approval.decision !== "pending" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${approval.decision === "approved"
                      ? "bg-green-100"
                      : "bg-red-100"
                    }`}
                >
                  {approval.decision === "approved" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decision</p>
                  <p
                    className={`font-medium capitalize ${approval.decision === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                      }`}
                  >
                    {approval.decision}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decided By</p>
                  <p className="font-medium text-gray-900">
                    {approval.decided_by || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decision Date</p>
                  <p className="font-medium text-gray-900">
                    {approval.decision_date
                      ? new Date(approval.decision_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              {approval.remarks && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium text-gray-900">
                      {approval.remarks}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-gray-500">Awaiting decision</p>
              <p className="text-sm text-gray-400 mt-1">
                Use the buttons above to approve or reject this request
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description Card */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Request Description
        </h2>
        <p className="text-gray-700 leading-relaxed">{approval.description}</p>
      </div>
    </div>
  );
};

export default ApprovalDetail;
