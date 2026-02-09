import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { TrendingUp, Scale, Download, Printer } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BalanceSheetElite = () => {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatement();
  }, []);

  const fetchStatement = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/financial-reports/balance-sheet`,
      );
      if (response.data.success) {
        setStatement(response.data.statement);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load Balance Sheet");
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-indigo-600 border-r-transparent mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">
            Loading Balance Sheet...
          </p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Balance Sheet
              </h1>
              <p className="text-gray-600">
                As per Companies Act 2013 - Schedule III
              </p>
              <p className="text-sm text-indigo-600 font-semibold mt-1">
                As at 31st March 2025
              </p>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-[rgba(3,63,153,0.25)]/50">
            <p className="text-xs font-medium text-[#033F99] uppercase tracking-wide mb-2">
              Total Assets
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {formatAmount(statement.assets.total)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">
              Shareholders' Funds
            </p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatAmount(
                statement.equity_and_liabilities.shareholders_funds.total,
              )}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">
              Total Liabilities
            </p>
            <p className="text-2xl font-bold text-purple-900">
              {formatAmount(statement.equity_and_liabilities.total)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* ASSETS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">ASSETS</h2>
            </div>

            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                {/* Non-Current Assets */}
                <tr className="bg-[rgba(3,63,153,0.08)]/50">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    I. Non-Current Assets
                  </td>
                  <td className="px-6 py-3"></td>
                </tr>

                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Property, Plant & Equipment
                  </td>
                  <td className="px-6 py-2"></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-2 pl-16 text-xs text-gray-600">
                    Gross Block
                  </td>
                  <td className="px-6 py-2 text-right text-xs text-gray-700">
                    {formatAmount(
                      statement.assets.non_current_assets
                        .property_plant_equipment.gross_block,
                    )}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-2 pl-16 text-xs text-gray-600">
                    Less: Accumulated Depreciation
                  </td>
                  <td className="px-6 py-2 text-right text-xs text-gray-700">
                    (
                    {formatAmount(
                      Math.abs(
                        statement.assets.non_current_assets
                          .property_plant_equipment.accumulated_depreciation,
                      ),
                    )}
                    )
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-16 text-sm font-semibold text-gray-800">
                    Net Block
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-semibold text-gray-900">
                    {formatAmount(
                      statement.assets.non_current_assets
                        .property_plant_equipment.net_block,
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Capital Work-in-Progress
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.non_current_assets.capital_wip,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Intangible Assets
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.non_current_assets.intangible_assets,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Non-Current Investments
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.non_current_assets
                        .non_current_investments,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Deferred Tax Assets
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.non_current_assets.deferred_tax_assets,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Long-term Loans & Advances
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.non_current_assets
                        .long_term_loans_advances,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Other Non-Current Assets
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.non_current_assets
                        .other_non_current_assets,
                    )}
                  </td>
                </tr>

                <tr className="bg-blue-100">
                  <td className="px-6 py-3 pl-10 text-sm font-bold text-blue-900">
                    Total Non-Current Assets
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-blue-900">
                    {formatAmount(statement.assets.non_current_assets.total)}
                  </td>
                </tr>

                {/* Current Assets */}
                <tr className="bg-teal-50/50">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    II. Current Assets
                  </td>
                  <td className="px-6 py-3"></td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Inventories
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(statement.assets.current_assets.inventories)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Trade Receivables
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.current_assets.trade_receivables,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Cash and Cash Equivalents
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.current_assets.cash_and_equivalents,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Short-term Loans & Advances
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.current_assets.short_term_loans_advances,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Other Current Assets
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.assets.current_assets.other_current_assets,
                    )}
                  </td>
                </tr>

                <tr className="bg-teal-100">
                  <td className="px-6 py-3 pl-10 text-sm font-bold text-teal-900">
                    Total Current Assets
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-teal-900">
                    {formatAmount(statement.assets.current_assets.total)}
                  </td>
                </tr>

                {/* Total Assets */}
                <tr className="bg-gradient-to-r from-blue-200 to-teal-200 border-t-4 border-blue-500">
                  <td className="px-6 py-4 text-base font-black text-blue-900">
                    TOTAL ASSETS
                  </td>
                  <td className="px-6 py-4 text-right text-base font-black text-blue-900">
                    {formatAmount(statement.assets.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* EQUITY AND LIABILITIES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                EQUITY AND LIABILITIES
              </h2>
            </div>

            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                {/* Shareholders' Funds */}
                <tr className="bg-emerald-50/50">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    I. Shareholders' Funds
                  </td>
                  <td className="px-6 py-3"></td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Share Capital
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.shareholders_funds
                        .share_capital,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Reserves and Surplus
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.shareholders_funds
                        .reserves_and_surplus,
                    )}
                  </td>
                </tr>
                <tr className="bg-emerald-100">
                  <td className="px-6 py-3 pl-10 text-sm font-bold text-emerald-900">
                    Total Shareholders' Funds
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-emerald-900">
                    {formatAmount(
                      statement.equity_and_liabilities.shareholders_funds.total,
                    )}
                  </td>
                </tr>

                {/* Non-Current Liabilities */}
                <tr className="bg-orange-50/50">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    II. Non-Current Liabilities
                  </td>
                  <td className="px-6 py-3"></td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Long-term Borrowings
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.non_current_liabilities
                        .long_term_borrowings,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Deferred Tax Liabilities
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.non_current_liabilities
                        .deferred_tax_liabilities,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Long-term Provisions
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.non_current_liabilities
                        .long_term_provisions,
                    )}
                  </td>
                </tr>
                <tr className="bg-orange-100">
                  <td className="px-6 py-3 pl-10 text-sm font-bold text-orange-900">
                    Total Non-Current Liabilities
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-orange-900">
                    {formatAmount(
                      statement.equity_and_liabilities.non_current_liabilities
                        .total,
                    )}
                  </td>
                </tr>

                {/* Current Liabilities */}
                <tr className="bg-purple-50/50">
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    III. Current Liabilities
                  </td>
                  <td className="px-6 py-3"></td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Short-term Borrowings
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.current_liabilities
                        .short_term_borrowings,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Trade Payables
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.current_liabilities
                        .trade_payables,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Other Current Liabilities
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.current_liabilities
                        .other_current_liabilities,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 pl-10 text-sm text-gray-700">
                    Short-term Provisions
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                    {formatAmount(
                      statement.equity_and_liabilities.current_liabilities
                        .short_term_provisions,
                    )}
                  </td>
                </tr>
                <tr className="bg-purple-100">
                  <td className="px-6 py-3 pl-10 text-sm font-bold text-purple-900">
                    Total Current Liabilities
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-purple-900">
                    {formatAmount(
                      statement.equity_and_liabilities.current_liabilities
                        .total,
                    )}
                  </td>
                </tr>

                {/* Total */}
                <tr className="bg-gradient-to-r from-emerald-200 to-purple-200 border-t-4 border-emerald-500">
                  <td className="px-6 py-4 text-base font-black text-emerald-900">
                    TOTAL EQUITY & LIABILITIES
                  </td>
                  <td className="px-6 py-4 text-right text-base font-black text-emerald-900">
                    {formatAmount(statement.equity_and_liabilities.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Notes:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              • The above statement is prepared as per Schedule III of the
              Companies Act, 2013.
            </li>
            <li>
              • Figures for the previous year have been regrouped/reclassified
              wherever necessary.
            </li>
            <li>
              • The company has adopted Indian Accounting Standards (Ind AS) for
              preparation of financial statements.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetElite;
