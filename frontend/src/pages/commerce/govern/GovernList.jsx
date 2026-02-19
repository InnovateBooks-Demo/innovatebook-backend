import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Shield,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GovernList = () => {
  const navigate = useNavigate();
  const [governances, setGovernances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchGovernances();
  }, [statusFilter]);

  const fetchGovernances = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        statusFilter === "All"
          ? `${BACKEND_URL}/api/commerce/govern`
          : `${BACKEND_URL}/api/commerce/govern?status=${statusFilter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGovernances(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch governances:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (governId) => {
    if (
      window.confirm("Are you sure you want to delete this governance record?")
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_URL}/api/commerce/govern/${governId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchGovernances();
      } catch (error) {
        console.error("Failed to delete governance:", error);
        alert("Failed to delete governance record");
      }
    }
  };

  const filteredGovernances = governances.filter(
    (gov) =>
      gov.govern_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gov.sop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gov.sop_type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate stats
  const stats = {
    total: governances.length,
    draft: governances.filter((g) => g.sop_status === "Draft").length,
    active: governances.filter((g) => g.sop_status === "Active").length,
    underReview: governances.filter((g) => g.sop_status === "Under Review")
      .length,
    archived: governances.filter((g) => g.sop_status === "Archived").length,
    avgCompliance:
      governances.length > 0
        ? (
          governances.reduce((sum, g) => sum + g.sla_compliance_percent, 0) /
          governances.length
        ).toFixed(1)
        : 0,
  };

  const getStatusColor = (status) => {
    const colors = {
      Draft: "bg-slate-100 text-slate-700",
      Active: "bg-emerald-100 text-emerald-700",
      "Under Review": "bg-amber-100 text-amber-700",
      Archived: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getTypeColor = (type) => {
    const colors = {
      Process: "text-[#0147CC]",
      Policy: "text-purple-600",
      Control: "text-[#033F99]",
    };
    return colors[type] || "text-slate-600";
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
            Governance & SOP Management
          </h1>
          <p className="text-slate-600 mt-1">
            Process documentation and compliance tracking
          </p>
        </div>
        <Button
          onClick={() => navigate("/commerce/govern/new")}
          className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          New SOP
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
            <Shield className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Draft</p>
              <p className="text-2xl font-bold text-slate-900">{stats.draft}</p>
            </div>
            <Edit2 className="h-8 w-8 text-slate-400" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Active</p>
              <p className="text-2xl font-bold text-emerald-900">
                {stats.active}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Under Review</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.underReview}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0147CC]">Archived</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.archived}
              </p>
            </div>
            <Clock className="h-8 w-8 text-[#033F99]" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Avg SLA</p>
              <p className="text-2xl font-bold text-emerald-900">
                {stats.avgCompliance}%
              </p>
            </div>
            <Award className="h-8 w-8 text-emerald-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by ID, SOP name, or type..."
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
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Archived">Archived</option>
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

      {/* Governance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Govern ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  SOP Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  SLA Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Runs
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
              {filteredGovernances.map((gov) => (
                <tr key={gov.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-[#033F99]">
                      {gov.govern_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      {gov.sop_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${getTypeColor(gov.sop_type)}`}
                    >
                      {gov.sop_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {gov.sop_version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {gov.sop_owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${gov.sla_compliance_percent}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {gov.sla_compliance_percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">
                        {gov.total_runs}
                      </div>
                      <div className="text-xs text-slate-500">
                        {gov.successful_runs} success / {gov.failed_runs} failed
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(gov.sop_status)}`}
                    >
                      {gov.sop_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/commerce/govern/${gov.govern_id}`)
                        }
                        className="text-[#033F99] hover:text-white"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/commerce/govern/${gov.govern_id}/edit`)
                        }
                        className="text-[#0147CC] hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(gov.govern_id)}
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

        {filteredGovernances.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No governance records found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GovernList;
