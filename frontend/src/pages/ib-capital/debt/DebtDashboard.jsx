import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DebtDashboard = () => {
  const [debts, setDebts] = useState([]);
  const [covenants, setCovenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("debts");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [debtsRes, covenantsRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-capital/debts`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
        fetch(`${API_URL}/api/ib-capital/covenants`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        }),
      ]);
      const debtsData = await debtsRes.json();
      const covenantsData = await covenantsRes.json();
      setDebts(debtsData.debts || []);
      setCovenants(covenantsData.covenants || []);
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

  const totalOutstanding = debts.reduce(
    (sum, d) => sum + (d.outstanding_principal || 0),
    0,
  );
  const activeDebts = debts.filter((d) => d.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="debt-dashboard">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Capital
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Debt</h1>
              <p className="text-gray-500">Loans, Notes & Covenants</p>
            </div>
          </div>
          <Link
            to="/ib-capital/debt/create"
            className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Debt
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Debts</p>
          <p className="text-2xl font-bold text-gray-900">{activeDebts}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Covenants</p>
          <p className="text-2xl font-bold text-gray-900">{covenants.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Covenant Warnings</p>
          <p className="text-2xl font-bold text-yellow-600">
            {covenants.filter((c) => c.current_status === "warning").length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4">
          <div className="flex gap-6">
            {["debts", "covenants"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                    ? "border-[#033F99] text-[#033F99]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab === "debts" ? "Debt Instruments" : "Covenants"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "debts" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Lender
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Principal
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Outstanding
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {debts.map((debt) => (
                  <tr
                    key={debt.debt_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {debt.lender_name}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(debt.principal_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(debt.outstanding_principal)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {debt.interest_rate}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${debt.status === "active"
                            ? "bg-green-100 text-green-700"
                            : debt.status === "repaid"
                              ? "bg-gray-100 text-gray-700"
                              : debt.status === "defaulted"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {debt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/ib-capital/debt/${debt.debt_id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg inline-block"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "covenants" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Threshold
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Frequency
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {covenants.map((cov) => (
                  <tr
                    key={cov.covenant_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {cov.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${cov.covenant_type === "financial"
                            ? "bg-blue-100 text-blue-700"
                            : cov.covenant_type === "operational"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {cov.covenant_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                      {cov.threshold}
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">
                      {cov.measurement_frequency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtDashboard;
