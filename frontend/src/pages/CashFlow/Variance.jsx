import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const CashFlowVariance = () => {
  const [variance, setVariance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    loadVariance();
  }, [period]);

  const loadVariance = async () => {
    try {
      const response = await cashFlowAPI.getVariance(period);
      setVariance(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load variance data");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;
  const formatPercentage = (value) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  const getVarianceColor = (variance) => {
    if (Math.abs(variance) < 5) return "text-green-600";
    if (Math.abs(variance) < 15) return "text-yellow-600";
    return "text-red-600";
  };

  const getVarianceIcon = (variance) => {
    if (Math.abs(variance) < 5)
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (Math.abs(variance) < 15)
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="cashflow-variance-page">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "Inter", color: "#3A4E63" }}
            >
              Budget vs Actual Variance Analysis
            </h2>
            <p className="text-gray-600 mt-1">
              Compare budgeted cash flow with actual performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={period === "quarterly" ? "default" : "outline"}
              onClick={() => setPeriod("quarterly")}
            >
              Quarterly
            </Button>
            <Button
              variant={period === "yearly" ? "default" : "outline"}
              onClick={() => setPeriod("yearly")}
            >
              Yearly
            </Button>
          </div>
        </div>

        {variance && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">
                    Budget Inflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: "#3A4E63" }}
                  >
                    {formatCurrency(variance.budget_inflow)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Planned</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">
                    Actual Inflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatCurrency(variance.actual_inflow)}
                  </p>
                  <p
                    className={`text-sm mt-1 ${getVarianceColor(variance.inflow_variance_pct)}`}
                  >
                    {formatPercentage(variance.inflow_variance_pct)} vs budget
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">
                    Budget Outflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: "#3A4E63" }}
                  >
                    {formatCurrency(variance.budget_outflow)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Planned</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">
                    Actual Outflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-red-600">
                    {formatCurrency(variance.actual_outflow)}
                  </p>
                  <p
                    className={`text-sm mt-1 ${getVarianceColor(variance.outflow_variance_pct)}`}
                  >
                    {formatPercentage(variance.outflow_variance_pct)} vs budget
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Net Variance Summary */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle style={{ color: "#3A4E63" }}>
                  Net Cash Flow Variance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Budgeted Net Flow
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: "#3A4E63" }}
                    >
                      {formatCurrency(variance.budget_net_flow)}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Actual Net Flow
                    </p>
                    <p
                      className={`text-3xl font-bold ${variance.actual_net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(variance.actual_net_flow)}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Variance</p>
                    <div className="flex items-center justify-center gap-2">
                      {getVarianceIcon(variance.net_variance_pct)}
                      <p
                        className={`text-3xl font-bold ${getVarianceColor(variance.net_variance_pct)}`}
                      >
                        {formatPercentage(variance.net_variance_pct)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Variance Breakdown */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle style={{ color: "#3A4E63" }}>
                  Category-wise Variance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="inflow">
                  <TabsList>
                    <TabsTrigger value="inflow">Inflow Variance</TabsTrigger>
                    <TabsTrigger value="outflow">Outflow Variance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="inflow">
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Budgeted</th>
                            <th>Actual</th>
                            <th>Variance</th>
                            <th>Variance %</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variance.inflow_categories?.map((cat, index) => (
                            <tr key={`item-${index}`}>
                              <td className="font-medium">{cat.category}</td>
                              <td>{formatCurrency(cat.budgeted)}</td>
                              <td className="text-green-600 font-semibold">
                                {formatCurrency(cat.actual)}
                              </td>
                              <td
                                className={`font-semibold ${cat.variance >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {formatCurrency(cat.variance)}
                              </td>
                              <td
                                className={getVarianceColor(cat.variance_pct)}
                              >
                                {formatPercentage(cat.variance_pct)}
                              </td>
                              <td>
                                {Math.abs(cat.variance_pct) < 5 ? (
                                  <span className="badge badge-success">
                                    On Track
                                  </span>
                                ) : Math.abs(cat.variance_pct) < 15 ? (
                                  <span className="badge badge-warning">
                                    Monitor
                                  </span>
                                ) : (
                                  <span className="badge badge-danger">
                                    Alert
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="outflow">
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Budgeted</th>
                            <th>Actual</th>
                            <th>Variance</th>
                            <th>Variance %</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variance.outflow_categories?.map((cat, index) => (
                            <tr key={`item-${index}`}>
                              <td className="font-medium">{cat.category}</td>
                              <td>{formatCurrency(cat.budgeted)}</td>
                              <td className="text-red-600 font-semibold">
                                {formatCurrency(cat.actual)}
                              </td>
                              <td
                                className={`font-semibold ${cat.variance <= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {formatCurrency(cat.variance)}
                              </td>
                              <td
                                className={getVarianceColor(cat.variance_pct)}
                              >
                                {formatPercentage(cat.variance_pct)}
                              </td>
                              <td>
                                {Math.abs(cat.variance_pct) < 5 ? (
                                  <span className="badge badge-success">
                                    On Track
                                  </span>
                                ) : Math.abs(cat.variance_pct) < 15 ? (
                                  <span className="badge badge-warning">
                                    Monitor
                                  </span>
                                ) : (
                                  <span className="badge badge-danger">
                                    Over Budget
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {variance.ai_analysis && (
              <Card
                className="chart-container"
                style={{
                  background:
                    "linear-gradient(135deg, #EEF4FF 0%, #FFFFFF 100%)",
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="flex items-center gap-2"
                    style={{ color: "#3A4E63" }}
                  >
                    <Sparkles className="h-5 w-5" />
                    AI Variance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Key Findings:
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {variance.ai_analysis.summary}
                      </p>
                    </div>

                    {variance.ai_analysis.recommendations && (
                      <div
                        className="p-4 bg-white rounded-lg border-l-4"
                        style={{ borderLeftColor: "#3A4E63" }}
                      >
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Recommendations:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {variance.ai_analysis.recommendations.map(
                            (rec, index) => (
                              <li key={`item-${index}`}>{rec}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Indicators */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle style={{ color: "#3A4E63" }}>
                  Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Accuracy Score
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Inflow Accuracy
                          </span>
                          <span className="text-sm font-medium">
                            {variance.inflow_accuracy}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${variance.inflow_accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Outflow Accuracy
                          </span>
                          <span className="text-sm font-medium">
                            {variance.outflow_accuracy}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${variance.outflow_accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Budget Health
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">
                          Categories On Track
                        </span>
                        <span className="font-semibold text-green-600">
                          {variance.categories_on_track || 0}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">
                          Categories to Monitor
                        </span>
                        <span className="font-semibold text-yellow-600">
                          {variance.categories_to_monitor || 0}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">
                          Categories at Risk
                        </span>
                        <span className="font-semibold text-red-600">
                          {variance.categories_at_risk || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default CashFlowVariance;
