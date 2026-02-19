import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Gavel,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RevenueCommitReview = () => {
  const { commit_id } = useParams();
  const navigate = useNavigate();
  const [commit, setCommit] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommit();
  }, [commit_id]);

  const fetchCommit = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/commits/${commit_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setCommit(data.commit);
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      toast.error("Failed to fetch commit");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (role) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/commits/${commit_id}/approve?approver_role=${encodeURIComponent(role)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Approval recorded");
        fetchCommit();
      } else {
        toast.error(data.detail || "Failed to approve");
      }
    } catch (error) {
      toast.error("Error approving");
    }
  };

  const handleReject = async (role) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/commits/${commit_id}/reject?approver_role=${encodeURIComponent(role)}&reason=${encodeURIComponent(reason)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Commit rejected");
        navigate(
          `/commerce/revenue-workflow/evaluations/${commit.evaluation_id}`,
        );
      } else {
        toast.error(data.detail || "Failed to reject");
      }
    } catch (error) {
      toast.error("Error rejecting");
    }
  };

  const handleCreateContract = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/commits/${commit_id}/create-contract`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Contract created");
        navigate(`/commerce/revenue-workflow/contracts/${data.contract_id}`);
      } else {
        toast.error(data.detail || "Failed to create contract");
      }
    } catch (error) {
      toast.error("Error creating contract");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
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
  if (!commit)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Gavel className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Commit not found</p>
      </div>
    );

  const approvedRoles = (commit.approvals || [])
    .filter((a) => a.action === "approved")
    .map((a) => a.role);

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="revenue-commit-review"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/revenue-workflow/leads")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Revenue Workflow → Commit
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <Gavel className="h-7 w-7 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Commit Review
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(commit.status)}`}
                  >
                    {commit.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{commit.commit_id}</p>
              </div>
            </div>
            {commit.status === "approved" && (
              <button
                onClick={handleCreateContract}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4" />
                Create Contract
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Deal Summary (Read-Only)
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Party ID</p>
                    <p className="font-medium text-gray-900">
                      {commit.party_id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Deal Value</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{(commit.total_value || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gross Margin</p>
                    <p
                      className={`text-xl font-bold ${(commit.gross_margin_percent || 0) < 25 ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {commit.gross_margin_percent || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                    <p
                      className={`font-semibold ${(commit.risk_score || 0) > 50 ? "text-red-600" : "text-green-600"}`}
                    >
                      {commit.risk_score || 0}
                    </p>
                  </div>
                </div>

                {/* Policy Flags */}
                {commit.policy_flags && commit.policy_flags.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Policy Exceptions</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                      {commit.policy_flags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Matrix */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Approval Matrix
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {commit.approvers && commit.approvers.length > 0 ? (
                  <div className="space-y-4">
                    {commit.approvers.map((approver) => {
                      const isApproved = approvedRoles.includes(approver.role);
                      return (
                        <div
                          key={approver.role}
                          className={`p-4 rounded-lg border ${isApproved ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isApproved ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                              ) : (
                                <Clock className="h-6 w-6 text-yellow-500" />
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {approver.role}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {approver.reason}
                                </p>
                              </div>
                            </div>
                            {!isApproved &&
                              commit.status === "pending_approval" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprove(approver.role)}
                                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(approver.role)}
                                    className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            {isApproved && (
                              <span className="text-sm text-green-600 font-medium">
                                ✓ Approved
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900">
                      No Approval Required
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      This deal meets all governance policies
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Commit Status
                </h2>
              </div>
              <div className="p-6">
                <span
                  className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(commit.status)}`}
                >
                  {commit.status === "pending_approval" && (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  {commit.status === "approved" && (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {commit.status === "rejected" && (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {commit.status?.replace("_", " ")}
                </span>
                <p className="text-sm text-gray-500 mt-4">
                  {commit.status === "pending_approval" &&
                    "Waiting for all required approvals."}
                  {commit.status === "approved" &&
                    "All approvals received. Ready to create contract."}
                  {commit.status === "rejected" &&
                    `Rejected: ${commit.rejection_reason || "No reason provided"}`}
                </p>
              </div>
            </div>

            {/* Workflow Progress */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Workflow Progress
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      Lead ✓
                    </span>
                  </div>
                  <div className="ml-4 border-l-2 border-green-300 h-6"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      Evaluate ✓
                    </span>
                  </div>
                  <div className="ml-4 border-l-2 border-orange-300 h-6"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <Gavel className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-orange-600">
                      Commit (Current)
                    </span>
                  </div>
                  <div className="ml-4 border-l-2 border-gray-200 h-6"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">4</span>
                    </div>
                    <span className="text-sm text-gray-400">Contract</span>
                  </div>
                  <div className="ml-4 border-l-2 border-gray-200 h-6"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">5</span>
                    </div>
                    <span className="text-sm text-gray-400">Handoff</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCommitReview;
