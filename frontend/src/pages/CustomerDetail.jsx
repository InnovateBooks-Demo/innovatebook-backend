import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  User,
} from "lucide-react";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerDetails();
  }, [id]);

  const loadCustomerDetails = async () => {
    try {
      const response = await customerAPI.getDetails(id);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load customer details");
      setLoading(false);
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
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const customer = data?.customer;

  return (
    <div className="p-8" data-testid="customer-detail-page">
      {/* Header Section - Enhanced */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/customers")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, #033F99 0%, #0066FF 100%)",
              }}
            >
              {customer?.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1
                  className="text-4xl font-bold"
                  style={{ fontFamily: "Inter", color: "#033F99" }}
                >
                  {customer?.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${customer?.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {customer?.status}
                </span>
              </div>
              {customer?.customer_id && (
                <p className="text-lg text-gray-600 font-medium mb-1">
                  ID: {customer.customer_id}
                </p>
              )}
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {customer?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {customer?.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/customers/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Summary - Enhanced */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card
          className="stat-card border-l-4"
          style={{ borderLeftColor: "#033F99" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: "#033F99" }}>
              {formatCurrency(data?.total_invoiced)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data?.invoices?.length || 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(data?.total_paid)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Received payments</p>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(customer?.outstanding_amount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pending amount</p>
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(customer?.overdue_amount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Information - Enhanced */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Contact Person
                </Label>
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="h-4 w-4 text-gray-500" />
                  <p className="text-base">{customer?.contact_person}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="text-base">{customer?.email}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Phone Number
                </Label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="text-base">{customer?.phone}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  GSTIN
                </Label>
                <div className="flex items-center gap-2 text-gray-900">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <p className="text-base">{customer?.gstin || "-"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  PAN
                </Label>
                <div className="flex items-center gap-2 text-gray-900">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <p className="text-base">{customer?.pan || "-"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Payment Terms
                </Label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-base">{customer?.payment_terms}</p>
                </div>
              </div>

              <div className="col-span-2">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Address
                </Label>
                <div className="flex items-start gap-2 text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <p className="text-base">{customer?.address || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>Payment Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Credit Limit
              </Label>
              <p className="text-2xl font-bold" style={{ color: "#033F99" }}>
                {formatCurrency(customer?.credit_limit)}
              </p>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Avg Payment Days
              </Label>
              <p className="text-2xl font-bold text-gray-900">
                {customer?.avg_payment_days?.toFixed(0) || 0} days
              </p>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Account Created
              </Label>
              <p className="text-base text-gray-700">
                {formatDate(customer?.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices & Activities - Tabs */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="invoices">
            Invoices ({data?.invoices?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: "#033F99" }}>
                Invoice History
              </CardTitle>
              <CardDescription>All invoices for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.invoices && data.invoices.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice Number</th>
                        <th>Date</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Outstanding</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="font-medium">
                            {invoice.invoice_number}
                          </td>
                          <td>{formatDate(invoice.invoice_date)}</td>
                          <td>{formatDate(invoice.due_date)}</td>
                          <td className="font-semibold">
                            {formatCurrency(invoice.total_amount)}
                          </td>
                          <td className="font-semibold text-orange-600">
                            {formatCurrency(invoice.amount_outstanding)}
                          </td>
                          <td>
                            <span
                              className={`badge ${invoice.status === "Paid"
                                  ? "badge-success"
                                  : invoice.status === "Partially Paid"
                                    ? "badge-warning"
                                    : "badge-secondary"
                                }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/invoices/${invoice.id}`)
                              }
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    No invoices found for this customer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: "#033F99" }}>
                Recent Activities
              </CardTitle>
              <CardDescription>Transaction history and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p>Activity timeline coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Label = ({ children, className }) => (
  <label className={className}>{children}</label>
);

export default CustomerDetail;
