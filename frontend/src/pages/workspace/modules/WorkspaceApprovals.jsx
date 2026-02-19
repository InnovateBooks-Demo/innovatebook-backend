import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  User,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Loader2,
  X,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkspaceApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_URL}/api/workspace/approvals?`;
      if (filter === "pending") url += "pending_for_me=true";
      else if (filter === "requested") url += "requested_by_me=true";
      else if (filter !== "all") url += `decision=${filter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setApprovals(data);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const makeDecision = async (decision) => {
    if (!selectedApproval) return;

    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/workspace/approvals/${selectedApproval.approval_id}/decide`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision,
            decision_reason: decisionReason,
          }),
        },
      );

      setShowDecisionModal(false);
      setSelectedApproval(null);
      setDecisionReason("");
      fetchApprovals();
    } catch (error) {
      console.error("Error making decision:", error);
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "deal_approval":
        return "💼";
      case "invoice_approval":
        return "📄";
      case "contract_acceptance":
        return "📝";
      case "expense_approval":
        return "💰";
      default:
        return "📋";
    }
  };

  const stats = {
    pending: approvals.filter((a) => a.decision === "pending").length,
    approved: approvals.filter((a) => a.decision === "approved").length,
    rejected: approvals.filter((a) => a.decision === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-500 text-sm">
            Review and manage approval requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.approved}
              </p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rejected}
              </p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: "pending", label: "Pending for Me" },
            { key: "requested", label: "Requested by Me" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
            { key: "all", label: "All" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${filter === tab.key
                ? "text-[#033F99] border-b-2 border-[#033F99]"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {approvals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No approvals found</p>
            </div>
          ) : (
            approvals.map((approval) => (
              <div
                key={approval.approval_id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {getTypeIcon(approval.approval_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {approval.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDecisionColor(approval.decision)}`}
                        >
                          {approval.decision}
                        </span>
                      </div>
                      {approval.description && (
                        <p className="text-sm text-gray-500 mb-2">
                          {approval.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(approval.created_at).toLocaleDateString()}
                        </span>
                        {approval.due_at && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <AlertTriangle className="h-3 w-3" />
                            Due:{" "}
                            {new Date(approval.due_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {approval.decision === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedApproval(approval);
                          setShowDecisionModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#033F99] text-white rounded-lg hover:bg-[#033F99] text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </button>
                    </div>
                  )}
                </div>
                {approval.decision !== "pending" &&
                  approval.decision_reason && (
                    <div className="mt-3 ml-12 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Decision Reason:</p>
                      <p className="text-sm text-gray-700">
                        {approval.decision_reason}
                      </p>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"> {/* RESPONSIVE CHANGE */}
          <div className="bg-white rounded-xl w-[95vw] sm:w-[90vw] md:w-[700px] max-w-full max-h-[85vh] overflow-y-auto"> {/* RESPONSIVE CHANGE */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Review Approval
                </h2>
                <button
                  onClick={() => setShowDecisionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedApproval.title}
                </h3>
                <p className="text-gray-600">{selectedApproval.description}</p>
              </div>

              {selectedApproval.context_snapshot && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Context Details
                  </h4>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(selectedApproval.context_snapshot, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decision Reason (Optional)
                </label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033F99]"
                  rows={3}
                  placeholder="Add a reason for your decision..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3"> {/* RESPONSIVE CHANGE */}
              <button
                onClick={() => makeDecision("rejected")}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <ThumbsDown className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={() => makeDecision("approved")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <ThumbsUp className="h-4 w-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceApprovals;
