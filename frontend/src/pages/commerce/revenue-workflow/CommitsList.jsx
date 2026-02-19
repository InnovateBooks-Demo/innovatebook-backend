import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gavel,
  ArrowLeft,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RevenueCommitsList = () => {
  const navigate = useNavigate();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommits();
  }, []);

  const fetchCommits = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/commits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setCommits(data.commits || []);
    } catch (error) {
      toast.error("Failed to fetch commits");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending_approval: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="revenue-commits-list">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/revenue-workflow/evaluations")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Revenue Workflow → Commit
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Gavel className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Revenue Commits
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Stage 3 of Revenue Workflow - Approval decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Total</p>
            <p className="text-2xl font-bold mt-1">{commits.length}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Pending</p>
            <p className="text-2xl font-bold mt-1">
              {commits.filter((c) => c.status === "pending_approval").length}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Approved</p>
            <p className="text-2xl font-bold mt-1">
              {commits.filter((c) => c.status === "approved").length}
            </p>
          </div>
          <div className="bg-red-100 text-red-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Rejected</p>
            <p className="text-2xl font-bold mt-1">
              {commits.filter((c) => c.status === "rejected").length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Commit ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Evaluation
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Total Value
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commits.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No commits yet. Submit evaluations for approval to create
                    commits.
                  </td>
                </tr>
              ) : (
                commits.map((commit) => (
                  <tr
                    key={commit.commit_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/commerce/revenue-workflow/commits/${commit.commit_id}`,
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-[#033F99]">
                        {commit.commit_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {commit.evaluation_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{(commit.total_value || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(commit.status)}`}
                      >
                        {commit.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueCommitsList;
