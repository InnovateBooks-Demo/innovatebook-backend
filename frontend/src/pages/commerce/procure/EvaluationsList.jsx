import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  MoreHorizontal,
  ClipboardCheck,
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProcureEvaluationsList = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/procurement/evaluations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setEvaluations(data.evaluations || []);
    } catch (error) {
      toast.error("Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluations = evaluations.filter((item) => {
    const matchSearch =
      !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-amber-50 text-amber-700 ring-amber-600/20",
        dot: "bg-amber-500",
      },
      in_progress: {
        color: "bg-blue-50 text-blue-700 ring-blue-600/20",
        dot: "bg-blue-500",
      },
      completed: {
        color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        dot: "bg-emerald-500",
      },
      approved: {
        color: "bg-green-50 text-green-700 ring-green-600/20",
        dot: "bg-green-500",
      },
      rejected: {
        color: "bg-red-50 text-red-700 ring-red-600/20",
        dot: "bg-red-500",
      },
    };
    return configs[status] || configs["pending"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading evaluations...</p>
        </div>
      </div>
    );
  }

  const avgScore =
    evaluations.length > 0
      ? Math.round(
        evaluations.reduce((sum, e) => sum + (e.score || 0), 0) /
        evaluations.length,
      )
      : 0;

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="procure-evaluations-list"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Vendor Evaluations
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Evaluate and compare vendor proposals for procurement
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => navigate("/commerce/procure/evaluate/create")}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm"
                data-testid="new-procure-evaluation-btn"
              >
                <Plus className="h-4 w-4" />
                New Evaluation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Evaluations
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {evaluations.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {evaluations.filter((e) => e.status === "in_progress").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-gray-500">Requires attention</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {evaluations.filter((e) => e.status === "completed").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-emerald-600 font-medium">100%</span>
              <span className="text-gray-500 ml-2">completion rate</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Score
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {avgScore}
                  <span className="text-lg text-gray-400">/100</span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-purple-600 font-medium">Good</span>
              <span className="text-gray-500 ml-2">quality vendors</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search evaluations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Evaluation
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Vendor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  PR Reference
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Score
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-sm font-medium text-gray-900">
                      No evaluations found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new evaluation.
                    </p>
                    <button
                      onClick={() =>
                        navigate("/commerce/procure/evaluate/create")
                      }
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
                    >
                      <Plus className="h-4 w-4" />
                      New Evaluation
                    </button>
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  return (
                    <tr
                      key={item.evaluation_id || item.eval_id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(
                          `/commerce/procure/evaluate/${item.evaluation_id || item.eval_id}`,
                        )
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#033F99] to-[#0550c8] flex items-center justify-center text-white font-semibold text-sm">
                            {item.name?.charAt(0) || "E"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {item.evaluation_id || item.eval_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {item.vendor_id || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 font-mono">
                          {item.pr_id || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-900">
                            {item.score || 0}
                          </span>
                          <span className="text-xs text-gray-400 ml-0.5">
                            /100
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusConfig.color}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                          ></span>
                          {item.status
                            ?.replace("_", " ")
                            .charAt(0)
                            .toUpperCase() +
                            item.status?.replace("_", " ").slice(1)}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              navigate(
                                `/commerce/procure/evaluate/${item.evaluation_id || item.eval_id}`,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/commerce/procure/evaluate/${item.evaluation_id || item.eval_id}/edit`,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="More"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredEvaluations.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredEvaluations.length}</span>{" "}
              of <span className="font-medium">{evaluations.length}</span>{" "}
              evaluations
            </p>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcureEvaluationsList;
