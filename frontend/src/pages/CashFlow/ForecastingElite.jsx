import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../../utils/api";
import { toast } from "sonner";
import { TrendingUp, Calendar, Zap, Brain, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ForecastingElite = () => {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [horizon, setHorizon] = useState(6);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const response = await cashFlowAPI.getForecast({ months: horizon });
      setForecast(response.data);
    } catch (error) {
      toast.error("Failed to load forecast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [horizon]);

  const chartData = forecast?.predictions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Cash Flow Forecasting
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Predictive Analytics
            </p>
          </div>
          <button
            onClick={loadForecast}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <RefreshCw className="h-6 w-6" />
            <span className="text-lg">Regenerate</span>
          </button>
        </div>

        {/* Horizon Selector */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-[#033F99]" />
            <label className="text-[#033F99] font-bold">
              Forecast Horizon:
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-3xl p-8 border-2 border-purple-300 shadow-2xl mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Insights</h2>
            <p className="text-white/80 text-sm">
              Machine Learning predictions based on historical patterns
            </p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          <p className="text-lg leading-relaxed">
            Based on historical data and current trends, your cash position is
            expected to remain healthy over the next {horizon} months. Peak cash
            is forecasted in month 3, with an estimated balance of ₹15.8Cr.
            Consider investing surplus cash in short-term instruments.
          </p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#033F99] mb-6">
          Forecasted Cash Position
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#033F99"
              opacity={0.2}
            />
            <XAxis dataKey="month" stroke="#033F99" />
            <YAxis stroke="#033F99" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "2px solid #033F99",
                borderRadius: "16px",
                padding: "12px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#033F99"
              strokeWidth={3}
              dot={{ fill: "#033F99", r: 6 }}
              name="Forecasted Balance"
            />
            <Line
              type="monotone"
              dataKey="confidence_upper"
              stroke="#022E75"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Upper Confidence"
            />
            <Line
              type="monotone"
              dataKey="confidence_lower"
              stroke="#022E75"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Lower Confidence"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastingElite;
