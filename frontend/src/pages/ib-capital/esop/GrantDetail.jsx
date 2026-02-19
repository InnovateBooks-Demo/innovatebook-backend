import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  DollarSign,
  Play,
  Check,
} from "lucide-react";
import { authService } from "../../../utils/auth";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GrantDetail = () => {
  const { grant_id } = useParams();
  const [grant, setGrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exercising, setExercising] = useState(false);
  const [exerciseAmount, setExerciseAmount] = useState("");

  useEffect(() => {
    fetchGrant();
  }, [grant_id]);

  const fetchGrant = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/esop/grants/${grant_id}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setGrant(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVest = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/esop/grants/${grant_id}/vest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchGrant();
      }
    } catch (error) {
      toast.error("Failed to process vesting");
    }
  };

  const handleExercise = async () => {
    if (!exerciseAmount || parseInt(exerciseAmount) <= 0) {
      toast.error("Please enter a valid number of options");
      return;
    }

    setExercising(true);
    try {
      const response = await fetch(
        `${API_URL}/api/ib-capital/esop/grants/${grant_id}/exercise?options_to_exercise=${exerciseAmount}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setExerciseAmount("");
        fetchGrant();
      } else {
        const error = await response.json();
        toast.error(error.detail);
      }
    } catch (error) {
      toast.error("Failed to exercise options");
    } finally {
      setExercising(false);
    }
  };

  const formatNumber = (num) => {
    return num?.toLocaleString("en-IN") || "0";
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

  if (!grant) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Grant not found</p>
      </div>
    );
  }

  const exercisable =
    (grant.vested_options || 0) - (grant.exercised_options || 0);
  const exerciseValue = exerciseAmount
    ? parseInt(exerciseAmount) * grant.exercise_price
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="grant-detail">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/ib-capital/esop"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ESOP Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {grant.employee_name}
              </h1>
              <p className="text-gray-500">Grant ID: {grant.grant_id}</p>
            </div>
          </div>
          <button
            onClick={handleVest}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Process Vesting
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Options</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(grant.total_options)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Vested</p>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(grant.vested_options)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {grant.vested_percentage}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Exercised</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(grant.exercised_options)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Exercisable</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatNumber(exercisable)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grant Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Grant Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Grant Date</span>
              <span className="font-medium text-gray-900">
                {grant.grant_date}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Exercise Price</span>
              <span className="font-medium text-gray-900">
                ₹{grant.exercise_price?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Vesting Schedule</span>
              <span className="font-medium text-gray-900 capitalize">
                {grant.vesting_schedule?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Cliff Period</span>
              <span className="font-medium text-gray-900">
                {grant.cliff_months} months
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Total Vesting Period</span>
              <span className="font-medium text-gray-900">
                {grant.vesting_period_months} months
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Status</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${grant.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                  }`}
              >
                {grant.status}
              </span>
            </div>
          </div>
        </div>

        {/* Exercise Options */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Exercise Options
          </h2>
          {exercisable > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-1">
                  Available to Exercise
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(exercisable)} options
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Value: {formatCurrency(exercisable * grant.exercise_price)} @
                  ₹{grant.exercise_price}/option
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options to Exercise
                </label>
                <input
                  type="number"
                  value={exerciseAmount}
                  onChange={(e) => setExerciseAmount(e.target.value)}
                  max={exercisable}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                  placeholder={`Max: ${formatNumber(exercisable)}`}
                />
              </div>

              {exerciseAmount && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Exercise Cost</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(exerciseValue)}
                  </p>
                </div>
              )}

              <button
                onClick={handleExercise}
                disabled={exercising || !exerciseAmount}
                className="w-full px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022B6B] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                {exercising ? "Processing..." : "Exercise Options"}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No options available to exercise</p>
              <p className="text-sm text-gray-400 mt-1">
                Wait for more options to vest
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Vesting History */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Vesting History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Event ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Options Vested
                </th>
              </tr>
            </thead>
            <tbody>
              {(grant.vesting_events || []).map((event) => (
                <tr
                  key={event.event_id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                    {event.event_id}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {event.vesting_date}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    +{formatNumber(event.vested_options)}
                  </td>
                </tr>
              ))}
              {(grant.vesting_events || []).length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    No vesting events yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Vesting Schedule */}
      {(grant.upcoming_vesting || []).length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Vesting Schedule
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Options
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Cumulative
                  </th>
                </tr>
              </thead>
              <tbody>
                {grant.upcoming_vesting.map((vest) => (
                  <tr
                    key={vest.date}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">{vest.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${vest.type === "cliff"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {vest.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      +{formatNumber(vest.options)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatNumber(vest.cumulative)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantDetail;
