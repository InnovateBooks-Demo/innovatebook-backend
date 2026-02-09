import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Play,
  Trash2,
  Clock,
  TrendingDown,
  Server,
  FileCode,
  Building,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AssetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetDetail();
  }, [id]);

  const fetchAssetDetail = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAsset(data.data);
      }
    } catch (error) {
      toast.error("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  const handleDepreciate = async () => {
    const period = prompt("Enter period (e.g., 2025-01):");
    if (!period) return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-finance/assets/${id}/depreciate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ period }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Depreciation: ${formatCurrency(data.data.depreciation_amount)}`,
        );
        fetchAssetDetail();
      }
    } catch (error) {
      toast.error("Failed to run depreciation");
    }
  };

  const handleDispose = async () => {
    const proceeds = prompt("Enter disposal proceeds amount:");
    if (!proceeds) return;
    const reason = prompt("Enter disposal reason:");

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-finance/assets/${id}/dispose`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proceeds_amount: parseFloat(proceeds),
            reason,
          }),
        },
      );
      if (response.ok) {
        toast.success("Asset disposed");
        fetchAssetDetail();
      }
    } catch (error) {
      toast.error("Failed to dispose asset");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      suspended: "bg-yellow-100 text-yellow-700",
      disposed: "bg-gray-100 text-gray-500",
      fully_depreciated: "bg-blue-100 text-blue-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "tangible":
        return Server;
      case "intangible":
        return FileCode;
      default:
        return Building;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDepreciationPercentage = () => {
    if (!asset) return 0;
    const total = asset.capitalization_value - asset.residual_value;
    if (total <= 0) return 100;
    return Math.round((asset.accumulated_depreciation / total) * 100);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  if (!asset)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Asset not found
      </div>
    );

  const TypeIcon = getTypeIcon(asset.asset_type);
  const depPct = calculateDepreciationPercentage();

  return (
    <div className="min-h-screen bg-gray-50" data-testid="asset-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/ib-finance/assets")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              IB Finance → Assets → {asset.asset_id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center">
                <TypeIcon className="h-7 w-7 text-cyan-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {asset.asset_name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusBadge(asset.status)}`}
                  >
                    {asset.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {asset.asset_id} • {asset.asset_category}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {asset.status === "active" && (
                <>
                  <button
                    onClick={() => navigate(`/ib-finance/assets/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={handleDepreciate}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                  >
                    <Play className="h-4 w-4" /> Run Depreciation
                  </button>
                  <button
                    onClick={handleDispose}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Dispose
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Asset Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Asset Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {asset.asset_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">
                    {asset.asset_category || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acquisition Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(asset.acquisition_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {asset.location || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium text-gray-900">
                    {asset.serial_number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium text-gray-900">
                    {asset.source_type || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Depreciation Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Depreciation Details
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Depreciation Method</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {asset.depreciation_method?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Useful Life</p>
                  <p className="font-medium text-gray-900">
                    {asset.useful_life_months} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Residual Value</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(asset.residual_value)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Depreciation</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(
                      (asset.capitalization_value - asset.residual_value) /
                        asset.useful_life_months,
                    )}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Depreciation Progress
                  </span>
                  <span className="text-sm font-bold text-cyan-600">
                    {depPct}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${depPct >= 100 ? "bg-[rgba(3,63,153,0.08)]0" : "bg-cyan-500"}`}
                    style={{ width: `${Math.min(depPct, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>
                    Accumulated:{" "}
                    {formatCurrency(asset.accumulated_depreciation)}
                  </span>
                  <span>
                    Remaining:{" "}
                    {formatCurrency(
                      asset.capitalization_value -
                        asset.residual_value -
                        asset.accumulated_depreciation,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Depreciation Schedule */}
            {asset.depreciation_schedule?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Depreciation Schedule
                </h3>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                        Period
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                        Depreciation
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                        Accumulated
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                        NBV
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {asset.depreciation_schedule.map((entry, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-gray-900">
                          {entry.period}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-600">
                          {formatCurrency(entry.depreciation_amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatCurrency(entry.accumulated_depreciation)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-cyan-600">
                          {formatCurrency(entry.net_book_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Value Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Value Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Capitalization Value</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(asset.capitalization_value)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Accumulated Depreciation
                  </span>
                  <span className="font-bold text-amber-600">
                    - {formatCurrency(asset.accumulated_depreciation)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Net Book Value
                  </span>
                  <span className="font-bold text-2xl text-cyan-600">
                    {formatCurrency(asset.net_book_value)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div
              className={`rounded-xl p-6 text-white ${
                asset.status === "active"
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : asset.status === "fully_depreciated"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-gray-500 to-gray-600"
              }`}
            >
              <Clock className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2 capitalize">
                {asset.status?.replace("_", " ")}
              </h3>
              <p className="text-sm text-white/80">
                {asset.status === "active" &&
                  "Asset is actively depreciating. Run depreciation monthly."}
                {asset.status === "fully_depreciated" &&
                  "Asset has been fully depreciated to residual value."}
                {asset.status === "disposed" &&
                  `Disposed on ${formatDate(asset.disposed_at)}`}
              </p>
            </div>

            {/* Audit */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Audit Trail</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900">
                    {formatDate(asset.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created By</span>
                  <span className="text-gray-900">{asset.created_by}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
