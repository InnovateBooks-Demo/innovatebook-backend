import React, { useState, useEffect } from "react";
import { reportAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const [arSummary, setArSummary] = useState(null);
  const [apSummary, setApSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [arRes, apRes] = await Promise.all([
        reportAPI.getARSummary(),
        reportAPI.getAPSummary(),
      ]);
      setArSummary(arRes.data);
      setApSummary(apRes.data);
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 }) || 0}`;
  const formatPercent = (percent) => `${percent?.toFixed(1) || 0}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="reports-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#3A4E63" }}
        >
          Reports
        </h1>
        <p className="text-gray-600">Financial reports and analytics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* AR Summary */}
        <Card className="chart-container" data-testid="ar-report-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle
                className="text-xl font-semibold"
                style={{ color: "#3A4E63" }}
              >
                AR Summary Report
              </CardTitle>
              <CardDescription>Accounts Receivable overview</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              data-testid="download-ar-report-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total Receivables</span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "#3A4E63" }}
                >
                  {formatCurrency(arSummary?.total_receivables)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total Collected</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(arSummary?.total_collected)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total Outstanding</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(arSummary?.total_outstanding)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-[rgba(3,63,153,0.08)] rounded-lg px-4">
                <span className="font-semibold" style={{ color: "#3A4E63" }}>
                  Collection Rate
                </span>
                <span className="text-xl font-semibold text-green-600">
                  {formatPercent(arSummary?.collection_rate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AP Summary */}
        <Card className="chart-container" data-testid="ap-report-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle
                className="text-xl font-semibold"
                style={{ color: "#3A4E63" }}
              >
                AP Summary Report
              </CardTitle>
              <CardDescription>Accounts Payable overview</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              data-testid="download-ap-report-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total Payables</span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "#3A4E63" }}
                >
                  {formatCurrency(apSummary?.total_payables)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total Paid</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(apSummary?.total_paid)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total Outstanding</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(apSummary?.total_outstanding)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-[rgba(3,63,153,0.08)] rounded-lg px-4">
                <span className="font-semibold" style={{ color: "#3A4E63" }}>
                  Payment Rate
                </span>
                <span className="text-xl font-semibold text-green-600">
                  {formatPercent(apSummary?.payment_rate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Reports */}
      <Card className="chart-container" data-testid="additional-reports-card">
        <CardHeader>
          <CardTitle
            className="text-xl font-semibold"
            style={{ color: "#3A4E63" }}
          >
            Available Reports
          </CardTitle>
          <CardDescription>
            Download comprehensive financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Cash Flow Statement",
              "Invoice Aging Report",
              "Bill Aging Report",
              "Bank Reconciliation",
              "Customer Ledger",
              "Vendor Ledger",
              "DSO/DPO Analysis",
              "Expense Summary",
            ].map((report) => (
              <div
                key={report}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <span className="text-gray-700">{report}</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
