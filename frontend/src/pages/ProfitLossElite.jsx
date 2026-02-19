import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Printer } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProfitLossElite = () => {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatement();
  }, []);

  const fetchStatement = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/financial-reports/profit-loss`);
      if (response.data.success) {
        setStatement(response.data.statement);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load P&L statement');
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-indigo-600 border-r-transparent mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Loading P&L Statement...</p>
        </div>
      </div>
    );
  }

  if (!statement) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Profit & Loss Statement</h1>
              <p className="text-gray-600">As per Companies Act 2013 - Schedule III</p>
              <p className="text-sm text-indigo-600 font-semibold mt-1">For the year ended 31st March 2025</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-200/50">
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-indigo-900">{formatAmount(statement.total_income)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200/50">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-900">{formatAmount(statement.expenses.total)}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Profit Before Tax</p>
            <p className="text-2xl font-bold text-emerald-900">{formatAmount(statement.profit_before_tax)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Profit After Tax</p>
            <p className="text-2xl font-bold text-purple-900">{formatAmount(statement.profit_after_tax)}</p>
          </div>
        </div>

        {/* Statement Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Particulars</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Revenue from Operations */}
              <tr className="bg-indigo-50/30">
                <td className="px-6 py-3 text-sm font-bold text-gray-900">I. Revenue from Operations</td>
                <td className="px-6 py-3"></td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Sale of Products</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.revenue_from_operations.sale_of_products)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Sale of Services</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.revenue_from_operations.sale_of_services)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Other Operating Revenue</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.revenue_from_operations.other_operating_revenue)}</td>
              </tr>
              <tr className="bg-indigo-50">
                <td className="px-6 py-3 pl-12 text-sm font-bold text-indigo-900">Total Revenue from Operations</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-indigo-900">{formatAmount(statement.revenue_from_operations.total)}</td>
              </tr>

              {/* Other Income */}
              <tr className="bg-purple-50/30">
                <td className="px-6 py-3 text-sm font-bold text-gray-900">II. Other Income</td>
                <td className="px-6 py-3"></td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Interest Income</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.other_income.interest_income)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Dividend Income</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.other_income.dividend_income)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Other Income</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.other_income.miscellaneous_income)}</td>
              </tr>
              <tr className="bg-purple-50">
                <td className="px-6 py-3 pl-12 text-sm font-bold text-purple-900">Total Other Income</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-purple-900">{formatAmount(statement.other_income.total)}</td>
              </tr>

              {/* Total Income */}
              <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 border-t-2 border-indigo-300">
                <td className="px-6 py-4 text-base font-black text-indigo-900">III. Total Income (I + II)</td>
                <td className="px-6 py-4 text-right text-base font-black text-indigo-900">{formatAmount(statement.total_income)}</td>
              </tr>

              {/* Expenses */}
              <tr className="bg-red-50/30">
                <td className="px-6 py-3 text-sm font-bold text-gray-900">IV. Expenses</td>
                <td className="px-6 py-3"></td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Cost of Materials Consumed</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.expenses.cost_of_materials_consumed)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Purchases of Stock-in-Trade</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.expenses.purchases_of_stock)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Changes in Inventories</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.expenses.changes_in_inventories)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm font-semibold text-gray-800">Employee Benefits Expense</td>
                <td className="px-6 py-2 text-right text-sm font-semibold text-gray-900">{formatAmount(statement.expenses.employee_benefits.total)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm font-semibold text-gray-800">Finance Costs</td>
                <td className="px-6 py-2 text-right text-sm font-semibold text-gray-900">{formatAmount(statement.expenses.finance_costs.total)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Depreciation and Amortization</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.expenses.depreciation_amortization)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm font-semibold text-gray-800">Other Expenses</td>
                <td className="px-6 py-2 text-right text-sm font-semibold text-gray-900">{formatAmount(statement.expenses.other_expenses.total)}</td>
              </tr>
              <tr className="bg-red-50">
                <td className="px-6 py-3 pl-12 text-sm font-bold text-red-900">Total Expenses</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-red-900">{formatAmount(statement.expenses.total)}</td>
              </tr>

              {/* Profit Before Tax */}
              <tr className="bg-gradient-to-r from-emerald-100 to-teal-100 border-t-2 border-emerald-300">
                <td className="px-6 py-4 text-base font-black text-emerald-900">V. Profit Before Tax (III - IV)</td>
                <td className="px-6 py-4 text-right text-base font-black text-emerald-900">{formatAmount(statement.profit_before_tax)}</td>
              </tr>

              {/* Tax Expense */}
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Current Tax</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.tax_expense.current_tax)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-sm text-gray-700">Deferred Tax</td>
                <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">{formatAmount(statement.tax_expense.deferred_tax)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-3 pl-12 text-sm font-bold text-gray-900">VI. Total Tax Expense</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">{formatAmount(statement.tax_expense.total)}</td>
              </tr>

              {/* Profit After Tax */}
              <tr className="bg-gradient-to-r from-purple-100 to-pink-100 border-t-4 border-purple-400">
                <td className="px-6 py-5 text-lg font-black text-purple-900">VII. Profit/(Loss) for the Year (V - VI)</td>
                <td className="px-6 py-5 text-right text-lg font-black text-purple-900">{formatAmount(statement.profit_after_tax)}</td>
              </tr>

              {/* EPS */}
              <tr className="bg-indigo-50">
                <td className="px-6 py-3 text-sm font-bold text-indigo-900">VIII. Earnings Per Share (Basic & Diluted)</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-indigo-900">₹ {statement.earnings_per_share}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Notes:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• The above statement is prepared as per Schedule III of the Companies Act, 2013.</li>
            <li>• Figures for the previous year have been regrouped/reclassified wherever necessary.</li>
            <li>• The company has adopted Indian Accounting Standards (Ind AS) for preparation of financial statements.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossElite;