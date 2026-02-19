import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  GitCompare,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReconcileList = () => {
  const navigate = useNavigate();
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchReconciliations();
  }, [statusFilter]);

  const fetchReconciliations = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        statusFilter === "All"
          ? `${BACKEND_URL}/api/commerce/reconcile`
          : `${BACKEND_URL}/api/commerce/reconcile?status=${statusFilter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReconciliations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reconciliations:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (reconcileId) => {
    if (
      window.confirm("Are you sure you want to delete this reconciliation?")
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${BACKEND_URL}/api/commerce/reconcile/${reconcileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        fetchReconciliations();
      } catch (error) {
        console.error("Failed to delete reconciliation:", error);
        alert("Failed to delete reconciliation");
      }
    }
  };

  const filteredReconciliations = reconciliations.filter(
    (rec) =>
      rec.reconcile_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.reconcile_type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate stats
  const stats = {
    total: reconciliations.length,
    open: reconciliations.filter((r) => r.reconcile_status === "Open").length,
    matched: reconciliations.filter((r) => r.reconcile_status === "Matched")
      .length,
    partiallyMatched: reconciliations.filter(
      (r) => r.reconcile_status === "Partially Matched",
    ).length,
    closed: reconciliations.filter((r) => r.final_status === "Closed").length,
    avgScore:
      reconciliations.length > 0
        ? (
          reconciliations.reduce(
            (sum, r) => sum + r.reconciliation_score,
            0,
          ) / reconciliations.length
        ).toFixed(1)
        : 0,
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-slate-100 text-slate-700",
      Matched: "bg-emerald-100 text-emerald-700",
      "Partially Matched": "bg-amber-100 text-amber-700",
      Closed: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getMatchStatusColor = (status) => {
    const colors = {
      Matched: "text-emerald-600",
      Mismatch: "text-red-600",
      Pending: "text-amber-600",
    };
    return colors[status] || "text-slate-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Reconciliation & Matching
          </h1>
          <p className="text-slate-600 mt-1">
            Bank, vendor, and customer reconciliation
          </p>
        </div>
        <Button
          onClick={() => navigate("/commerce/reconcile/new")}
          className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Reconciliation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4] border-[#6B9FE6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#033F99]">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <GitCompare className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Open</p>
              <p className="text-2xl font-bold text-slate-900">{stats.open}</p>
            </div>
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Matched</p>
              <p className="text-2xl font-bold text-emerald-900">
                {stats.matched}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Partial</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.partiallyMatched}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0147CC]">Closed</p>
              <p className="text-2xl font-bold text-blue-900">{stats.closed}</p>
            </div>
            <Target className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Avg Score</p>
              <p className="text-2xl font-bold text-emerald-900">
                {stats.avgScore}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by reconciliation ID or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Matched">Matched</option>
            <option value="Partially Matched">Partially Matched</option>
            <option value="Closed">Closed</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Reconciliation Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Reconcile ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Internal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  External
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Match Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredReconciliations.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-[#033F99]">
                      {rec.reconcile_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">
                      {rec.reconcile_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(rec.period_start).toLocaleDateString()} -{" "}
                    {new Date(rec.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ₹{rec.amount_internal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ₹{rec.amount_external.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${rec.difference === 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      ₹{Math.abs(rec.difference).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${getMatchStatusColor(rec.match_status)}`}
                    >
                      {rec.match_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${rec.reconciliation_score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {rec.reconciliation_score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(rec.reconcile_status)}`}
                    >
                      {rec.reconcile_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/commerce/reconcile/${rec.reconcile_id}`)
                        }
                        className="text-[#033F99] hover:text-white"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/commerce/reconcile/${rec.reconcile_id}/edit`,
                          )
                        }
                        className="text-[#0147CC] hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.reconcile_id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReconciliations.length === 0 && (
          <div className="text-center py-12">
            <GitCompare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No reconciliations found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReconcileList;
