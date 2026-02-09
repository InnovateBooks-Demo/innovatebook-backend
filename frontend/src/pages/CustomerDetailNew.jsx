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
} from "lucide-react";

const CustomerDetailNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-[#EBF3FC]">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600 text-lg">Loading customer details...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-[#EBF3FC]">
      <div className="w-full p-4 md:p-6 lg:p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/customers")}
          className="mb-4 md:mb-6 hover:bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>

        {/* Header Card */}
        <Card
          className="mb-4 md:mb-6 overflow-hidden shadow-2xl border-0"
          style={{
            background: "linear-gradient(135deg, #3A4E63 0%, #0066FF 100%)",
          }}
        >
          <CardContent className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                {/* Customer Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {customer?.name?.charAt(0)}
                </div>

                {/* Customer Info */}
                <div>
                  <h1
                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {customer?.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/90 font-medium">
                      {customer?.customer_id}
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full font-bold ${
                        customer?.status === "Active"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {customer?.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Mail className="h-4 w-4" />
                      <span>{customer?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Phone className="h-4 w-4" />
                      <span>{customer?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!isEditing ? (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold"
                      size="lg"
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Customer
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white shadow-lg font-semibold"
                      size="lg"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveEdit}
                      className="bg-green-500 hover:bg-green-600 text-white shadow-lg font-semibold"
                      size="lg"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        loadCustomerDetails();
                      }}
                      className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 shadow-lg font-semibold"
                      size="lg"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-[#3A4E63]"></div>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Total Invoices
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalInvoices}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-[#3A4E63] flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Paid Invoices
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {paidInvoices}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="h-2 bg-gradient-to-r from-red-500 to-pink-600"></div>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Overdue
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {overdueInvoices}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-[#3A4E63]"></div>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Balance
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(customer?.closing_balance)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-[#3A4E63] flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card className="mb-6 md:mb-8 shadow-2xl border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-[#EBF3FC]">
              <CardTitle
                className="flex items-center gap-3 text-2xl"
                style={{ color: "#3A4E63" }}
              >
                <Edit className="h-6 w-6" />
                Edit Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Company Name
                  </Label>
                  <Input
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
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
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Phone
                  </Label>
                  <Input
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Address
                  </Label>
                  <Input
                    value={editForm.address || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    GSTIN
                  </Label>
                  <Input
                    value={editForm.gstin || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gstin: e.target.value })
                    }
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    PAN
                  </Label>
                  <Input
                    value={editForm.pan || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, pan: e.target.value })
                    }
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
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
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
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
                    className="border-2 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Contact Information */}
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-blue-600 to-[#3A4E63]"></div>
            <CardHeader className="bg-gradient-to-br from-blue-50 to-[#C4D9F4]">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-900">
                <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {customer?.contact_person || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {customer?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {customer?.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {customer?.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-green-600 to-[#3A4E63]"></div>
            <CardHeader className="bg-gradient-to-br from-green-50 to-teal-50">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-green-900">
                <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GSTIN</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {customer?.gstin || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PAN</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {customer?.pan || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credit Limit</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {formatCurrency(customer?.credit_limit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Terms</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {customer?.payment_terms || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-purple-600 to-pink-500"></div>
          <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-purple-900">
              <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-[#EBF3FC] rounded-2xl hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-500"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-[#3A4E63] flex items-center justify-center text-white font-bold shadow-lg">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-900">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(invoice.invoice_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                          invoice.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "Partially Paid"
                              ? "bg-yellow-100 text-yellow-700"
                              : invoice.status === "Overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Invoices Yet
                </h3>
                <p className="text-gray-500">
                  No invoices found for this customer
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetailNew;
