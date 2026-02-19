import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TreasuryDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [liquidity, setLiquidity] = useState(null);
  const [inflows, setInflows] = useState([]);
  const [outflows, setOutflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("accounts");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, liquidityRes, inflowsRes, outflowsRes] =
        await Promise.all([
          fetch(`${API_URL}/api/ib-capital/treasury/accounts`, {
            headers: { Authorization: `Bearer ${authService.getToken()}` },
          }),
          fetch(`${API_URL}/api/ib-capital/treasury/liquidity`, {
            headers: { Authorization: `Bearer ${authService.getToken()}` },
          }),
          fetch(`${API_URL}/api/ib-capital/treasury/inflows`, {
            headers: { Authorization: `Bearer ${authService.getToken()}` },
          }),
          fetch(`${API_URL}/api/ib-capital/treasury/outflows`, {
            headers: { Authorization: `Bearer ${authService.getToken()}` },
          }),
        ]);
      setAccounts((await accountsRes.json()).accounts || []);
      setLiquidity(await liquidityRes.json());
      setInflows((await inflowsRes.json()).inflows || []);
      setOutflows((await outflowsRes.json()).outflows || []);
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

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="treasury-dashboard"
    >
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Treasury</h1>
              <p className="text-gray-500">Cash & Liquidity Management</p>
            </div>
          </div>
          <Link
            to="/ib-capital/treasury/request-outflow"
            className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Request Outflow
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Cash</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(liquidity?.total_cash)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Available Cash</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(liquidity?.available_cash)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Restricted Cash</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(liquidity?.restricted_cash)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Runway</p>
          <p className="text-2xl font-bold text-purple-600">
            {liquidity?.runway_months} months
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4">
          <div className="flex gap-6">
            {["accounts", "inflows", "outflows"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                    ? "border-[#033F99] text-[#033F99]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab === "accounts"
                  ? "Bank Accounts"
                  : tab === "inflows"
                    ? "Cash Inflows"
                    : "Cash Outflows"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "accounts" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Bank
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr
                    key={acc.account_id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/ib-capital/treasury/${acc.account_id}`)
                    }
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {acc.bank_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                      {acc.account_number}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${acc.account_type === "operating"
                            ? "bg-blue-100 text-blue-700"
                            : acc.account_type === "capital"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                      >
                        {acc.account_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(acc.balance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        {acc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "inflows" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {inflows.map((inflow) => (
                  <tr
                    key={inflow.inflow_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {inflow.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${inflow.source_type === "equity"
                            ? "bg-green-100 text-green-700"
                            : inflow.source_type === "debt"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {inflow.source_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {inflow.received_date}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600 flex items-center justify-end gap-1">
                      <ArrowDownRight className="w-4 h-4" />
                      {formatCurrency(inflow.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "outflows" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Purpose
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {outflows.map((outflow) => (
                  <tr
                    key={outflow.outflow_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {outflow.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${outflow.purpose_type === "debt_repayment"
                            ? "bg-orange-100 text-orange-700"
                            : outflow.purpose_type === "capex"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {outflow.purpose_type?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {outflow.requested_date}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-red-600 flex items-center justify-end gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      {formatCurrency(outflow.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {outflow.status === "executed" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {outflow.status === "approved" && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {outflow.status === "requested" && (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        {outflow.status === "blocked" && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${outflow.status === "executed"
                              ? "bg-green-100 text-green-700"
                              : outflow.status === "approved"
                                ? "bg-blue-100 text-blue-700"
                                : outflow.status === "requested"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                        >
                          {outflow.status}
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

export default TreasuryDashboard;
