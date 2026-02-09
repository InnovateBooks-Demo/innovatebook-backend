import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  ArrowLeft,
  Edit2,
  Download,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SpendDetail = () => {
  const { expenseId } = useParams();
  const [spend, setSpend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpendDetails();
  }, [expenseId]);

  const fetchSpendDetails = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/spend/${expenseId}`,
      );
      setSpend(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load expense details");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/commerce/spend/${expenseId}/status`,
        null,
        { params: { status: newStatus } },
      );
      toast.success(`Expense status updated to ${newStatus}`);
      fetchSpendDetails();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      Submitted: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      Approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Paid: { bg: "bg-purple-100", text: "text-purple-700", icon: DollarSign },
      Rejected: { bg: "bg-red-100", text: "text-red-700", icon: Clock },
    };
    const badgeConfig = config[status] || config["Draft"];
    const Icon = badgeConfig.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${badgeConfig.bg} ${badgeConfig.text}`}
      >
        <Icon className="h-4 w-4" />
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-3 border-[#3A4E63] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!spend)
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Expense Not Found
          </h3>
          <Link to="/commerce/spend">
            <Button variant="outline">Back to Expenses</Button>
          </Link>
        </Card>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/spend">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              Expense {spend.expense_id}
            </h2>
            <p className="text-slate-600 mt-1">
              Expense details and approval workflow
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(spend.expense_status)}
          <Link to={`/commerce/spend/${expenseId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button className="gap-2 bg-gradient-to-r from-[#3A4E63] to-[#3A4E63]700">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-l-4 border-[#3A4E63]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Expense Amount</p>
            <DollarSign className="h-5 w-5 text-[#3A4E63]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(spend.expense_amount / 1000).toFixed(1)}K
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Tax Amount</p>
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(spend.tax_amount / 1000).toFixed(1)}K
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Net Expense</p>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(spend.net_expense / 1000).toFixed(1)}K
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-[#3A4E63]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Type</p>
            <FileText className="h-5 w-5 text-[#0147CC]" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            {spend.expense_type}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#3A4E63]" />
            Employee Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Employee ID</p>
              <p className="text-base font-medium text-slate-900">
                {spend.employee_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Department</p>
              <p className="text-base font-medium text-slate-900">
                {spend.department || "N/A"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#3A4E63]" />
            Expense Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Expense Date</p>
              <p className="text-base font-medium text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {spend.expense_date
                  ? new Date(spend.expense_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Description</p>
              <p className="text-base font-medium text-slate-900">
                {spend.description || "No description"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {spend.expense_status === "Draft" && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <Button
            onClick={() => handleStatusUpdate("Submitted")}
            className="bg-gradient-to-r from-[#3A4E63] to-[#3A4E63]700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        </Card>
      )}
      {spend.expense_status === "Submitted" && (
        <Card className="p-6 bg-emerald-50 border-emerald-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex gap-3">
            <Button
              onClick={() => handleStatusUpdate("Approved")}
              className="bg-gradient-to-r from-[#3A4E63] to-[#3A4E63]700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("Rejected")}
            >
              Reject
            </Button>
          </div>
        </Card>
      )}
      {spend.expense_status === "Approved" && (
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <Button
            onClick={() => handleStatusUpdate("Paid")}
            className="bg-gradient-to-r from-purple-600 to-purple-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Mark as Paid
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SpendDetail;
