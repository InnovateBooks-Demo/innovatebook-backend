import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";

const CashFlow = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await cashFlowAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      toast.error("Failed to load cash flow data");
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

  return (
    <div className="p-8" data-testid="cashflow-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#3A4E63" }}
        >
          Cash Flow
        </h1>
        <p className="text-gray-600">
          Track actual and projected cash movements
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="stat-card" data-testid="opening-balance-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Opening Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold" style={{ color: "#3A4E63" }}>
              {formatCurrency(summary?.opening_balance)}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="actual-inflow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Actual Inflow (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(summary?.actual_inflow)}
              </p>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="actual-outflow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Actual Outflow (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-red-600">
                {formatCurrency(summary?.actual_outflow)}
              </p>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Position */}
      <Card className="chart-container mb-8" data-testid="net-position-card">
        <CardHeader>
          <CardTitle
            className="text-xl font-semibold"
            style={{ color: "#3A4E63" }}
          >
            Net Cash Position
          </CardTitle>
          <CardDescription>Actual + Projected balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Opening Balance</span>
              <span className="text-lg font-semibold">
                {formatCurrency(summary?.opening_balance)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">+ Actual Inflow</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(summary?.actual_inflow)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">- Actual Outflow</span>
              <span className="text-lg font-semibold text-red-600">
                {formatCurrency(summary?.actual_outflow)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Net Actual Flow</span>
              <span
                className="text-lg font-semibold"
                style={{
                  color: summary?.net_actual_flow >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {formatCurrency(summary?.net_actual_flow)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4 mt-4">
              <span className="font-semibold" style={{ color: "#3A4E63" }}>
                Projected Closing Balance
              </span>
              <span
                className="text-2xl font-semibold"
                style={{ color: "#3A4E63" }}
              >
                {formatCurrency(summary?.projected_closing_balance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expected Flows */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="chart-container" data-testid="expected-inflows-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#3A4E63" }}
            >
              Expected Inflows
            </CardTitle>
            <CardDescription>Projected incoming cash</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next 30 days</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(summary?.expected_inflow_30d)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next 60 days</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(summary?.expected_inflow_60d)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next 90 days</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(summary?.expected_inflow_90d)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="chart-container" data-testid="expected-outflows-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#3A4E63" }}
            >
              Expected Outflows
            </CardTitle>
            <CardDescription>Projected outgoing cash</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next 30 days</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(summary?.expected_outflow_30d)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next 60 days</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(summary?.expected_outflow_60d)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next 90 days</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(summary?.expected_outflow_90d)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashFlow;
