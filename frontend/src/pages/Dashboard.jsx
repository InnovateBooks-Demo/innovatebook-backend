import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../utils/api";

import { COLORS } from "../utils/theme";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
console.log("THEME PRIMARY =", COLORS.primary);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await dashboardAPI.getMetrics();
      setMetrics(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 }) || 0}`;
  };

  const formatPercent = (percent) => {
    return `${percent?.toFixed(1) || 0}%`;
  };

  return (
    <div className="p-8" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: COLORS.primary }}
        >
          Dashboard
        </h1>
        <p className="text-gray-600">
          Complete overview of your financial health
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card" data-testid="cash-on-hand-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cash on Hand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "Inter", color: COLORS.primary }}
                >
                  {formatCurrency(metrics?.cash_on_hand)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="net-cash-flow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Net Cash Flow (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-2xl font-semibold"
                  style={{
                    fontFamily: "Inter",
                    color: metrics?.net_cash_flow >= 0 ? "#10b981" : "#ef4444",
                  }}
                >
                  {formatCurrency(metrics?.net_cash_flow)}
                </p>
              </div>
              {metrics?.net_cash_flow >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="revenue-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "Inter", color: COLORS.primary }}
                >
                  {formatCurrency(metrics?.revenue_mtd)}
                </p>
              </div>
              <TrendingUp
                className="h-8 w-8"
                style={{ color: COLORS.primary }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="runway-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cash Runway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "Inter", color: COLORS.primary }}
                >
                  {Math.round(metrics?.runway_days || 0)} days
                </p>
              </div>
              <Clock className="h-8 w-8" style={{ color: COLORS.primary }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receivables & Payables */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="chart-container" data-testid="receivables-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ fontFamily: "Inter", color: COLORS.primary }}
            >
              Accounts Receivable
            </CardTitle>
            <CardDescription>
              Outstanding invoices & collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Outstanding</span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  {formatCurrency(metrics?.ar_outstanding)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overdue</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(metrics?.ar_overdue_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">% Overdue</span>
                <span className="text-lg font-semibold text-orange-600">
                  {formatPercent(metrics?.ar_overdue_percent)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">DSO (Days)</span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  {metrics?.dso?.toFixed(1) || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="chart-container" data-testid="payables-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ fontFamily: "Inter", color: COLORS.primary }}
            >
              Accounts Payable
            </CardTitle>
            <CardDescription>Outstanding bills & payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Outstanding</span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  {formatCurrency(metrics?.ap_outstanding)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overdue</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(metrics?.ap_overdue_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">DPO (Days)</span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  {metrics?.dpo?.toFixed(1) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Ratio</span>
                <span className="text-lg font-semibold text-green-600">
                  {metrics?.current_ratio?.toFixed(2) || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="chart-container mb-8" data-testid="ai-insights-card">
        <CardHeader>
          <CardTitle
            className="text-xl font-semibold"
            style={{ fontFamily: "Inter", color: COLORS.primary }}
          >
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Smart analysis of your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[rgba(3,63,153,0.08)] p-4 rounded-lg border border-[rgba(3,63,153,0.25)]">
            <p className="text-gray-700 whitespace-pre-line">
              {metrics?.ai_insights || "Loading insights..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <Card className="chart-container" data-testid="alerts-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ fontFamily: "Inter", color: COLORS.primary }}
            >
              Alerts & Actions
            </CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.alerts.map((alert, index) => (
                <div
                  key={`item-${index}`}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.type === "warning"
                      ? "bg-orange-50 border border-orange-200"
                      : "bg-[rgba(3,63,153,0.08)] border border-[rgba(3,63,153,0.25)]"
                  }`}
                >
                  <AlertCircle
                    className={`h-5 w-5 mt-0.5 ${
                      alert.type === "warning"
                        ? "text-orange-600"
                        : "text-[#033F99]"
                    }`}
                  />
                  <p className="text-gray-700">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
