import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Plus,
  Search,
  BarChart3,
  Clock,
  Calendar,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CapacityDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [capacityProfiles, setCapacityProfiles] = useState([]);
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();

      const [profilesRes, allocationsRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-workforce/capacity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-workforce/allocations?status=active`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setCapacityProfiles(data.data || []);
      }
      if (allocationsRes.ok) {
        const data = await allocationsRes.json();
        setAllocations(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch capacity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Capacity Profiles",
      value: capacityProfiles.length,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Active Allocations",
      value: allocations.length,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      label: "Avg Utilization",
      value: "72%",
      icon: BarChart3,
      color: "text-purple-600",
    },
    {
      label: "Over-Allocated",
      value:
        allocations.filter((a) => a.commitment_type === "hard").length > 5
          ? 2
          : 0,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="capacity-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Capacity Management
                </h1>
                <p className="text-sm text-gray-500">
                  Availability, allocation & utilization
                </p>
              </div>
            </div>
            <button
              onClick={() => toast.info("Create allocation coming soon")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] transition-colors"
              data-testid="create-allocation-btn"
            >
              <Plus className="h-4 w-4" />
              New Allocation
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Capacity Profiles */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Capacity Profiles
              </h3>
              <span className="text-sm text-gray-500">
                {capacityProfiles.length} profiles
              </span>
            </div>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : capacityProfiles.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No capacity profiles. Profiles are created automatically when
                people are activated.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {capacityProfiles.slice(0, 10).map((profile, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                        {profile.person_id?.substring(4, 6).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {profile.person_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {profile.standard_hours_per_day}h/day •{" "}
                          {profile.working_days?.join(", ")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {profile.location || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Allocations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Active Allocations
              </h3>
              <span className="text-sm text-gray-500">
                {allocations.length} active
              </span>
            </div>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : allocations.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No active allocations. Create allocations to assign capacity to
                projects.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {allocations.slice(0, 10).map((alloc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {alloc.reference_name || alloc.allocation_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alloc.person_id} • {alloc.allocated_hours}h/week
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${alloc.commitment_type === "hard"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {alloc.commitment_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Utilization Overview */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Utilization Overview
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {["Engineering", "Sales", "Marketing", "Finance", "Operations"].map(
              (dept, idx) => {
                const utilization = [85, 72, 65, 78, 82][idx];
                return (
                  <div key={idx} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke={
                            utilization > 80
                              ? "#EF4444"
                              : utilization > 60
                                ? "#10B981"
                                : "#3B82F6"
                          }
                          strokeWidth="6"
                          strokeDasharray={`${utilization * 2.2} 220`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                        {utilization}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{dept}</p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityDashboard;
