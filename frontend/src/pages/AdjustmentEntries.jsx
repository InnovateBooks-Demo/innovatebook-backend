import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import axios from "axios";
import { getAuthHeaders } from "../utils/auth";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";

const AdjustmentEntries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadAdjustmentEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, statusFilter]);

  const loadAdjustmentEntries = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(`${backendUrl}/api/adjustment-entries`, {
        headers: getAuthHeaders(),
      });
      setEntries(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load adjustment entries:", error);
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((entry) => entry.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.entry_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          entry.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredEntries(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { color: "bg-gray-100 text-gray-800", icon: Edit },
      Review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.Draft;
    const Icon = config.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const handleViewEntry = (entryId) => {
    navigate(`/adjustment-entries/${entryId}`);
  };

  const handleDeleteEntry = async (entryId) => {
    if (
      !window.confirm("Are you sure you want to delete this adjustment entry?")
    ) {
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      await axios.delete(`${backendUrl}/api/adjustment-entries/${entryId}`, {
        headers: getAuthHeaders(),
      });
      loadAdjustmentEntries();
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert(
        error.response?.data?.detail || "Failed to delete adjustment entry",
      );
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Adjustment Entries
            </h1>
            <p
              className="text-gray-600 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Manage manual accounting adjustments with process flow
            </p>
          </div>
          <Button
            onClick={() => navigate("/adjustment-entries/create")}
            className="bg-[#3A4E63] hover:bg-[#022b6b] text-white"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Adjustment Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Review">Review</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Total Entries
              </p>
              <p
                className="text-2xl font-bold text-gray-900 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {entries.length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Draft
              </p>
              <p
                className="text-2xl font-bold text-gray-700 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {entries.filter((e) => e.status === "Draft").length}
              </p>
            </div>
            <Edit className="h-8 w-8 text-gray-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                In Review
              </p>
              <p
                className="text-2xl font-bold text-yellow-700 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {entries.filter((e) => e.status === "Review").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Approved
              </p>
              <p
                className="text-2xl font-bold text-green-700 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {entries.filter((e) => e.status === "Approved").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Entries Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63] mx-auto"></div>
            <p
              className="text-gray-600 mt-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Loading adjustment entries...
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p
              className="text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              No adjustment entries found
            </p>
            <Button
              onClick={() => navigate("/adjustment-entries/create")}
              className="mt-4 bg-[#3A4E63] hover:bg-[#022b6b] text-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Entry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Entry Number
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Entry Date
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Description
                  </th>
                  <th
                    className="text-right py-3 px-4 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Amount
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Status
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Created By
                  </th>
                  <th
                    className="text-center py-3 px-4 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <span
                        className="font-medium text-[#3A4E63]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {entry.entry_number}
                      </span>
                    </td>
                    <td
                      className="py-4 px-4 text-sm text-gray-600"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {formatDate(entry.entry_date)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p
                          className="text-sm text-gray-900 truncate"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {entry.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {formatCurrency(entry.total_debit)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td
                      className="py-4 px-4 text-sm text-gray-600"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {entry.created_by?.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handleViewEntry(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {entry.status === "Draft" && (
                          <>
                            <Button
                              onClick={() =>
                                navigate(`/adjustment-entries/edit/${entry.id}`)
                              }
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteEntry(entry.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdjustmentEntries;
