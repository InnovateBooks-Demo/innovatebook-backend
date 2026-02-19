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
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CommitList = () => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCommits();
  }, [statusFilter]);

  const fetchCommits = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/commit${params}`,
      );
      setCommits(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch commits:", error);
      toast.error("Failed to load commitments");
      setLoading(false);
    }
  };

  const handleDelete = async (commitId) => {
    if (!window.confirm("Are you sure you want to delete this commitment?"))
      return;

    try {
      await axios.delete(`${BACKEND_URL}/api/commerce/commit/${commitId}`);
      toast.success("Commitment deleted successfully");
      fetchCommits();
    } catch (error) {
      console.error("Failed to delete commitment:", error);
      toast.error("Failed to delete commitment");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      "Under Negotiation": {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: AlertCircle,
      },
      "Final Review": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      Committed: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
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

  // Filter and search
  const filteredCommits = commits.filter((commit) => {
    const matchesSearch =
      commit.contract_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.commit_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.evaluation_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCommits = filteredCommits.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredCommits.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Commitments
          </h2>
          <p className="text-slate-600 mt-1">
            Manage contracts and finalize deal commitments
          </p>
        </div>
        <Link to="/commerce/commit/new">
          <Button className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]">
            <Plus className="h-4 w-4" />
            Create Commitment
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
              placeholder="Search by contract title or commit ID..."
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
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Executed">Executed</option>
            <option value="Cancelled">Cancelled</option>
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
            value: commits.length,
            color: "text-slate-900",
            icon: FileText,
          },
          {
            label: "Draft",
            value: commits.filter((c) => c.commit_status === "Draft").length,
            color: "text-slate-600",
            icon: Clock,
          },
          {
            label: "Review",
            value: commits.filter((c) => c.commit_status === "Under Review")
              .length,
            color: "text-amber-600",
            icon: AlertCircle,
          },
          {
            label: "Approved",
            value: commits.filter((c) => c.commit_status === "Approved").length,
            color: "text-[#0147CC]",
            icon: CheckCircle,
          },
          {
            label: "Executed",
            value: commits.filter((c) => c.commit_status === "Executed").length,
            color: "text-emerald-600",
            icon: CheckCircle,
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
                    Commit ID <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contract Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Evaluation ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contract Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Duration
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-5 h-5 border-2 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
                      Loading commitments...
                    </div>
                  </td>
                </tr>
              ) : currentCommits.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No commitments found. Create your first commitment to get
                    started!
                  </td>
                </tr>
              ) : (
                currentCommits.map((commit) => (
                  <tr
                    key={commit.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/commerce/commit/${commit.commit_id}`}
                        className="text-sm font-medium text-[#033F99] hover:text-[#033F99]"
                      >
                        {commit.commit_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {commit.contract_title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {commit.contract_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {commit.evaluation_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          ₹{(commit.contract_value / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {commit.effective_date && commit.expiry_date
                            ? `${Math.round((new Date(commit.expiry_date) - new Date(commit.effective_date)) / (1000 * 60 * 60 * 24 * 30))}M`
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(commit.commit_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/commerce/commit/${commit.commit_id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/commerce/commit/${commit.commit_id}/edit`}>
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
                          onClick={() => handleDelete(commit.commit_id)}
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
              {Math.min(indexOfLastItem, filteredCommits.length)} of{" "}
              {filteredCommits.length} commitments
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

export default CommitList;
