import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";

const AgingDSO = () => {
  const navigate = useNavigate();
  const [aging, setAging] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAging();
  }, []);

  const loadAging = async () => {
    try {
      const response = await invoiceAPI.getAging();
      setAging(response.data);
    } catch (error) {
      toast.error("Failed to load aging data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 }) || 0}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const total = aging
    ? Object.values(aging).reduce((sum, val) => sum + (val.amount || 0), 0)
    : 0;

  return (
    <div className="p-8" data-testid="aging-dso-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#3A4E63" }}
        >
          Aging & DSO
        </h1>
        <p className="text-gray-600">
          Analyze payment delays and collection efficiency
        </p>
      </div>

      <Card className="chart-container mb-8">
        <CardHeader>
          <CardTitle
            className="text-xl font-semibold"
            style={{ color: "#3A4E63" }}
          >
            Aging Analysis
          </CardTitle>
          <CardDescription>
            Outstanding receivables by aging bucket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList className="mb-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="0-30">
                0-30 Days ({aging?.["0-30"]?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="31-60">
                31-60 Days ({aging?.["31-60"]?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="61-90">
                61-90 Days ({aging?.["61-90"]?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="90+">
                90+ Days ({aging?.["90+"]?.count || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">0-30 Days</span>
                    <span className="badge badge-success">
                      {aging?.["0-30"]?.count || 0} invoices
                    </span>
                  </div>
                  <span
                    className="text-lg font-semibold"
                    style={{ color: "#3A4E63" }}
                  >
                    {formatCurrency(aging?.["0-30"]?.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">31-60 Days</span>
                    <span className="badge badge-warning">
                      {aging?.["31-60"]?.count || 0} invoices
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-orange-600">
                    {formatCurrency(aging?.["31-60"]?.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">61-90 Days</span>
                    <span className="badge badge-danger">
                      {aging?.["61-90"]?.count || 0} invoices
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(aging?.["61-90"]?.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">90+ Days</span>
                    <span className="badge badge-danger">
                      {aging?.["90+"]?.count || 0} invoices
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-red-700">
                    {formatCurrency(aging?.["90+"]?.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
                  <span className="font-semibold" style={{ color: "#3A4E63" }}>
                    Total Outstanding
                  </span>
                  <span
                    className="text-xl font-semibold"
                    style={{ color: "#3A4E63" }}
                  >
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </TabsContent>

            {["0-30", "31-60", "61-90", "90+"].map((bucket) => (
              <TabsContent key={bucket} value={bucket}>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Days Overdue</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aging?.[bucket]?.invoices?.map((inv) => (
                        <tr
                          key={inv.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                        >
                          <td className="font-medium">{inv.invoice_number}</td>
                          <td>{inv.customer_name}</td>
                          <td className="font-semibold text-red-600">
                            {formatCurrency(inv.amount)}
                          </td>
                          <td>{inv.days_overdue} days</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <span className="text-blue-600 hover:underline">
                              View Details
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="chart-container" data-testid="dso-metrics-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#3A4E63" }}
            >
              DSO Metrics
            </CardTitle>
            <CardDescription>Days Sales Outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Overall DSO</p>
                <p
                  className="text-5xl font-semibold"
                  style={{ color: "#3A4E63" }}
                >
                  45.5
                </p>
                <p className="text-sm text-gray-600 mt-2">days</p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">AR Turnover Ratio</span>
                  <span
                    className="text-lg font-semibold"
                    style={{ color: "#3A4E63" }}
                  >
                    8.0x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Collection Rate</span>
                  <span className="text-lg font-semibold text-green-600">
                    87%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgingDSO;
