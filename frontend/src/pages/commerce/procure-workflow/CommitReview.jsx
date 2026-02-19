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
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureCommitReview = () => {
  const { commit_id } = useParams();
  const navigate = useNavigate();
  const [commit, setCommit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommit();
  }, [commit_id]);

  const fetchCommit = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/procure/commits/${commit_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setCommit(data.commit);
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
        `${API_URL}/api/commerce/workflow/procure/commits/${commit_id}/approve?approver_role=${encodeURIComponent(role)}`,
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
        `${API_URL}/api/commerce/workflow/procure/commits/${commit_id}/reject?approver_role=${encodeURIComponent(role)}&reason=${encodeURIComponent(reason)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Commit rejected");
        navigate(
          `/commerce/procure-workflow/evaluations/${commit.evaluation_id}`,
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
        `${API_URL}/api/commerce/workflow/procure/commits/${commit_id}/create-contract`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Contract created");
        navigate(`/commerce/procure-workflow/contracts/${data.contract_id}`);
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

  const isApproved = commit.status === "approved";
  const isPending = commit.status === "pending_approval";
  const isRejected = commit.status === "rejected";

  // Get pending approvals
  const approvedRoles = (commit.approvals || [])
    .filter((a) => a.action === "approved")
    .map((a) => a.role);
  const pendingApprovers = (commit.approvers || []).filter(
    (a) => !approvedRoles.includes(a.role),
  );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="procure-commit-review"
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
            <span className="text-sm text-gray-500">
              Procurement Workflow → Commit
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${isApproved ? "bg-green-100" : isPending ? "bg-yellow-100" : "bg-red-100"}`}
              >
                <Gavel
                  className={`h-7 w-7 ${isApproved ? "text-green-600" : isPending ? "text-yellow-600" : "text-red-600"}`}
                />
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
            {isApproved && !commit.contract_id && (
              <button
                onClick={handleCreateContract}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4" />
                Create Contract
              </button>
            )}
            {isApproved && commit.contract_id && (
              <button
                onClick={() =>
                  navigate(
                    `/commerce/procure-workflow/contracts/${commit.contract_id}`,
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
              >
                <ArrowRight className="h-4 w-4" />
                View Contract
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Approval Status */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Approval Status
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {(commit.approvers || []).length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <span className="text-green-700 font-medium">
                      Auto-approved - No additional approvals required
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(commit.approvers || []).map((approver, index) => {
                      const approval = (commit.approvals || []).find(
                        (a) => a.role === approver.role,
                      );
                      const isApprovedByRole = approval?.action === "approved";

                      return (
                        <div
                          key={approver.role}
                          className={`flex items-center justify-between p-4 rounded-lg ${isApprovedByRole ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
                        >
                          <div className="flex items-center gap-3">
                            {isApprovedByRole ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                              <Clock className="h-6 w-6 text-yellow-500" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {approver.role}
                              </p>
                              <p className="text-sm text-gray-500">
                                {approver.reason}
                              </p>
                              {isApprovedByRole && approval.approved_at && (
                                <p className="text-xs text-green-600 mt-1">
                                  Approved on{" "}
                                  {new Date(
                                    approval.approved_at,
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          {!isApprovedByRole && isPending && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(approver.role)}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Policy Flags */}
            {commit.policy_flags && commit.policy_flags.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">
                    Policy Flags Requiring Approval
                  </span>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {commit.policy_flags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rejection Info */}
            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Commit Rejected</span>
                </div>
                <p className="text-sm text-red-700">
                  {commit.rejection_reason}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Rejected by: {commit.rejected_by}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">Summary</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(commit.total_cost || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budget Variance</p>
                  <p
                    className={`text-lg font-semibold ${(commit.budget_variance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {(commit.budget_variance || 0) >= 0 ? "+" : ""}₹
                    {(commit.budget_variance || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Vendor Risk Score
                  </p>
                  <p
                    className={`text-lg font-semibold ${(commit.risk_score || 0) > 50 ? "text-red-600" : "text-green-600"}`}
                  >
                    {commit.risk_score || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Workflow Progress
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">
                      1. Procure Request
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">2. Evaluation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isApproved ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${isApproved ? "text-green-600" : "text-yellow-600"}`}
                    >
                      3. Commit (Current)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-300" />
                    <span className="text-sm text-gray-400">4. Contract</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-300" />
                    <span className="text-sm text-gray-400">5. Handoff</span>
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

export default ProcureCommitReview;
