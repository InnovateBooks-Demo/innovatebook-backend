import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EvaluateList = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchEvaluations();
  }, [statusFilter]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/evaluate${params}`,
      );
      setEvaluations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch evaluations:", error);
      toast.error("Failed to load evaluations");
      setLoading(false);
    }
  };

  const handleDelete = async (evaluationId) => {
    if (!window.confirm("Are you sure you want to delete this evaluation?"))
      return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/commerce/evaluate/${evaluationId}`,
      );
      toast.success("Evaluation deleted successfully");
      fetchEvaluations();
    } catch (error) {
      console.error("Failed to delete evaluation:", error);
      toast.error("Failed to delete evaluation");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      "In Review": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertTriangle,
      },
      Approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
      Deferred: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig["Draft"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getGradeBadge = (grade) => {
    const gradeConfig = {
      A: { bg: "bg-emerald-100", text: "text-emerald-700" },
      B: { bg: "bg-blue-100", text: "text-blue-700" },
      C: { bg: "bg-amber-100", text: "text-amber-700" },
      D: { bg: "bg-red-100", text: "text-red-700" },
    };

    const config = gradeConfig[grade] || gradeConfig["C"];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded text-sm font-bold ${config.bg} ${config.text}`}
      >
        {grade}
      </span>
    );
  };

  // Filter and search
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.opportunity_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      evaluation.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvaluations = filteredEvaluations.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Evaluations
          </h2>
          <p className="text-slate-600 mt-1">
            Assess deals for operational feasibility and financial viability
          </p>
        </div>
        <Link to="/commerce/evaluate/new">
          <Button className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]">
            <Plus className="h-4 w-4" />
            Create Evaluation
          </Button>
        </Link>
      </div>

      {/* Filters & Actions */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by opportunity name or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#033F99]"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="In Review">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Deferred">Deferred</option>
          </select>

          {/* Action Buttons */}
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total",
            value: evaluations.length,
            color: "text-slate-900",
            icon: TrendingUp,
          },
          {
            label: "Draft",
            value: evaluations.filter((e) => e.evaluation_status === "Draft")
              .length,
            color: "text-slate-600",
            icon: Clock,
          },
          {
            label: "In Review",
            value: evaluations.filter(
              (e) => e.evaluation_status === "In Review",
            ).length,
            color: "text-[#0147CC]",
            icon: AlertTriangle,
          },
          {
            label: "Approved",
            value: evaluations.filter((e) => e.evaluation_status === "Approved")
              .length,
            color: "text-emerald-600",
            icon: CheckCircle,
          },
          {
            label: "Rejected",
            value: evaluations.filter((e) => e.evaluation_status === "Rejected")
              .length,
            color: "text-red-600",
            icon: XCircle,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={`item-${index}`}
              className="p-4 bg-white border-slate-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    Eval ID <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Opportunity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Lead ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Deal Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Margin %
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-5 h-5 border-2 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
                      Loading evaluations...
                    </div>
                  </td>
                </tr>
              ) : currentEvaluations.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No evaluations found. Create your first evaluation to get
                    started!
                  </td>
                </tr>
              ) : (
                currentEvaluations.map((evaluation) => (
                  <tr
                    key={evaluation.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/commerce/evaluate/${evaluation.evaluation_id}`}
                        className="text-sm font-medium text-[#033F99] hover:text-[#033F99]"
                      >
                        {evaluation.evaluation_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {evaluation.opportunity_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {evaluation.opportunity_type}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {evaluation.linked_lead_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          ₹
                          {(evaluation.expected_deal_value / 100000).toFixed(1)}
                          L
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${evaluation.gross_margin_percent >= 30
                            ? "text-emerald-600"
                            : evaluation.gross_margin_percent >= 15
                              ? "text-[#0147CC]"
                              : "text-amber-600"
                          }`}
                      >
                        {evaluation.gross_margin_percent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getGradeBadge(evaluation.deal_grade)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(evaluation.evaluation_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/commerce/evaluate/${evaluation.evaluation_id}`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          to={`/commerce/evaluate/${evaluation.evaluation_id}/edit`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(evaluation.evaluation_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredEvaluations.length)} of{" "}
              {filteredEvaluations.length} evaluations
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1,
                ).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EvaluateList;
