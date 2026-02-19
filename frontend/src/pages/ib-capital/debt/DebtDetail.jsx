import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DebtDetail = () => {
  const { debt_id } = useParams();
  const [debt, setDebt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebt();
  }, [debt_id]);

  const fetchDebt = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/debts/${debt_id}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      setDebt(await response.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount?.toLocaleString("en-IN") || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Debt instrument not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="debt-detail">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/debt"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Debt
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {debt.lender_name}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${debt.debt_type === "term_loan"
                      ? "bg-blue-100 text-blue-700"
                      : debt.debt_type === "convertible_note"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {debt.debt_type?.replace("_", " ")}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${debt.status === "active"
                      ? "bg-green-100 text-green-700"
                      : debt.status === "repaid"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {debt.status}
                </span>
              </div>
            </div>
          </div>
          {debt.debt_type === "convertible_note" &&
            debt.status === "active" && (
              <Link
                to={`/ib-capital/debt/${debt.debt_id}/convert`}
                className="mt-4 w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Convert to Equity
              </Link>
            )}
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Principal Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(debt.principal_amount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Outstanding Principal</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(debt.outstanding_principal)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
          <p className="text-2xl font-bold text-[#033F99]">
            {debt.interest_rate}%{" "}
            <span className="text-sm font-normal text-gray-500">
              {debt.interest_type}
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Accrued Interest</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(debt.accrued_interest)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debt Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Debt Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Start Date</span>
              <span className="font-medium text-gray-900">
                {debt.start_date}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Maturity Date</span>
              <span className="font-medium text-gray-900">
                {debt.maturity_date}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Currency</span>
              <span className="font-medium text-gray-900">{debt.currency}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Paid to Date</span>
              <span className="font-medium text-green-600">
                {formatCurrency(
                  debt.principal_amount - debt.outstanding_principal,
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Covenants */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Covenants ({debt.covenants?.length || 0})
          </h2>
          {debt.covenants?.length > 0 ? (
            <div className="space-y-3">
              {debt.covenants.map((cov) => (
                <div
                  key={cov.covenant_id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {cov.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {cov.threshold} • {cov.measurement_frequency}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {cov.current_status === "compliant" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {cov.current_status === "warning" && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      {cov.current_status === "breach" && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${cov.current_status === "compliant"
                            ? "bg-green-100 text-green-700"
                            : cov.current_status === "warning"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {cov.current_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No covenants for this debt</p>
          )}
        </div>
      </div>

      {/* Repayment Schedule */}
      {debt.repayment_schedule?.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Repayment Schedule
          </h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Principal
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Interest
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {debt.repayment_schedule.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-3 px-4 text-gray-900">{item.due_date}</td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(item.principal_due)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(item.interest_due)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${item.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : item.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DebtDetail;
