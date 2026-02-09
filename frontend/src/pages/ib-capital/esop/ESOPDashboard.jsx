import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Award,
  TrendingUp,
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { authService } from "../../../utils/auth";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ESOPDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const [dashboardRes, grantsRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-capital/esop/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-capital/esop/grants`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboard(data);
      }

      if (grantsRes.ok) {
        const data = await grantsRes.json();
        setGrants(data.grants || []);
      }
    } catch (error) {
      console.error("Error fetching ESOP data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVest = async (grantId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/esop/grants/${grantId}/vest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to process vesting");
    }
  };

  const formatNumber = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    return num?.toLocaleString("en-IN") || "0";
  };

  const filteredGrants = grants.filter((grant) => {
    const matchesSearch = grant.employee_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || grant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="esop-dashboard">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to IB Capital
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ESOP Management
              </h1>
              <p className="text-gray-500">Employee Stock Option Plan</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Grant
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Total Pool</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(dashboard?.total_pool)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {dashboard?.utilization_percentage}% utilized
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">Granted</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatNumber(dashboard?.granted)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {dashboard?.grants_count} grants
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Vested</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(dashboard?.vested)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatNumber(dashboard?.exercisable)} exercisable
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Unvested</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatNumber(dashboard?.unvested)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Pending vesting</p>
        </div>
      </div>

      {/* Pool Utilization Bar */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          ESOP Pool Utilization
        </h3>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 h-full"
            style={{
              width: `${((dashboard?.exercised || 0) / Math.max(dashboard?.total_pool, 1)) * 100}%`,
            }}
            title={`Exercised: ${formatNumber(dashboard?.exercised)}`}
          />
          <div
            className="bg-blue-500 h-full"
            style={{
              width: `${((dashboard?.vested - dashboard?.exercised || 0) / Math.max(dashboard?.total_pool, 1)) * 100}%`,
            }}
            title={`Vested (Not Exercised): ${formatNumber(dashboard?.vested - dashboard?.exercised)}`}
          />
          <div
            className="bg-orange-400 h-full"
            style={{
              width: `${((dashboard?.unvested || 0) / Math.max(dashboard?.total_pool, 1)) * 100}%`,
            }}
            title={`Unvested: ${formatNumber(dashboard?.unvested)}`}
          />
          <div
            className="bg-gray-200 h-full"
            style={{
              width: `${((dashboard?.available || 0) / Math.max(dashboard?.total_pool, 1)) * 100}%`,
            }}
            title={`Available: ${formatNumber(dashboard?.available)}`}
          />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Exercised</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Vested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-400"></div>
            <span>Unvested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-200"></div>
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">ESOP Grants</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="terminated">Terminated</option>
              <option value="exercised">Fully Exercised</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Employee
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Total Options
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Vested
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Exercised
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Exercise Price
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Vesting %
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGrants.map((grant) => (
                <tr
                  key={grant.grant_id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {grant.employee_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Grant: {grant.grant_id}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatNumber(grant.total_options)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-green-600 font-medium">
                      {formatNumber(grant.vested_options)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {" "}
                      / {formatNumber(grant.unvested_options)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatNumber(grant.exercised_options)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    ₹{grant.exercise_price?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${grant.vested_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {grant.vested_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/ib-capital/esop/grants/${grant.grant_id}`}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button
                        onClick={() => handleVest(grant.grant_id)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Process Vesting"
                      >
                        Vest
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGrants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    {grants.length === 0 ? (
                      <>
                        <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No ESOP grants yet</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-2 text-[#3A4E63] hover:underline text-sm"
                        >
                          Create your first grant
                        </button>
                      </>
                    ) : (
                      <p>No grants match your search</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Grant Modal */}
      {showCreateModal && (
        <CreateGrantModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Create Grant Modal Component
const CreateGrantModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    instrument_id: "INS003",
    total_options: "",
    exercise_price: "",
    grant_date: new Date().toISOString().split("T")[0],
    vesting_schedule: "cliff_1yr_monthly_4yr",
    cliff_months: 12,
    vesting_period_months: 48,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-capital/esop/grants`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          total_options: parseInt(formData.total_options),
          exercise_price: parseFloat(formData.exercise_price),
        }),
      });

      if (response.ok) {
        toast.success("ESOP grant created successfully");
        onSuccess();
      } else {
        toast.error("Failed to create grant");
      }
    } catch (error) {
      toast.error("Error creating grant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Create ESOP Grant
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                value={formData.employee_name}
                onChange={(e) =>
                  setFormData({ ...formData, employee_name: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Options
              </label>
              <input
                type="number"
                value={formData.total_options}
                onChange={(e) =>
                  setFormData({ ...formData, total_options: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise Price (₹)
              </label>
              <input
                type="number"
                value={formData.exercise_price}
                onChange={(e) =>
                  setFormData({ ...formData, exercise_price: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grant Date
            </label>
            <input
              type="date"
              value={formData.grant_date}
              onChange={(e) =>
                setFormData({ ...formData, grant_date: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vesting Schedule
            </label>
            <select
              value={formData.vesting_schedule}
              onChange={(e) =>
                setFormData({ ...formData, vesting_schedule: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            >
              <option value="cliff_1yr_monthly_4yr">
                1 Year Cliff + Monthly (4 Year)
              </option>
              <option value="monthly_4yr">Monthly (4 Year)</option>
              <option value="annual_4yr">Annual (4 Year)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliff (Months)
              </label>
              <input
                type="number"
                value={formData.cliff_months}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cliff_months: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vesting Period (Months)
              </label>
              <input
                type="number"
                value={formData.vesting_period_months}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vesting_period_months: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Grant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ESOPDashboard;
