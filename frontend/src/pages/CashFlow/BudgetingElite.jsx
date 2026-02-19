import React, { useState, useEffect } from "react";
import { cashFlowAPI } from "../../utils/api";
import { toast } from "sonner";
import {
  Calendar,
  DollarSign,
  Plus,
  Save,
  Edit2,
  Trash2,
  TrendingUp,
} from "lucide-react";

const BudgetingElite = () => {
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() + i,
  );

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const response = await cashFlowAPI.getBudgets({ year: selectedYear });
      setBudgets(response.data.budgets || []);
    } catch (error) {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedYear]);

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Cash Flow Budgeting
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Plan and manage your cash flow budgets
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
            <Plus className="h-6 w-6" />
            <span className="text-lg">Create Budget</span>
          </button>
        </div>

        {/* Year Selector */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-[#033F99]" />
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

      {/* Total Budget Card */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#033F99]/10 to-transparent rounded-full -mr-32 -mt-32"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-2">
              Total Annual Budget
            </p>
            <p className="text-5xl font-black text-[#033F99]">
              ₹{(totalBudget / 10000000).toFixed(2)}Cr
            </p>
            <p className="text-sm text-emerald-700 mt-2">FY {selectedYear}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#033F99] to-[#022E75] rounded-3xl shadow-2xl">
            <DollarSign className="h-16 w-16 text-white" />
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#033F99] mb-6">
          Monthly Budgets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((month, idx) => {
            const budget = budgets.find((b) => b.month === idx + 1);
            const amount = budget?.amount || 0;
            return (
              <div
                key={month}
                className="p-6 bg-gradient-to-br from-white to-[#C4D9F4]/30 rounded-2xl border-2 border-[#033F99]/30 hover:border-[#033F99] hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#033F99] uppercase">
                    {month} {selectedYear}
                  </p>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-[#033F99]/10 rounded-lg transition-all">
                      <Edit2 className="h-4 w-4 text-[#033F99]" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-black text-[#033F99]">
                  ₹{(amount / 100000).toFixed(2)}L
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Budget set</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetingElite;
