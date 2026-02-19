import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gauge,
  Plus,
  ArrowLeft,
  Loader2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernanceLimitsList = () => {
  const navigate = useNavigate();
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/commerce/governance-engine/limits`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) setLimits(data.limits || []);
    } catch (error) {
      toast.error("Failed to fetch limits");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="governance-limits-list"
    >
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/commerce/governance-engine")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Governance Engine → Limits
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Gauge className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Limits</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Quantitative caps on risk and exposure
                </p>
              </div>
            </div>
            <Link
              to="/commerce/governance-engine/limits/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e]"
            >
              <Plus className="h-4 w-4" />
              Add Limit
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Total Limits</p>
            <p className="text-2xl font-bold mt-1">{limits.length}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">
              Near Breach (&gt;80%)
            </p>
            <p className="text-2xl font-bold mt-1">
              {
                limits.filter(
                  (l) =>
                    l.utilization_percent > 80 && l.utilization_percent < 100,
                ).length
              }
            </p>
          </div>
          <div className="bg-red-100 text-red-700 rounded-xl p-4">
            <p className="text-xs font-medium uppercase">Breached (≥100%)</p>
            <p className="text-2xl font-bold mt-1">
              {limits.filter((l) => l.utilization_percent >= 100).length}
            </p>
          </div>
        </div>

        {/* Limits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {limits.map((limit) => {
            const utilization = limit.utilization_percent || 0;
            const isNearBreach = utilization > 80 && utilization < 100;
            const isBreach = utilization >= 100;

            return (
              <div
                key={limit.limit_id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  navigate(
                    `/commerce/governance-engine/limits/${limit.limit_id}`,
                  )
                }
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {limit.limit_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {limit.limit_id} • {limit.limit_type}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${limit.hard_or_soft === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {limit.hard_or_soft}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Utilization</span>
                    <span
                      className={`text-sm font-semibold ${isBreach ? "text-red-600" : isNearBreach ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${isBreach ? "bg-red-500" : isNearBreach ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Current Usage</p>
                    <p className="font-semibold text-gray-900">
                      ₹{(limit.current_usage || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Threshold</p>
                    <p className="font-semibold text-gray-900">
                      ₹{(limit.threshold_value || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {(isNearBreach || isBreach) && (
                  <div
                    className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${isBreach ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {isBreach ? "Limit Breached!" : "Approaching Limit"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GovernanceLimitsList;
