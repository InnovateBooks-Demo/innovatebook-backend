import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorAPI } from "../utils/api";
import {
  Card,
  CardContent,
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
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorDetails();
  }, [id]);

  const loadVendorDetails = async () => {
    try {
      const response = await vendorAPI.getDetails(id);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load vendor details");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const vendor = data?.vendor;

  return (
    <div className="p-8" data-testid="vendor-detail-page">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/vendors")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Inter", color: "#033F99" }}
            >
              {vendor?.name}
            </h1>
            <p className="text-gray-600">{vendor?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Total Billed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold" style={{ color: "#033F99" }}>
              {formatCurrency(data?.total_billed)}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(data?.total_paid)}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">
              {formatCurrency(vendor?.total_payable)}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Avg Payment Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold" style={{ color: "#033F99" }}>
              {vendor?.avg_payment_days || 0} days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="chart-container">
        <Tabs defaultValue="information">
          <CardHeader>
            <TabsList>
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="bills">
                Bills ({data?.bills?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="payments">
                Payments ({data?.payments?.length || 0})
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="information">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3
                    className="font-semibold mb-4"
                    style={{ color: "#033F99" }}
                  >
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="font-medium">{vendor?.contact_person}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{vendor?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{vendor?.phone}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3
                    className="font-semibold mb-4"
                    style={{ color: "#033F99" }}
                  >
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">GSTIN</p>
                      <p className="font-medium">{vendor?.gstin || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Terms</p>
                      <p className="font-medium">{vendor?.payment_terms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bank Account</p>
                      <p className="font-medium">
                        {vendor?.bank_account || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bills">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bill #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Paid</th>
                      <th>Outstanding</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.bills?.map((bill) => (
                      <tr
                        key={bill.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/bills/${bill.id}`)}
                      >
                        <td className="font-medium">{bill.bill_number}</td>
                        <td>{formatDate(bill.bill_date)}</td>
                        <td>{formatCurrency(bill.total_amount)}</td>
                        <td className="text-green-600">
                          {formatCurrency(bill.amount_paid)}
                        </td>
                        <td className="text-red-600">
                          {formatCurrency(bill.amount_outstanding)}
                        </td>
                        <td>
                          <span
                            className={`badge ${bill.status === "Paid"
                                ? "badge-success"
                                : bill.status === "Partially Paid"
                                  ? "badge-warning"
                                  : "badge-danger"
                              }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.payments?.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.transaction_date)}</td>
                        <td>{payment.description}</td>
                        <td className="font-semibold text-red-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td>{payment.reference_no}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default VendorDetail;
