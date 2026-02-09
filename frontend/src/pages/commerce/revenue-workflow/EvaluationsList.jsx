import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowLeft,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RevenueEvaluationsList = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/workflow/revenue/evaluations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setEvaluations(data.evaluations || []);
    } catch (error) {
      toast.error("Failed to fetch evaluations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      in_progress: "bg-blue-100 text-blue-700",
      party_pending: "bg-yellow-100 text-yellow-700",
      ready_for_commit: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="revenue-evaluations-list"
    >
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
              Revenue Workflow → Evaluate
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Search className="h-7 w-7 text-[#033F99]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Revenue Evaluations
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Stage 2 of Revenue Workflow - Evaluate deals and verify party
                  readiness
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Total</p>
            <p className="text-2xl font-bold mt-1">{evaluations.length}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">In Progress</p>
            <p className="text-2xl font-bold mt-1">
              {evaluations.filter((e) => e.status === "in_progress").length}
            </p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Party Pending</p>
            <p className="text-2xl font-bold mt-1">
              {evaluations.filter((e) => e.status === "party_pending").length}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Ready for Commit</p>
            <p className="text-2xl font-bold mt-1">
              {
                evaluations.filter((e) => e.status === "ready_for_commit")
                  .length
              }
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Evaluation ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Lead
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Party
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Deal Value
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evaluations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No evaluations yet. Convert qualified leads to create
                    evaluations.
                  </td>
                </tr>
              ) : (
                evaluations.map((evaluation) => (
                  <tr
                    key={evaluation.evaluation_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/commerce/revenue-workflow/evaluations/${evaluation.evaluation_id}`,
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-[#3A4E63]">
                        {evaluation.evaluation_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {evaluation.lead_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {evaluation.party_id || "Not assigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{(evaluation.deal_value || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(evaluation.status)}`}
                      >
                        {evaluation.status?.replace("_", " ")}
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

export default RevenueEvaluationsList;
