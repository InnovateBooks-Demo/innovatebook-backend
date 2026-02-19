import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ReturnsDashboard = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ib-capital/returns`, {
        headers: { Authorization: `Bearer ${authService.getToken()}` },
      });
      const data = await response.json();
      setReturns(data.returns || []);
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

  const filteredReturns =
    filter === "all"
      ? returns
      : returns.filter((r) => r.return_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033F99]"></div>
      </div>
    );
  }

  const totalDeclared = returns.reduce(
    (sum, r) => sum + (r.declared_amount || 0),
    0,
  );
  const totalSettled = returns.reduce(
    (sum, r) => sum + (r.settled_amount || 0),
    0,
  );
  const dividends = returns.filter((r) => r.return_type === "dividend");
  const interest = returns.filter((r) => r.return_type === "interest");

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      data-testid="returns-dashboard"
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Returns</h1>
              <p className="text-gray-500">Dividends, Interest & Buybacks</p>
            </div>
          </div>
          <Link
            to="/ib-capital/returns/declare"
            className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Declare Return
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Declared</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalDeclared)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Settled</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalSettled)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Dividends</p>
          <p className="text-2xl font-bold text-purple-600">
            {dividends.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Interest Payments</p>
          <p className="text-2xl font-bold text-orange-600">
            {interest.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex gap-2">
            {["all", "dividend", "interest", "buyback"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${filter === type
                    ? "bg-[#033F99] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {type === "all" ? "All Returns" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Declaration Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Payment Date
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Declared
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Settled
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
              {filteredReturns.map((ret) => (
                <tr
                  key={ret.return_id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${ret.return_type === "dividend"
                          ? "bg-purple-100 text-purple-700"
                          : ret.return_type === "interest"
                            ? "bg-orange-100 text-orange-700"
                            : ret.return_type === "buyback"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {ret.return_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {ret.declaration_date}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {ret.payment_date || "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(ret.declared_amount)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {formatCurrency(ret.settled_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {ret.status === "settled" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {ret.status === "approved" && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                      {ret.status === "declared" && (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      {ret.status === "cancelled" && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${ret.status === "settled"
                            ? "bg-green-100 text-green-700"
                            : ret.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : ret.status === "declared"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                      >
                        {ret.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/ib-capital/returns/${ret.return_id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg inline-block"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReturnsDashboard;
