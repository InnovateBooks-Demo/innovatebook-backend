import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  ArrowLeft,
  FileText,
  Edit2,
  Download,
  Send,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  Package,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BillDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetails();
  }, [invoiceId]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/bills/${invoiceId}`,
      );
      setBill(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bill details:", error);
      toast.error("Failed to load bill details");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/commerce/bills/${invoiceId}/status`,
        { status: newStatus },
      );
      toast.success(`Bill status updated to ${newStatus}`);
      fetchBillDetails();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update bill status");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      Approved: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
      Issued: { bg: "bg-[#C4D9F4]", text: "text-[#033F99]", icon: Send },
      Paid: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Disputed: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
      Cancelled: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        icon: AlertCircle,
      },
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[#033F99]">
          <div className="w-6 h-6 border-3 border-[#033F99] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Loading bill details...</span>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Bill Not Found
          </h3>
          <p className="text-slate-600 mb-4">
            The requested bill could not be found.
          </p>
          <Link to="/commerce/bill">
            <Button variant="outline">Back to Bills</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/bill">
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
              Invoice {bill.invoice_id}
            </h2>
            <p className="text-slate-600 mt-1">
              Detailed bill information and status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(bill.invoice_status)}
          <Link to={`/commerce/bill/${invoiceId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99]">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-l-4 border-[#033F99]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Invoice Amount</p>
            <DollarSign className="h-5 w-5 text-[#033F99]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(bill.invoice_amount / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Tax Amount</p>
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(bill.tax_amount / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Net Amount</p>
            <CreditCard className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ₹{(bill.net_amount / 100000).toFixed(2)}L
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-[#033F99]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Payment Terms</p>
            <Clock className="h-5 w-5 text-[#0147CC]" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            {bill.payment_terms}
          </p>
        </Card>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-[#033F99]" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Customer Name</p>
              <p className="text-base font-medium text-slate-900">
                {bill.customer_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Customer ID</p>
              <p className="text-base font-medium text-slate-900">
                {bill.customer_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Customer Tax ID</p>
              <p className="text-base font-medium text-slate-900">
                {bill.customer_tax_id || "N/A"}
              </p>
            </div>
          </div>
        </Card>

        {/* Invoice Details */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#033F99]" />
            Invoice Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Invoice Date</p>
              <p className="text-base font-medium text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {new Date(bill.invoice_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Due Date</p>
              <p className="text-base font-medium text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {new Date(bill.due_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Execution ID</p>
              <p className="text-base font-medium text-slate-900">
                {bill.execution_id}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Actions */}
      {bill.invoice_status === "Draft" && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleStatusUpdate("Approved")}
              className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Invoice
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("Cancelled")}
            >
              Cancel Invoice
            </Button>
          </div>
        </Card>
      )}

      {bill.invoice_status === "Approved" && (
        <Card className="p-6 bg-[#EBF3FC] border-[#6B9FE6]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleStatusUpdate("Issued")}
              className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
            >
              <Send className="h-4 w-4 mr-2" />
              Issue Invoice
            </Button>
          </div>
        </Card>
      )}

      {bill.invoice_status === "Issued" && (
        <Card className="p-6 bg-emerald-50 border-emerald-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Status Actions
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleStatusUpdate("Paid")}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("Disputed")}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Mark as Disputed
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BillDetail;
