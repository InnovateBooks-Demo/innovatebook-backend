import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ReturnDetail = () => {
  const { return_id } = useParams();
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturn();
  }, [return_id]);

  const fetchReturn = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/returns/${return_id}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      setReturnData(await response.json());
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63]"></div>
      </div>
    );
  }

  if (!returnData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Return declaration not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="return-detail">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/returns"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Returns
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {returnData.return_type} Declaration
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {returnData.status === "settled" && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {returnData.status === "approved" && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
                {returnData.status === "declared" && (
                  <Clock className="w-4 h-4 text-yellow-500" />
                )}
                {returnData.status === "cancelled" && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    returnData.status === "settled"
                      ? "bg-green-100 text-green-700"
                      : returnData.status === "approved"
                        ? "bg-blue-100 text-blue-700"
                        : returnData.status === "declared"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {returnData.status}
                </span>
              </div>
            </div>
          </div>
          {returnData.status === "declared" && (
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          )}
          {returnData.status === "approved" && (
            <button className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Settle
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Declared Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(returnData.declared_amount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Settled Amount</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(returnData.settled_amount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Declaration Date</p>
          <p className="text-2xl font-bold text-gray-900">
            {returnData.declaration_date}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Payment Date</p>
          <p className="text-2xl font-bold text-[#3A4E63]">
            {returnData.payment_date || "TBD"}
          </p>
        </div>
      </div>

      {/* Entitlements */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#3A4E63]" />
          Entitlements ({returnData.entitlements?.length || 0} shareholders)
        </h2>
        {returnData.entitlements?.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Shareholder
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Ownership %
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Entitled Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {returnData.entitlements.map((ent) => (
                <tr key={ent.owner_id} className="border-b border-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#033F99] font-semibold text-sm">
                        {ent.owner_name?.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {ent.owner_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {ent.ownership_percentage}%
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {formatCurrency(ent.entitled_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">No entitlements calculated</p>
        )}
      </div>
    </div>
  );
};

export default ReturnDetail;
