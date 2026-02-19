import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  PieChart,
  User,
  Mail,
  MapPin,
  Calendar,
  Edit,
  TrendingUp,
} from "lucide-react";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OwnerDetail = () => {
  const { owner_id } = useParams();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwner();
  }, [owner_id]);

  const fetchOwner = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/owners/${owner_id}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      const data = await response.json();
      setOwner(data);
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

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Owner not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="owner-detail">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/ownership"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ownership
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {owner.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{owner.name}</h1>
              <p className="text-gray-500 capitalize">
                {owner.owner_type} • {owner.status}
              </p>
            </div>
          </div>
          <Link
            to={`/ib-capital/ownership/${owner_id}/edit`}
            className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Shares</p>
          <p className="text-2xl font-bold text-gray-900">
            {owner.total_shares?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Ownership %</p>
          <p className="text-2xl font-bold text-[#033F99]">
            {owner.ownership_percentage}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Estimated Value</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(owner.total_shares * 10)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Owner Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Owner Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {owner.owner_type}
                </p>
              </div>
            </div>
            {owner.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{owner.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium text-gray-900">{owner.country}</p>
              </div>
            </div>
            {owner.tax_identifier && (
              <div className="flex items-center gap-3">
                <PieChart className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tax ID</p>
                  <p className="font-medium text-gray-900">
                    {owner.tax_identifier}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Holdings</h2>
          {owner.holdings?.length > 0 ? (
            <div className="space-y-3">
              {owner.holdings.map((holding) => (
                <div
                  key={holding.lot_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {holding.quantity?.toLocaleString()} shares
                    </p>
                    <p className="text-xs text-gray-500">
                      Issued: {holding.issue_date}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${holding.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {holding.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No holdings found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDetail;
