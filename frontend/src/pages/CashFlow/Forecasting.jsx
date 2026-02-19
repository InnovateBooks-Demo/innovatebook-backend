import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Sparkles,
} from "lucide-react";

const CashFlowForecasting = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      const response = await cashFlowAPI.getForecast();
      setForecast(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load forecast data");
      setLoading(false);
    }
  };

  const generateAIForecast = async () => {
    setGenerating(true);
    try {
      const response = await cashFlowAPI.generateAIForecast();
      setForecast(response.data);
      toast.success("AI forecast generated successfully");
    } catch (error) {
      toast.error("Failed to generate AI forecast");
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

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
    <div className="p-8" data-testid="cashflow-forecasting-page">
      <div className="space-y-6">
        {/* Header with AI Generate Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "Inter", color: "#033F99" }}
            >
              Cash Flow Forecasting
            </h2>
            <p className="text-gray-600 mt-1">
              AI-powered predictions for next 3 months
            </p>
          </div>
          <Button
            onClick={generateAIForecast}
            disabled={generating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? "Generating..." : "Generate AI Forecast"}
          </Button>
        </div>

        {forecast && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next 30 Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: "#033F99" }}
                  >
                    {formatCurrency(forecast.month_1?.net_flow)}
                  </p>
                  <p
                    className={`text-sm mt-1 ${forecast.month_1?.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {forecast.month_1?.net_flow >= 0 ? "Positive" : "Negative"}{" "}
                    Cash Flow
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next 60 Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: "#033F99" }}
                  >
                    {formatCurrency(forecast.month_2?.net_flow)}
                  </p>
                  <p
                    className={`text-sm mt-1 ${forecast.month_2?.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {forecast.month_2?.net_flow >= 0 ? "Positive" : "Negative"}{" "}
                    Cash Flow
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next 90 Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: "#033F99" }}
                  >
                    {formatCurrency(forecast.month_3?.net_flow)}
                  </p>
                  <p
                    className={`text-sm mt-1 ${forecast.month_3?.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {forecast.month_3?.net_flow >= 0 ? "Positive" : "Negative"}{" "}
                    Cash Flow
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Projected Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatCurrency(forecast.projected_balance_90d)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">In 90 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Forecast Table */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle style={{ color: "#033F99" }}>
                  Detailed 3-Month Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Opening Balance</th>
                        <th>Expected Inflow</th>
                        <th>Expected Outflow</th>
                        <th>Net Flow</th>
                        <th>Closing Balance</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-medium">Next 30 Days</td>
                        <td>{formatCurrency(forecast.current_balance)}</td>
                        <td className="text-green-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {formatCurrency(forecast.month_1?.expected_inflow)}
                          </div>
                        </td>
                        <td className="text-red-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4" />
                            {formatCurrency(forecast.month_1?.expected_outflow)}
                          </div>
                        </td>
                        <td
                          className={`font-semibold ${forecast.month_1?.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(forecast.month_1?.net_flow)}
                        </td>
                        <td
                          className="font-semibold"
                          style={{ color: "#033F99" }}
                        >
                          {formatCurrency(forecast.month_1?.closing_balance)}
                        </td>
                        <td>
                          <span className="badge badge-success">
                            {forecast.month_1?.confidence}% High
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="font-medium">Next 60 Days</td>
                        <td>
                          {formatCurrency(forecast.month_1?.closing_balance)}
                        </td>
                        <td className="text-green-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {formatCurrency(forecast.month_2?.expected_inflow)}
                          </div>
                        </td>
                        <td className="text-red-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4" />
                            {formatCurrency(forecast.month_2?.expected_outflow)}
                          </div>
                        </td>
                        <td
                          className={`font-semibold ${forecast.month_2?.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(forecast.month_2?.net_flow)}
                        </td>
                        <td
                          className="font-semibold"
                          style={{ color: "#033F99" }}
                        >
                          {formatCurrency(forecast.month_2?.closing_balance)}
                        </td>
                        <td>
                          <span className="badge badge-warning">
                            {forecast.month_2?.confidence}% Medium
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="font-medium">Next 90 Days</td>
                        <td>
                          {formatCurrency(forecast.month_2?.closing_balance)}
                        </td>
                        <td className="text-green-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {formatCurrency(forecast.month_3?.expected_inflow)}
                          </div>
                        </td>
                        <td className="text-red-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4" />
                            {formatCurrency(forecast.month_3?.expected_outflow)}
                          </div>
                        </td>
                        <td
                          className={`font-semibold ${forecast.month_3?.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(forecast.month_3?.net_flow)}
                        </td>
                        <td
                          className="font-semibold"
                          style={{ color: "#033F99" }}
                        >
                          {formatCurrency(forecast.month_3?.closing_balance)}
                        </td>
                        <td>
                          <span className="badge badge-secondary">
                            {forecast.month_3?.confidence}% Low
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            {forecast.ai_insights && (
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
                    style={{ color: "#033F99" }}
                  >
                    <Sparkles className="h-5 w-5" />
                    AI-Powered Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {forecast.ai_insights.map((insight, index) => (
                      <div
                        key={`item-${index}`}
                        className="p-4 bg-white rounded-lg border-l-4"
                        style={{ borderLeftColor: "#033F99" }}
                      >
                        <p className="text-gray-700 leading-relaxed">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assumptions */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle style={{ color: "#033F99" }}>
                  Forecast Assumptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">
                      Inflow Assumptions:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>30% of outstanding invoices collected in 30 days</li>
                      <li>60% of outstanding invoices collected in 60 days</li>
                      <li>85% of outstanding invoices collected in 90 days</li>
                      <li>Based on historical payment patterns</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">
                      Outflow Assumptions:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>40% of pending bills paid in 30 days</li>
                      <li>70% of pending bills paid in 60 days</li>
                      <li>95% of pending bills paid in 90 days</li>
                      <li>
                        Regular operating expenses continue at current rate
                      </li>
                    </ul>
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

export default CashFlowForecasting;
