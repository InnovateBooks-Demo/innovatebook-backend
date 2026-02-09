import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Search,
  Plus,
  Eye,
  Play,
  Trash2,
  Server,
  FileCode,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AssetsDashboard = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchAssets();
  }, [statusFilter, typeFilter]);

  const fetchAssets = async () => {
    try {
      const token = authService.getToken();
      let url = `${API_URL}/api/ib-finance/assets`;
      const params = [];
      if (statusFilter !== "all") params.push(`status=${statusFilter}`);
      if (typeFilter !== "all") params.push(`asset_type=${typeFilter}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleDepreciate = async (assetId) => {
    const period = prompt("Enter period (e.g., 2025-01):");
    if (!period) return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-finance/assets/${assetId}/depreciate`,
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
        fetchAssets();
      } else {
        toast.error("Failed to run depreciation");
      }
    } catch (error) {
      toast.error("Failed to run depreciation");
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

  const getTypeBadge = (type) => {
    const styles = {
      tangible: "bg-blue-100 text-blue-700",
      intangible: "bg-purple-100 text-purple-700",
      rou: "bg-cyan-100 text-cyan-700",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
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
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDepreciationPercentage = (asset) => {
    const total = asset.capitalization_value - asset.residual_value;
    if (total <= 0) return 100;
    return Math.round((asset.accumulated_depreciation / total) * 100);
  };

  const filteredAssets = assets.filter(
    (asset) =>
      asset.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate totals
  const totalCapValue = assets.reduce(
    (sum, a) => sum + (a.capitalization_value || 0),
    0,
  );
  const totalNBV = assets.reduce((sum, a) => sum + (a.net_book_value || 0), 0);
  const totalAccDep = assets.reduce(
    (sum, a) => sum + (a.accumulated_depreciation || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="assets-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/ib-finance")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Assets</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Building2 className="h-7 w-7 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Capitalization, depreciation & asset lifecycle
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ib-finance/assets/create")}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Capitalize Asset
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Total Assets
            </p>
            <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {assets.filter((a) => a.status === "active").length} active
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Capitalization Value
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalCapValue)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Accumulated Depreciation
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(totalAccDep)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Net Book Value
            </p>
            <p className="text-2xl font-bold text-cyan-600">
              {formatCurrency(totalNBV)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Types</option>
            <option value="tangible">Tangible</option>
            <option value="intangible">Intangible</option>
            <option value="rou">Right-of-Use</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="fully_depreciated">Fully Depreciated</option>
            <option value="disposed">Disposed</option>
          </select>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Acquired
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Cap. Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Acc. Dep.
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  NBV
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Progress
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssets.map((asset) => {
                const TypeIcon = getTypeIcon(asset.asset_type);
                const depPct = calculateDepreciationPercentage(asset);

                return (
                  <tr key={asset.asset_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBadge(asset.asset_type).replace("text-", "bg-").replace("100", "50")}`}
                        >
                          <TypeIcon
                            className={`h-5 w-5 ${getTypeBadge(asset.asset_type).split(" ")[1]}`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {asset.asset_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {asset.asset_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadge(asset.asset_type)}`}
                      >
                        {asset.asset_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(asset.acquisition_date)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatCurrency(asset.capitalization_value)}
                    </td>
                    <td className="px-6 py-4 text-right text-amber-600">
                      {formatCurrency(asset.accumulated_depreciation)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-cyan-600">
                      {formatCurrency(asset.net_book_value)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${depPct >= 100 ? "bg-[rgba(3,63,153,0.08)]0" : "bg-cyan-500"}`}
                          style={{ width: `${Math.min(depPct, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        {depPct}%
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(asset.status)}`}
                      >
                        {asset.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/ib-finance/assets/${asset.asset_id}`)
                          }
                          className="p-2 text-gray-400 hover:text-[#033F99] hover:bg-[rgba(3,63,153,0.08)] rounded-lg"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {asset.status === "active" && (
                          <button
                            onClick={() => handleDepreciate(asset.asset_id)}
                            className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                            title="Run Depreciation"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {asset.status === "active" && (
                          <button
                            onClick={() =>
                              navigate(
                                `/ib-finance/assets/${asset.asset_id}/dispose`,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Dispose"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAssets.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {loading ? "Loading..." : "No assets found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetsDashboard;
