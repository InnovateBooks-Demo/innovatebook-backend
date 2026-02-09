import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import axios from "axios";
import { getAuthHeaders } from "../utils/auth";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Receipt,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
} from "lucide-react";

const DashboardRedesigned = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    customers: { total: 0, outstanding: 0 },
    vendors: { total: 0, payable: 0 },
    invoices: { total: 0, outstanding: 0, overdue: 0 },
    bills: { total: 0, outstanding: 0, overdue: 0 },
    cashFlow: { inflow: 0, outflow: 0, balance: 0 },
  });

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const response = await axios.get(`${backendUrl}/api/dashboard/metrics`, {
        headers: getAuthHeaders(),
      });

      // Get backend response data
      const backendData = response.data;

      // Get customers and vendors count
      const customersResponse = await axios.get(`${backendUrl}/api/customers`, {
        headers: getAuthHeaders(),
      });
      const vendorsResponse = await axios.get(`${backendUrl}/api/vendors`, {
        headers: getAuthHeaders(),
      });
      const invoicesResponse = await axios.get(`${backendUrl}/api/invoices`, {
        headers: getAuthHeaders(),
      });
      const billsResponse = await axios.get(`${backendUrl}/api/bills`, {
        headers: getAuthHeaders(),
      });

      // Map backend response to frontend structure
      setMetrics({
        customers: {
          total: customersResponse.data?.length || 0,
          outstanding: backendData.ar_outstanding || 0,
        },
        vendors: {
          total: vendorsResponse.data?.length || 0,
          payable: backendData.ap_outstanding || 0,
        },
        invoices: {
          total: invoicesResponse.data?.length || 0,
          outstanding: backendData.ar_outstanding || 0,
          overdue: backendData.ar_overdue_amount || 0,
        },
        bills: {
          total: billsResponse.data?.length || 0,
          outstanding: backendData.ap_outstanding || 0,
          overdue: backendData.ap_overdue_amount || 0,
        },
        cashFlow: {
          inflow: backendData.revenue_mtd || 0,
          outflow: backendData.expenses_mtd || 0,
          balance: backendData.net_cash_flow || 0,
        },
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to load metrics:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const quickActions = [
    {
      icon: FileText,
      label: "Create Invoice",
      path: "/invoices/create",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Receipt,
      label: "Create Bill",
      path: "/bills/create",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Users,
      label: "Add Customer",
      path: "/customers",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Building2,
      label: "Add Vendor",
      path: "/vendors",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                IB Finance Dashboard
              </h1>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Your Financial Intelligence OS - Real-time insights at a glance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-8">
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                  <Card
                    key={idx}
                    className="p-6 bg-white border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}
                        >
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <span
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {action.label}
                        </span>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="mb-8">
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Key Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Customers */}
                <Card
                  className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/customers")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#033F99]" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p
                    className="text-sm text-gray-600 mb-1"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Customers
                  </p>
                  <p
                    className="text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {metrics?.customers?.total || 0}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Receivable:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(metrics?.customers?.outstanding || 0)}
                    </span>
                  </div>
                </Card>

                {/* Vendors */}
                <Card
                  className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/vendors")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p
                    className="text-sm text-gray-600 mb-1"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Vendors
                  </p>
                  <p
                    className="text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {metrics?.vendors?.total || 0}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Payable:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(metrics?.vendors?.payable || 0)}
                    </span>
                  </div>
                </Card>

                {/* Invoices */}
                <Card
                  className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/invoices")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p
                    className="text-sm text-gray-600 mb-1"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Invoices
                  </p>
                  <p
                    className="text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {metrics?.invoices?.total || 0}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Outstanding:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(metrics?.invoices?.outstanding || 0)}
                    </span>
                  </div>
                </Card>

                {/* Bills */}
                <Card
                  className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/bills")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-red-600" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p
                    className="text-sm text-gray-600 mb-1"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Bills
                  </p>
                  <p
                    className="text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {metrics?.bills?.total || 0}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Outstanding:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(metrics?.bills?.outstanding || 0)}
                    </span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Cash Flow Summary */}
            <div className="mb-8">
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Cash Flow Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">Cash Inflow</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {formatCurrency(metrics?.cashFlow?.inflow || 0)}
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="h-8 w-8" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">Cash Outflow</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {formatCurrency(metrics?.cashFlow?.outflow || 0)}
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">Net Cash Flow</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {formatCurrency(metrics?.cashFlow?.balance || 0)}
                  </p>
                </Card>
              </div>
            </div>

            {/* Recent Activity & Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alerts */}
              <Card className="p-6 bg-white border-0 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <h3
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Attention Required
                  </h3>
                </div>
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => navigate("/invoices")}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-red-600" />
                      <span
                        className="text-sm font-medium text-gray-900"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Overdue Invoices
                      </span>
                    </div>
                    <span
                      className="text-2xl font-bold text-red-600"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {metrics?.invoices?.overdue || 0}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => navigate("/bills")}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span
                        className="text-sm font-medium text-gray-900"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Overdue Bills
                      </span>
                    </div>
                    <span
                      className="text-2xl font-bold text-orange-600"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {metrics?.bills?.overdue || 0}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Quick Links */}
              <Card className="p-6 bg-white border-0 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <h3
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Reports & Analytics
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => navigate("/financial-reporting/profit-loss")}
                  >
                    <PieChart className="h-5 w-5 text-green-600" />
                    Profit & Loss Statement
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() =>
                      navigate("/financial-reporting/balance-sheet")
                    }
                  >
                    <BarChart3 className="h-5 w-5 text-[#033F99]" />
                    Balance Sheet
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => navigate("/cash-flow/actuals")}
                  >
                    <Activity className="h-5 w-5 text-purple-600" />
                    Cash Flow Analysis
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => navigate("/collections")}
                  >
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Collections Dashboard
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardRedesigned;
