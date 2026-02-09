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
  Download,
  ChevronRight,
} from "lucide-react";

const InvoiceDetailPro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
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
        owner: inv.owner || "",
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
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600 text-sm">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  const invoice = data?.invoice;
  const daysOverdue = data?.days_overdue || 0;
  const bucket = data?.bucket;
  const dso = data?.dso || 0;

  // Calculate balance due (net receivable - amount received)
  const amount_receivable = invoice
    ? invoice.total_amount - (invoice.tds_amount || 0)
    : 0;
  const balance_due = invoice
    ? Math.max(0, amount_receivable - (invoice.amount_received || 0))
    : 0;

  const paymentProgress =
    amount_receivable > 0
      ? ((invoice?.amount_received || 0) / amount_receivable) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => navigate("/invoices")}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Invoices
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-semibold">
                {invoice?.invoice_number}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      loadInvoiceDetails();
                    }}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    style={{ backgroundColor: "#3A4E63", color: "white" }}
                    className="hover:opacity-90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: "#3A4E63" }}
              >
                <FileText className="h-8 w-8" />
              </div>

              {/* Title & Meta */}
              <div>
                <h1
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "Poppins" }}
                >
                  {invoice?.invoice_number}
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{invoice?.customer_name}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(invoice?.invoice_date)}</span>
                  </div>
                  {invoice?.owner && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600">
                        Owner: {invoice.owner}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                invoice?.status === "Paid"
                  ? "bg-green-50 text-green-700 border-2 border-green-200"
                  : invoice?.status === "Partially Paid"
                    ? "bg-yellow-50 text-yellow-700 border-2 border-yellow-200"
                    : invoice?.status === "Overdue"
                      ? "bg-red-50 text-red-700 border-2 border-red-200"
                      : "bg-gray-50 text-gray-700 border-2 border-gray-200"
              }`}
            >
              {invoice?.status}
            </span>
          </div>
        </div>

        {/* Overdue Alert - Only show for unpaid/partially paid invoices */}
        {daysOverdue > 0 && invoice?.status !== "Paid" && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">
                Payment Overdue
              </p>
              <p className="text-sm text-red-700 mt-0.5">
                This invoice is {daysOverdue} days overdue. Please follow up
                with the customer.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Invoice Amount
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#EEF4FF" }}
                >
                  <DollarSign
                    className="h-4 w-4"
                    style={{ color: "#3A4E63" }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(invoice?.total_amount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total amount</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Received
                </span>
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(invoice?.amount_received)}
              </p>
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${paymentProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(paymentProgress)}% paid
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Balance Due
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(balance_due)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Net Receivable - Paid
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">DSO</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{dso}</p>
              <p className="text-xs text-gray-500 mt-1">
                Days {bucket ? `• ${bucket}` : "• Paid"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex gap-8 px-6">
            {["details", "breakdown", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-[#033F99]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                style={
                  activeTab === tab
                    ? { borderColor: "#3A4E63", color: "#3A4E63" }
                    : {}
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-6">
            {isEditing ? (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Edit Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Invoice Number
                      </Label>
                      <Input
                        value={editForm.invoice_number || ""}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Customer Name
                      </Label>
                      <Input
                        value={editForm.customer_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customer_name: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Status
                      </Label>
                      <select
                        value={editForm.status || "Unpaid"}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Owner
                      </Label>
                      <Input
                        value={editForm.owner || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, owner: e.target.value })
                        }
                        className="mt-1"
                        placeholder="Enter owner name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Invoice Date
                      </Label>
                      <Input
                        type="date"
                        value={editForm.invoice_date || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            invoice_date: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Due Date
                      </Label>
                      <Input
                        type="date"
                        value={editForm.due_date || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, due_date: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Base Amount (₹)
                      </Label>
                      <Input
                        type="number"
                        value={editForm.base_amount || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            base_amount: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        GST (%)
                      </Label>
                      <Input
                        type="number"
                        value={editForm.gst_percent || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            gst_percent: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        TDS (%)
                      </Label>
                      <Input
                        type="number"
                        value={editForm.tds_percent || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tds_percent: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Amount Received (₹)
                      </Label>
                      <Input
                        type="number"
                        value={editForm.amount_received || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            amount_received: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50">
                    <CardTitle className="text-base font-semibold text-gray-900">
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Invoice Date
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(invoice?.invoice_date)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Due Date</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(invoice?.due_date)}
                        </span>
                      </div>
                      {invoice?.payment_date && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="text-sm text-gray-600">
                            Payment Date
                          </span>
                          <span className="text-sm font-semibold text-green-700">
                            {formatDate(invoice?.payment_date)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Payment Terms
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Net 30 Days
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm text-gray-600">
                          Aging Bucket
                        </span>
                        <span
                          className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                            !bucket
                              ? "bg-green-50 text-green-700"
                              : bucket === "Current"
                                ? "bg-[rgba(3,63,153,0.08)] text-blue-700"
                                : bucket === "0-30 Days"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : bucket === "31-60 Days"
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-red-50 text-red-700"
                          }`}
                        >
                          {bucket || "Paid"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50">
                    <CardTitle className="text-base font-semibold text-gray-900">
                      Payment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Payment Progress
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {Math.round(paymentProgress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${paymentProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                          Amount Paid
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(invoice?.amount_received)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                          Balance Due
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(balance_due)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "breakdown" && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-base font-semibold text-gray-900">
                Amount Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between py-3 text-base">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(invoice?.base_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-3 text-base border-t border-gray-100">
                  <span className="text-gray-600">
                    GST ({invoice?.gst_percent}%)
                  </span>
                  <span className="font-semibold text-green-600">
                    + {formatCurrency(invoice?.gst_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-4 text-lg border-t-2 border-gray-200">
                  <span className="font-bold text-gray-900">
                    Total Invoice Amount
                  </span>
                  <span className="font-bold" style={{ color: "#3A4E63" }}>
                    {formatCurrency(invoice?.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-3 text-base border-t border-gray-100">
                  <span className="text-gray-600">
                    TDS Deduction ({invoice?.tds_percent}%)
                  </span>
                  <span className="font-semibold text-red-600">
                    - {formatCurrency(invoice?.tds_amount)}
                  </span>
                </div>
                <div
                  className="flex justify-between py-4 text-lg border-t-2 border-gray-200 rounded-lg"
                  style={{ backgroundColor: "#EEF4FF" }}
                >
                  <span className="font-bold" style={{ color: "#3A4E63" }}>
                    Net Receivable
                  </span>
                  <span
                    className="font-bold text-2xl"
                    style={{ color: "#3A4E63" }}
                  >
                    {formatCurrency(
                      invoice?.total_amount - (invoice?.tds_amount || 0),
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-base font-semibold text-gray-900">
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {data?.activities && data.activities.length > 0 ? (
                <div className="space-y-4">
                  {data.activities.map((activity, index) => (
                    <div
                      key={`item-${index}`}
                      className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border-l-4"
                      style={{ borderLeftColor: "#3A4E63" }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#EEF4FF" }}
                      >
                        <Calendar
                          className="h-5 w-5"
                          style={{ color: "#3A4E63" }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">
                            {activity.activity_type}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {activity.comment}
                        </p>
                        <p className="text-xs text-gray-500">
                          By: {activity.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No activity yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Activity will be recorded here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailPro;
