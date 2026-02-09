import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import axios from "axios";
import { getAuthHeaders } from "../utils/auth";
import {
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Send,
  CheckCheck,
  Eye,
} from "lucide-react";

const AdjustmentEntryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(
        `${backendUrl}/api/adjustment-entries/${id}`,
        {
          headers: getAuthHeaders(),
        },
      );
      setEntry(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load entry:", error);
      setLoading(false);
    }
  };

  const handleMoveToReview = async () => {
    if (!window.confirm("Move this entry to Review status?")) {
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      await axios.put(
        `${backendUrl}/api/adjustment-entries/${id}/review`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );
      alert("Entry moved to Review successfully");
      loadEntry();
    } catch (error) {
      console.error("Failed to move to review:", error);
      alert(error.response?.data?.detail || "Failed to move entry to review");
    }
  };

  const handleApprove = async () => {
    if (
      !window.confirm(
        "Approve and post this entry to journal? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      await axios.put(
        `${backendUrl}/api/adjustment-entries/${id}/approve`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );
      alert("Entry approved and posted to journal successfully");
      loadEntry();
    } catch (error) {
      console.error("Failed to approve entry:", error);
      alert(error.response?.data?.detail || "Failed to approve entry");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm("Are you sure you want to delete this adjustment entry?")
    ) {
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      await axios.delete(`${backendUrl}/api/adjustment-entries/${id}`, {
        headers: getAuthHeaders(),
      });
      alert("Entry deleted successfully");
      navigate("/adjustment-entries");
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert(error.response?.data?.detail || "Failed to delete entry");
    }
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${config.color}`}
      >
        <Icon className="h-4 w-4" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63] mx-auto"></div>
          <p
            className="text-gray-600 mt-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Loading entry...
          </p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p
            className="text-gray-600 text-lg"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Entry not found
          </p>
          <Button
            onClick={() => navigate("/adjustment-entries")}
            className="mt-4 bg-[#3A4E63] hover:bg-[#022b6b] text-white"
          >
            Back to Entries
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate("/adjustment-entries")}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Adjustment Entries
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {entry.entry_number}
            </h1>
            <p
              className="text-gray-600 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {entry.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(entry.status)}
            {/* Workflow Actions */}
            {entry.status === "Draft" && (
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    navigate(`/adjustment-entries/edit/${entry.id}`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleMoveToReview}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Move to Review
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
            {entry.status === "Review" && (
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Approve & Post
              </Button>
            )}
            {entry.status === "Approved" && entry.journal_entry_id && (
              <Button
                onClick={() =>
                  navigate(`/journal-entries/${entry.journal_entry_id}`)
                }
                className="bg-[#3A4E63] hover:bg-[#022b6b] text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Journal Entry
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Entry Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span
              className="text-sm text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Entry Date
            </span>
          </div>
          <p
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {formatDate(entry.entry_date)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-gray-500" />
            <span
              className="text-sm text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Created By
            </span>
          </div>
          <p
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {entry.created_by?.substring(0, 8)}...
          </p>
          <p
            className="text-xs text-gray-500 mt-1"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {formatDateTime(entry.created_at)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span
              className="text-sm text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Total Amount
            </span>
          </div>
          <p
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {formatCurrency(entry.total_debit)}
          </p>
        </Card>
      </div>

      {/* Line Items */}
      <Card className="p-6 mb-6">
        <h2
          className="text-xl font-semibold text-gray-900 mb-6"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Journal Line Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Account
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
                  Debit
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-semibold text-gray-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Credit
                </th>
              </tr>
            </thead>
            <tbody>
              {entry.line_items.map((item) => (
                <tr
                  key={
                    item.line_item_id ||
                    `${item.account}-${item.debit}-${item.credit}`
                  }
                  className="border-b border-gray-100"
                >
                  <td className="py-4 px-4">
                    <span
                      className="font-medium text-gray-900"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.account}
                    </span>
                  </td>
                  <td
                    className="py-4 px-4 text-gray-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.description}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`font-semibold ${item.debit > 0 ? "text-green-700" : "text-gray-400"}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`font-semibold ${item.credit > 0 ? "text-red-700" : "text-gray-400"}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td
                  colSpan="2"
                  className="py-4 px-4 text-right font-semibold text-gray-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Totals:
                </td>
                <td
                  className="py-4 px-4 text-right font-bold text-green-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {formatCurrency(entry.total_debit)}
                </td>
                <td
                  className="py-4 px-4 text-right font-bold text-red-700"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {formatCurrency(entry.total_credit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Notes */}
      {entry.notes && (
        <Card className="p-6 mb-6">
          <h2
            className="text-xl font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Notes
          </h2>
          <p
            className="text-gray-700"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {entry.notes}
          </p>
        </Card>
      )}

      {/* Workflow History */}
      <Card className="p-6">
        <h2
          className="text-xl font-semibold text-gray-900 mb-6"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Workflow History
        </h2>
        <div className="space-y-4">
          {/* Created */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p
                className="font-medium text-gray-900"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Entry Created
              </p>
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {formatDateTime(entry.created_at)}
              </p>
              <p
                className="text-xs text-gray-500"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                By: {entry.created_by?.substring(0, 8)}...
              </p>
            </div>
          </div>

          {/* Reviewed */}
          {entry.reviewed_at && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p
                  className="font-medium text-gray-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Moved to Review
                </p>
                <p
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {formatDateTime(entry.reviewed_at)}
                </p>
                <p
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  By: {entry.reviewed_by?.substring(0, 8)}...
                </p>
              </div>
            </div>
          )}

          {/* Approved */}
          {entry.approved_at && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p
                  className="font-medium text-gray-900"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Approved & Posted to Journal
                </p>
                <p
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {formatDateTime(entry.approved_at)}
                </p>
                <p
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  By: {entry.approved_by?.substring(0, 8)}...
                </p>
                {entry.journal_entry_id && (
                  <p
                    className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline"
                    style={{ fontFamily: "Inter, sans-serif" }}
                    onClick={() =>
                      navigate(`/journal-entries/${entry.journal_entry_id}`)
                    }
                  >
                    View Journal Entry →
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdjustmentEntryDetail;
