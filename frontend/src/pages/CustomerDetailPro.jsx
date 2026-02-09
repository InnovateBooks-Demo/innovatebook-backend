import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerAPI, invoiceAPI } from "../utils/api";
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
  Edit,
  Save,
  X,
  Trash2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  User,
  DollarSign,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

const CustomerDetailPro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadCustomerDetails();
  }, [id]);

  const loadCustomerDetails = async () => {
    try {
      const response = await customerAPI.getDetails(id);
      setData(response.data);
      const cust = response.data.customer;
      setEditForm({
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        address: cust.address,
        gstin: cust.gstin,
        pan: cust.pan,
        credit_limit: cust.credit_limit,
        payment_terms: cust.payment_terms,
        contact_person: cust.contact_person,
        status: cust.status,
      });
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load customer details");
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await customerAPI.update(id, editForm);
      toast.success("Customer updated successfully");
      setIsEditing(false);
      loadCustomerDetails();
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await customerAPI.delete(id);
      toast.success("Customer deleted successfully");
      navigate("/customers");
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600 text-sm">Loading customer details...</p>
        </div>
      </div>
    );
  }

  const customer = data?.customer;
  const invoices = data?.invoices || [];
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "Paid").length;
  const overdueInvoices = invoices.filter((i) => i.status === "Overdue").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => navigate("/customers")}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Customers
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-semibold">
                {customer?.name}
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
                    onClick={handleDelete}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      loadCustomerDetails();
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
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: "#3A4E63" }}
            >
              {customer?.name?.charAt(0)}
            </div>

            {/* Title & Status */}
            <div className="flex-1">
              <h1
                className="text-2xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: "Poppins" }}
              >
                {customer?.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-mono">
                  {customer?.customer_id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    customer?.status === "Active"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {customer?.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Total Invoices
                </span>
                <div className="w-8 h-8 rounded-lg bg-[rgba(3,63,153,0.08)] flex items-center justify-center">
                  <FileText className="h-4 w-4 text-[#033F99]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totalInvoices}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Paid</span>
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalInvoices > 0
                  ? Math.round((paidInvoices / totalInvoices) * 100)
                  : 0}
                % payment rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Overdue
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {overdueInvoices}
              </p>
              <p className="text-xs text-red-600 mt-1 font-medium">
                {overdueInvoices > 0 ? "Needs attention" : "All clear"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Balance
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(customer?.closing_balance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Outstanding</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex gap-8 px-6">
            {["overview", "invoices", "activity"].map((tab) => (
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
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Company Name
                        </Label>
                        <Input
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Contact Person
                        </Label>
                        <Input
                          value={editForm.contact_person || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              contact_person: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Phone
                        </Label>
                        <Input
                          value={editForm.phone || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Address
                        </Label>
                        <Input
                          value={editForm.address || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              address: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Contact Person
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {customer?.contact_person || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {customer?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {customer?.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Address
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {customer?.address || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          GSTIN
                        </Label>
                        <Input
                          value={editForm.gstin || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, gstin: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          PAN
                        </Label>
                        <Input
                          value={editForm.pan || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, pan: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Credit Limit (₹)
                        </Label>
                        <Input
                          type="number"
                          value={editForm.credit_limit || 0}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              credit_limit: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Payment Terms
                        </Label>
                        <Input
                          value={editForm.payment_terms || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              payment_terms: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">GSTIN</p>
                          <p className="text-sm font-medium text-gray-900 font-mono">
                            {customer?.gstin || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">PAN</p>
                          <p className="text-sm font-medium text-gray-900 font-mono">
                            {customer?.pan || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Credit Limit
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(customer?.credit_limit)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Payment Terms
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {customer?.payment_terms || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "invoices" && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Recent Invoices
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {invoices.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {invoices.slice(0, 10).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: "#EEF4FF" }}
                            >
                              <FileText
                                className="h-5 w-5"
                                style={{ color: "#3A4E63" }}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {invoice.invoice_number}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(invoice.invoice_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(invoice.total_amount)}
                              </p>
                              <p className="text-sm text-gray-500">Total</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                invoice.status === "Paid"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : invoice.status === "Partially Paid"
                                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                    : invoice.status === "Overdue"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : "bg-gray-50 text-gray-700 border border-gray-200"
                              }`}
                            >
                              {invoice.status}
                            </span>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No invoices yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Invoices will appear here once created
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "activity" && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No activity yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Customer activity will be shown here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPro;
