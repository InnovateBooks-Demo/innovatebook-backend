import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  MoreHorizontal,
  Calculator,
  TrendingDown,
  Layers,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CostingList = () => {
  const navigate = useNavigate();
  const [costing, setCosting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchCosting();
  }, []);

  const fetchCosting = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/modules/catalog/costing`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setCosting(data.costing || []);
    } catch (error) {
      toast.error("Failed to load costing");
    } finally {
      setLoading(false);
    }
  };

  const filteredCosting = costing.filter((item) => {
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCost = costing.reduce((sum, c) => sum + (c.total_cost || 0), 0);

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        dot: "bg-emerald-500",
      },
      draft: {
        color: "bg-amber-50 text-amber-700 ring-amber-600/20",
        dot: "bg-amber-500",
      },
      archived: {
        color: "bg-gray-50 text-gray-700 ring-gray-600/20",
        dot: "bg-gray-500",
      },
    };
    return configs[status] || configs["active"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading costing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="costing-list">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Cost Structures
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage product and service cost breakdowns
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => navigate("/commerce/catalog/costing/create")}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#3A4E63] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Cost Structure
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Structures
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {costing.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {costing.filter((c) => c.status === "active").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Cost Types</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {[...new Set(costing.map((c) => c.cost_type))].length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  ₹{(totalCost / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cost structures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cost Structure
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Material Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Labor Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCosting.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Calculator className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-sm font-medium text-gray-900">
                      No cost structures found
                    </p>
                    <button
                      onClick={() =>
                        navigate("/commerce/catalog/costing/create")
                      }
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#3A4E63] rounded-lg"
                    >
                      <Plus className="h-4 w-4" />
                      New Cost Structure
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCosting.map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  return (
                    <tr
                      key={item.costing_id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(`/commerce/catalog/costing/${item.costing_id}`)
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#3A4E63] to-[#0550c8] flex items-center justify-center text-white font-semibold text-sm">
                            {item.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {item.costing_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium capitalize">
                          {item.cost_type || "standard"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        ₹{(item.material_cost || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        ₹{(item.labor_cost || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(item.total_cost || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusConfig.color}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                          ></span>
                          {item.status || "active"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              navigate(
                                `/commerce/catalog/costing/${item.costing_id}`,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/commerce/catalog/costing/${item.costing_id}/edit`,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredCosting.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredCosting.length}</span> cost
              structures
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostingList;
