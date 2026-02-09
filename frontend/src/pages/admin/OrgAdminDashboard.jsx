import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Shield,
  Settings,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OrgAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    pending_invites: 0,
    total_roles: 0,
    storage_used: 0,
    api_calls_today: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
        setRecentActivity(data.recent_activity || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: "users",
      title: "User Management",
      description: "Manage users, invites, and access",
      icon: Users,
      path: "/admin/users",
      color: "from-blue-500 to-blue-600",
      stat: stats.total_users,
      label: "Total Users",
    },
    {
      id: "roles",
      title: "Roles & Permissions",
      description: "Configure roles and access control",
      icon: Shield,
      path: "/admin/roles",
      color: "from-purple-500 to-purple-600",
      stat: stats.total_roles,
      label: "Active Roles",
    },
    {
      id: "settings",
      title: "Organization Settings",
      description: "Company profile, branding, preferences",
      icon: Settings,
      path: "/admin/settings",
      color: "from-gray-500 to-gray-600",
      stat: null,
      label: null,
    },
    {
      id: "billing",
      title: "Billing & Subscription",
      description: "Manage plan, invoices, payments",
      icon: CreditCard,
      path: "/admin/billing",
      color: "from-green-500 to-green-600",
      stat: null,
      label: null,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A4E63]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="org-admin-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#3A4E63] rounded-xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Organization Admin
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your organization settings, users, and permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_users}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#033F99]" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                +{stats.pending_invites}
              </span>
              <span className="text-gray-500">pending invites</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.active_users}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                {Math.round((stats.active_users / stats.total_users) * 100) ||
                  0}
                %
              </span>
              <span className="text-gray-500">activity rate</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">API Calls Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.api_calls_today.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <span className="text-gray-500">Within usage limits</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Storage Used</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.storage_used} GB
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full mt-3">
              <div
                className="h-2 bg-orange-500 rounded-full"
                style={{ width: `${(stats.storage_used / 50) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Administration
        </h2>
        <div className="grid grid-cols-2 gap-6 mb-8">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => navigate(module.path)}
              className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center`}
                  >
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
                {module.stat !== null && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {module.stat}
                    </p>
                    <p className="text-xs text-gray-500">{module.label}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "user_added"
                        ? "bg-green-100"
                        : activity.type === "role_changed"
                          ? "bg-purple-100"
                          : activity.type === "settings_updated"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                    }`}
                  >
                    <Bell
                      className={`h-5 w-5 ${
                        activity.type === "user_added"
                          ? "text-green-600"
                          : activity.type === "role_changed"
                            ? "text-purple-600"
                            : activity.type === "settings_updated"
                              ? "text-[#033F99]"
                              : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.actor} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;
