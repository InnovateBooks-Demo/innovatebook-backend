import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../../utils/api";
import { toast } from "sonner";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const VarianceElite = () => {
  const [loading, setLoading] = useState(false);
  const [variance, setVariance] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  const loadVariance = async () => {
    setLoading(true);
    try {
      const response = await cashFlowAPI.getVariance({
        month: selectedMonth,
        year: selectedYear,
      });
      setVariance(response.data);
    } catch (error) {
      toast.error("Failed to load variance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVariance();
  }, [selectedMonth, selectedYear]);

  const actual = variance?.actual || 0;
  const budget = variance?.budget || 0;
  const diff = actual - budget;
  const percentVariance = budget ? ((diff / budget) * 100).toFixed(1) : 0;
  const isFavorable = diff >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Variance Analysis
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Actual vs Budget Performance
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-[#033F99]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-500/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg inline-block mb-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">
            Budget
          </p>
          <p className="text-3xl font-black text-blue-900">
            ₹{(budget / 10000000).toFixed(2)}Cr
          </p>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#022E75] rounded-2xl shadow-lg inline-block mb-3">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
            Actual
          </p>
          <p className="text-3xl font-black text-[#033F99]">
            ₹{(actual / 10000000).toFixed(2)}Cr
          </p>
        </div>

        <div
          className={`relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 shadow-xl ${isFavorable ? "border-emerald-500/50" : "border-red-500/50"
            }`}
        >
          <div
            className={`p-3 rounded-2xl shadow-lg inline-block mb-3 ${isFavorable
                ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                : "bg-gradient-to-br from-red-600 to-red-700"
              }`}
          >
            {isFavorable ? (
              <TrendingUp className="h-6 w-6 text-white" />
            ) : (
              <TrendingDown className="h-6 w-6 text-white" />
            )}
          </div>
          <p
            className={`text-sm font-bold uppercase tracking-wider mb-1 ${isFavorable ? "text-emerald-900" : "text-red-900"
              }`}
          >
            Variance
          </p>
          <p
            className={`text-3xl font-black ${isFavorable ? "text-emerald-900" : "text-red-900"
              }`}
          >
            ₹{Math.abs(diff / 10000000).toFixed(2)}Cr
          </p>
        </div>

        <div
          className={`relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 shadow-xl ${isFavorable ? "border-emerald-500/50" : "border-red-500/50"
            }`}
        >
          <div
            className={`p-3 rounded-2xl shadow-lg inline-block mb-3 ${isFavorable
                ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                : "bg-gradient-to-br from-red-600 to-red-700"
              }`}
          >
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <p
            className={`text-sm font-bold uppercase tracking-wider mb-1 ${isFavorable ? "text-emerald-900" : "text-red-900"
              }`}
          >
            Variance %
          </p>
          <p
            className={`text-3xl font-black ${isFavorable ? "text-emerald-900" : "text-red-900"
              }`}
          >
            {percentVariance}%
          </p>
        </div>
      </div>

      {/* Status Message */}
      <div
        className={`p-6 rounded-3xl border-2 shadow-xl mb-8 ${isFavorable
            ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-500"
            : "bg-gradient-to-r from-red-50 to-red-100 border-red-500"
          }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${isFavorable ? "bg-emerald-500" : "bg-red-500"
              }`}
          >
            {isFavorable ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-white" />
            )}
          </div>
          <div>
            <p
              className={`text-xl font-bold ${isFavorable ? "text-emerald-900" : "text-red-900"
                }`}
            >
              {isFavorable ? "Favorable Variance" : "Unfavorable Variance"}
            </p>
            <p
              className={`text-sm ${isFavorable ? "text-emerald-700" : "text-red-700"
                }`}
            >
              {isFavorable
                ? `Performance is ${percentVariance}% above budget. Excellent cash management!`
                : `Performance is ${Math.abs(percentVariance)}% below budget. Review required.`}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#033F99] mb-6">
          Budget vs Actual Comparison
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={[
              {
                name: months[selectedMonth - 1],
                Budget: budget,
                Actual: actual,
              },
            ]}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#033F99"
              opacity={0.2}
            />
            <XAxis dataKey="name" stroke="#033F99" />
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
            <Bar dataKey="Budget" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Actual" fill="#033F99" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VarianceElite;
