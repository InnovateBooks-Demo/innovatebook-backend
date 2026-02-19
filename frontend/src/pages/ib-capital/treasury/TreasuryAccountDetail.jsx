import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TreasuryAccountDetail = () => {
  const { account_id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccount();
  }, [account_id]);

  const fetchAccount = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/treasury/accounts/${account_id}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount?.toLocaleString("en-IN") || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Treasury account not found</p>
      </div>
    );
  }

  const inflows = account.inflows || [];
  const outflows = account.outflows || [];
  const totalInflows = inflows.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalOutflows = outflows.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="treasury-account-detail"
    >
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/treasury"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Treasury
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {account.bank_name}
              </h1>
              <p className="text-gray-500 font-mono">
                {account.account_number}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Account
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(account.balance)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Account Type</p>
          <p className="text-2xl font-bold capitalize text-purple-600">
            {account.account_type}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Inflows</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalInflows)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Outflows</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutflows)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Bank Name</span>
              <span className="font-medium text-gray-900">
                {account.bank_name}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Account Number</span>
              <span className="font-medium text-gray-900 font-mono">
                {account.account_number}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Account Type</span>
              <span
                className={`px-2 py-1 text-xs rounded-full capitalize ${account.account_type === "operating"
                    ? "bg-blue-100 text-blue-700"
                    : account.account_type === "capital"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
              >
                {account.account_type}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Currency</span>
              <span className="font-medium text-gray-900">
                {account.currency}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Status</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${account.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                  }`}
              >
                {account.status}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {[
              ...inflows.map((i) => ({ ...i, type: "inflow" })),
              ...outflows.map((o) => ({ ...o, type: "outflow" })),
            ]
              .slice(0, 10)
              .map((txn) => (
                <div
                  key={
                    txn.inflow_id ||
                    txn.outflow_id ||
                    `${txn.type}-${txn.amount}-${txn.received_date || txn.requested_date}`
                  }
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {txn.type === "inflow" ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownRight className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {txn.description ||
                          (txn.type === "inflow"
                            ? txn.source_type
                            : txn.purpose_type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {txn.received_date || txn.requested_date || "N/A"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium ${txn.type === "inflow" ? "text-green-600" : "text-red-600"}`}
                  >
                    {txn.type === "inflow" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            {inflows.length === 0 && outflows.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                No transactions found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inflows Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Cash Inflows</h2>
        </div>
        <div className="overflow-x-auto">
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
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    +{formatCurrency(inflow.amount)}
                  </td>
                </tr>
              ))}
              {inflows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No inflows recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outflows Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Cash Outflows</h2>
        </div>
        <div className="overflow-x-auto">
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
                  <td className="py-3 px-4 text-right font-medium text-red-600">
                    -{formatCurrency(outflow.amount)}
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
              {outflows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No outflows recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TreasuryAccountDetail;
