import React, { useState, useEffect } from "react";
import { billAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";

const AgingDPO = () => {
  const [aging, setAging] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAging();
  }, []);

  const loadAging = async () => {
    try {
      const response = await billAPI.getAging();
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
    ? Object.values(aging).reduce((sum, val) => sum + val, 0)
    : 0;

  return (
    <div className="p-8" data-testid="aging-dpo-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#3A4E63" }}
        >
          Aging & DPO
        </h1>
        <p className="text-gray-600">
          Analyze payment delays and disbursement efficiency
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="chart-container" data-testid="aging-summary-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#3A4E63" }}
            >
              Aging Buckets
            </CardTitle>
            <CardDescription>Outstanding bills by age</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">0-30 Days</span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "#3A4E63" }}
                >
                  {formatCurrency(aging?.["0-30"])}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">31-60 Days</span>
                <span className="text-lg font-semibold text-orange-600">
                  {formatCurrency(aging?.["31-60"])}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">61-90 Days</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(aging?.["61-90"])}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">90+ Days</span>
                <span className="text-lg font-semibold text-red-700">
                  {formatCurrency(aging?.["90+"])}
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
          </CardContent>
        </Card>

        <Card className="chart-container" data-testid="dpo-metrics-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#3A4E63" }}
            >
              DPO Metrics
            </CardTitle>
            <CardDescription>Days Payable Outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Overall DPO</p>
                <p
                  className="text-5xl font-semibold"
                  style={{ color: "#3A4E63" }}
                >
                  38.2
                </p>
                <p className="text-sm text-gray-600 mt-2">days</p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">AP Turnover Ratio</span>
                  <span
                    className="text-lg font-semibold"
                    style={{ color: "#3A4E63" }}
                  >
                    9.5x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Timeliness</span>
                  <span className="text-lg font-semibold text-green-600">
                    92%
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

export default AgingDPO;
