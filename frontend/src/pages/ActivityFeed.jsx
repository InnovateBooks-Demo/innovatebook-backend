import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Clock,
  User,
  FileText,
  Folder,
  Users,
  Zap,
  Filter,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { authService } from "../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const moduleIcons = {
  Commerce: FileText,
  Finance: FileText,
  Operations: Folder,
  Workforce: Users,
  Intelligence: Zap,
  Workspace: Activity,
};

const moduleColors = {
  Commerce: "bg-blue-500",
  Finance: "bg-green-500",
  Operations: "bg-purple-500",
  Workforce: "bg-orange-500",
  Intelligence: "bg-rose-500",
  Workspace: "bg-cyan-500",
};

const actionColors = {
  created: "text-green-600",
  updated: "text-blue-600",
  deleted: "text-red-600",
  converted: "text-purple-600",
  approved: "text-emerald-600",
  rejected: "text-red-600",
  completed: "text-green-600",
  assigned: "text-blue-600",
  sent: "text-cyan-600",
  payment_received: "text-green-600",
  milestone_completed: "text-purple-600",
  detected: "text-amber-600",
  generated: "text-indigo-600",
};

const ActivityFeed = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ module: "", days: 7 });

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      const token = authService.getToken();
      const params = new URLSearchParams();
      if (filter.module) params.append("module", filter.module);
      params.append("days", filter.days);
      params.append("limit", 50);

      const response = await fetch(`${API_URL}/api/activity/feed?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/activity/stats?days=${filter.days}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const seedActivities = async () => {
    try {
      const token = authService.getToken();
      await fetch(`${API_URL}/api/activity/seed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchActivities();
      fetchStats();
    } catch (error) {
      console.error("Failed to seed activities:", error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="activity-feed">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3A4E63] to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Activity Feed
                </h1>
                <p className="text-sm text-slate-500">
                  All actions across the platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filter.module}
                onChange={(e) =>
                  setFilter({ ...filter, module: e.target.value })
                }
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              >
                <option value="">All Modules</option>
                <option value="Commerce">Commerce</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Workforce">Workforce</option>
                <option value="Intelligence">Intelligence</option>
                <option value="Workspace">Workspace</option>
              </select>
              <select
                value={filter.days}
                onChange={(e) =>
                  setFilter({ ...filter, days: parseInt(e.target.value) })
                }
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
              <button
                onClick={seedActivities}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Seed Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Total Activities */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-sm text-slate-500">Total Activities</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stats?.total || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Last {filter.days} days
              </p>
            </div>

            {/* By Module */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">
                By Module
              </p>
              <div className="space-y-2">
                {Object.entries(stats?.by_module || {}).map(
                  ([module, count]) => {
                    const Icon = moduleIcons[module] || Activity;
                    return (
                      <div
                        key={module}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${moduleColors[module] || "bg-slate-500"}`}
                          />
                          <span className="text-sm text-slate-600">
                            {module}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {count}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Most Active Users
              </p>
              <div className="space-y-3">
                {(stats?.top_users || []).slice(0, 5).map((user, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-sm text-slate-600 truncate max-w-[120px]">
                        {user.user_name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {user.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
              </div>
            ) : Object.keys(groupedActivities).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedActivities).map(
                  ([date, dayActivities]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-slate-500 mb-3">
                        {date}
                      </h3>
                      <div className="bg-white rounded-xl border border-slate-200 divide-y">
                        {dayActivities.map((activity, index) => {
                          const Icon = moduleIcons[activity.module] || Activity;
                          return (
                            <div
                              key={activity.activity_id || index}
                              className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                            >
                              <div
                                className={`w-10 h-10 rounded-lg ${moduleColors[activity.module] || "bg-slate-500"} flex items-center justify-center flex-shrink-0`}
                              >
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-sm text-slate-900">
                                      <span className="font-medium">
                                        {activity.user_name}
                                      </span>{" "}
                                      <span
                                        className={
                                          actionColors[activity.action] ||
                                          "text-slate-600"
                                        }
                                      >
                                        {activity.action.replace("_", " ")}
                                      </span>{" "}
                                      <span className="font-medium">
                                        {activity.entity_name ||
                                          activity.entity_type}
                                      </span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {activity.description}
                                    </p>
                                  </div>
                                  <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {formatTime(activity.timestamp)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                                    {activity.module}
                                  </span>
                                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                                    {activity.entity_type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No activities found</p>
                <button
                  onClick={seedActivities}
                  className="mt-4 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] text-sm"
                >
                  Load Demo Activities
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
