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
  PlayCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ExecuteList = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/execute${params}`,
      );
      setExecutions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch executions:", error);
      toast.error("Failed to load executions");
      setLoading(false);
    }
  };

  const handleDelete = async (executionId) => {
    if (!window.confirm("Are you sure you want to delete this execution?"))
      return;

    try {
      await axios.delete(`${BACKEND_URL}/api/commerce/execute/${executionId}`);
      toast.success("Execution deleted successfully");
      fetchExecutions();
    } catch (error) {
      console.error("Failed to delete execution:", error);
      toast.error("Failed to delete execution");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Scheduled: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      "In Progress": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: PlayCircle,
      },
      Completed: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Verified: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: CheckCircle,
      },
      "On Hold": {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig["Scheduled"];
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

  const filteredExecutions = executions.filter((execution) => {
    const matchesSearch =
      execution.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.execution_id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      execution.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExecutions = filteredExecutions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredExecutions.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Executions
          </h2>
          <p className="text-slate-600 mt-1">
            Manage order execution and delivery tracking
          </p>
        </div>
        <Link to="/commerce/execute/new">
          <Button className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]">
            <Plus className="h-4 w-4" />
            Create Execution
          </Button>
        </Link>
      </div>

      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by execution ID, order ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#033F99]"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Verified">Verified</option>
            <option value="On Hold">On Hold</option>
          </select>

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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total",
            value: executions.length,
            color: "text-slate-900",
            icon: PlayCircle,
          },
          {
            label: "Scheduled",
            value: executions.filter((e) => e.execution_status === "Scheduled")
              .length,
            color: "text-slate-600",
            icon: Clock,
          },
          {
            label: "In Progress",
            value: executions.filter(
              (e) => e.execution_status === "In Progress",
            ).length,
            color: "text-[#0147CC]",
            icon: PlayCircle,
          },
          {
            label: "Completed",
            value: executions.filter((e) => e.execution_status === "Completed")
              .length,
            color: "text-emerald-600",
            icon: CheckCircle,
          },
          {
            label: "Verified",
            value: executions.filter((e) => e.execution_status === "Verified")
              .length,
            color: "text-purple-600",
            icon: CheckCircle,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    Exec ID <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Scheduled Date
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
                      Loading executions...
                    </div>
                  </td>
                </tr>
              ) : currentExecutions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No executions found. Create your first execution to get
                    started!
                  </td>
                </tr>
              ) : (
                currentExecutions.map((execution) => (
                  <tr
                    key={execution.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/commerce/execute/${execution.execution_id}`}
                        className="text-sm font-medium text-[#033F99] hover:text-[#033F99]"
                      >
                        {execution.execution_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {execution.order_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {execution.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {execution.execution_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {execution.scheduled_date}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(execution.execution_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/commerce/execute/${execution.execution_id}`}
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
                          to={`/commerce/execute/${execution.execution_id}/edit`}
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
                          onClick={() => handleDelete(execution.execution_id)}
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

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredExecutions.length)} of{" "}
              {filteredExecutions.length} executions
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

export default ExecuteList;
