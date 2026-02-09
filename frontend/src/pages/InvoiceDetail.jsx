import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X,
} from "lucide-react";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadInvoiceDetails();
  }, [id]);

  const loadInvoiceDetails = async () => {
    try {
      const response = await invoiceAPI.getDetails(id);
      setData(response.data);
      const inv = response.data.invoice;
      setEditForm({
        invoice_number: inv.invoice_number,
        customer_name: inv.customer_name,
        invoice_date: inv.invoice_date.split("T")[0],
        due_date: inv.due_date.split("T")[0],
        base_amount: inv.base_amount,
        gst_percent: inv.gst_percent,
        tds_percent: inv.tds_percent || 0,
        amount_received: inv.amount_received || 0,
        status: inv.status,
      });
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load invoice details");
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const gst_amount = editForm.base_amount * (editForm.gst_percent / 100);
      const tds_amount = editForm.base_amount * (editForm.tds_percent / 100);
      const total_amount = editForm.base_amount + gst_amount;
      const amount_receivable = total_amount - tds_amount;

      await invoiceAPI.update(id, {
        ...editForm,
        gst_amount,
        tds_amount,
        total_amount,
        amount_outstanding: amount_receivable - editForm.amount_received,
      });

      toast.success("Invoice updated successfully");
      setIsEditing(false);
      loadInvoiceDetails();
    } catch (error) {
      toast.error("Failed to update invoice");
    }
  };

  const formatCurrency = (amount) =>
    `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const invoice = data?.invoice;
  const daysOverdue = data?.days_overdue || 0;
  const bucket = data?.bucket;
  const dso = data?.dso || 0;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #EEF4FF 0%, #ffffff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/invoices")}
            className="mb-4 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>

          <div className="flex items-start justify-between bg-white rounded-2xl p-6 shadow-md">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "#EEF4FF" }}
                >
                  <FileText className="h-6 w-6" style={{ color: "#3A4E63" }} />
                </div>
                <div>
                  <h1
                    className="text-4xl font-bold"
                    style={{ fontFamily: "Poppins", color: "#3A4E63" }}
                  >
                    {invoice?.invoice_number}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mt-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {invoice?.customer_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(invoice?.invoice_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span
                className={`px-6 py-3 rounded-full font-semibold text-lg ${
                  invoice?.status === "Paid"
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : invoice?.status === "Partially Paid"
                      ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                      : invoice?.status === "Overdue"
                        ? "bg-red-100 text-red-700 border-2 border-red-300"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-300"
                }`}
              >
                {invoice?.status}
              </span>
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    style={{ backgroundColor: "#3A4E63" }}
                    className="h-12 px-6"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Invoice
                  </Button>
                  <Button
                    variant="outline"
                    style={{ borderColor: "#3A4E63", color: "#3A4E63" }}
                    className="h-12 px-6"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSaveEdit}
                    style={{ backgroundColor: "#10b981" }}
                    className="h-12 px-6"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      loadInvoiceDetails();
                    }}
                    variant="outline"
                    className="h-12 px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Alert Banner for Overdue */}
        {daysOverdue > 0 && (
          <Card className="mb-6 border-l-4 border-red-500 bg-red-50 shadow-md">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-red-900 text-lg">
                    Payment Overdue - Immediate Action Required
                  </p>
                  <p className="text-sm text-red-700">
                    This invoice is <strong>{daysOverdue} days</strong> overdue.
                    Please follow up with the customer immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className="border-t-4 shadow-lg hover:shadow-xl transition-shadow"
            style={{ borderTopColor: "#3A4E63" }}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  Total Invoice Amount
                </p>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "#EEF4FF" }}
                >
                  <DollarSign
                    className="h-5 w-5"
                    style={{ color: "#3A4E63" }}
                  />
                </div>
              </div>
              <p
                className="text-3xl font-bold mb-1"
                style={{ color: "#3A4E63" }}
              >
                {formatCurrency(invoice?.total_amount)}
              </p>
              <p className="text-xs text-gray-500">Invoice Total</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  Amount Received
                </p>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(invoice?.amount_received)}
              </p>
              <p className="text-xs text-gray-500">Paid to date</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  Outstanding Balance
                </p>
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-600 mb-1">
                {formatCurrency(invoice?.amount_outstanding)}
              </p>
              <p className="text-xs text-gray-500">Remaining balance</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600 font-medium">DSO (Days)</p>
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-1">{dso}</p>
              <p className="text-xs text-gray-500">Days Sales Outstanding</p>
            </CardContent>
          </Card>
        </div>

        {/* Edit Mode Form */}
        {isEditing && (
          <Card
            className="mb-8 shadow-lg border-2"
            style={{ borderColor: "#3A4E63" }}
          >
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle
                className="flex items-center gap-2"
                style={{ color: "#3A4E63" }}
              >
                <Edit className="h-5 w-5" />
                Edit Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input
                    value={editForm.invoice_number || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        invoice_number: e.target.value,
                      })
                    }
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    value={editForm.customer_name || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        customer_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={editForm.status || "Unpaid"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={editForm.invoice_date || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, invoice_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editForm.due_date || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, due_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Amount (₹)</Label>
                  <Input
                    type="number"
                    value={editForm.base_amount || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        base_amount: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>GST Percentage (%)</Label>
                  <Input
                    type="number"
                    value={editForm.gst_percent || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        gst_percent: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>TDS Percentage (%)</Label>
                  <Input
                    type="number"
                    value={editForm.tds_percent || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        tds_percent: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount Received (₹)</Label>
                  <Input
                    type="number"
                    value={editForm.amount_received || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        amount_received: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Invoice Details Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Invoice Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b-2 border-gray-100 hover:bg-gray-50 px-3 rounded transition-colors">
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#3A4E63" }}
                    ></div>
                    Base Amount
                  </span>
                  <span className="font-bold text-lg">
                    {formatCurrency(invoice?.base_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-gray-100 hover:bg-gray-50 px-3 rounded transition-colors">
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    GST ({invoice?.gst_percent}%)
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    + {formatCurrency(invoice?.gst_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-4 text-blue-700 text-white px-4 rounded-lg shadow-md">
                  <span className="font-bold text-lg">
                    Total Invoice Amount
                  </span>
                  <span className="font-bold text-2xl">
                    {formatCurrency(invoice?.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-gray-100 hover:bg-gray-50 px-3 rounded transition-colors">
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    TDS Deduction ({invoice?.tds_percent}%)
                  </span>
                  <span className="font-bold text-lg text-red-600">
                    - {formatCurrency(invoice?.tds_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 rounded-lg shadow-md">
                  <span className="font-bold text-lg">Net Receivable</span>
                  <span className="font-bold text-2xl">
                    {formatCurrency(
                      invoice?.total_amount - (invoice?.tds_amount || 0),
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b-2 border-gray-100 hover:bg-gray-50 px-3 rounded transition-colors">
                  <span className="text-gray-700 font-medium">
                    Invoice Date
                  </span>
                  <span className="font-semibold">
                    {formatDate(invoice?.invoice_date)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-gray-100 hover:bg-gray-50 px-3 rounded transition-colors">
                  <span className="text-gray-700 font-medium">Due Date</span>
                  <span className="font-semibold">
                    {formatDate(invoice?.due_date)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-gray-100 hover:bg-gray-50 px-3 rounded transition-colors">
                  <span className="text-gray-700 font-medium">
                    Payment Terms
                  </span>
                  <span className="font-semibold">Net 30 Days</span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-gray-100 hover:bg-gray-50 px-3 rounded transition-colors">
                  <span className="text-gray-700 font-medium">
                    Aging Bucket
                  </span>
                  <span
                    className={`font-bold px-4 py-1 rounded-full ${
                      bucket === "Current"
                        ? "bg-green-100 text-green-700"
                        : bucket === "1-30 Days"
                          ? "bg-yellow-100 text-yellow-700"
                          : bucket === "31-60 Days"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {bucket}
                  </span>
                </div>
                <div className="flex justify-between py-4 bg-green-100 px-4 rounded-lg">
                  <span className="text-gray-900 font-bold">Amount Paid</span>
                  <span className="font-bold text-2xl text-green-600">
                    {formatCurrency(invoice?.amount_received)}
                  </span>
                </div>
                <div className="flex justify-between py-4 bg-red-100 px-4 rounded-lg">
                  <span className="text-gray-900 font-bold">Balance Due</span>
                  <span className="font-bold text-2xl text-red-600">
                    {formatCurrency(invoice?.amount_outstanding)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.activities && data.activities.length > 0 ? (
              <div className="space-y-4">
                {data.activities.map((activity) => (
                  <div
                    key={
                      activity.activity_id ||
                      `${activity.activity_type}-${activity.created_at}`
                    }
                    className="flex gap-4 border-l-4 pl-6 py-4 hover:bg-gray-50 transition-colors rounded-r-lg"
                    style={{ borderLeftColor: "#3A4E63" }}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "#EEF4FF" }}
                    >
                      <Clock className="h-6 w-6" style={{ color: "#3A4E63" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="font-bold text-lg"
                          style={{ color: "#3A4E63" }}
                        >
                          {activity.activity_type}
                        </p>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{activity.comment}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <User className="h-3 w-3" />
                        By: {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">
                  No activity recorded yet
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Activities will appear here as they occur
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDetail;
