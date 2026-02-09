import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Users,
  Activity,
  TrendingUp,
  Shield,
  Globe,
  Server,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Wifi,
  WifiOff,
  BarChart3,
  PieChart,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("super_admin_token");
    if (!token) {
      navigate("/super-admin/login");
      return;
    }

    fetchDashboardData();
    setupWebSocket();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("super_admin_token");
      const response = await axios.get(`${API_URL}/api/super-admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("super_admin_token");
        navigate("/super-admin/login");
      }
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const wsUrl = API_URL.replace("https", "wss").replace("http", "ws");
    const ws = new WebSocket(`${wsUrl}/api/super-admin/ws/admin`);

    ws.onopen = () => {
      setWsConnected(true);
      // Send ping every 30 seconds to keep connection alive
      setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "pong") {
        setNotifications((prev) => [data, ...prev].slice(0, 10));
        // Refresh data on important events
        if (
          ["ORG_CREATED", "ORG_UPDATED", "USER_CREATED"].includes(data.type)
        ) {
          fetchDashboardData();
        }
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      // Attempt reconnect after 5 seconds
      setTimeout(setupWebSocket, 5000);
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    wsRef.current = ws;
  };

  const handleLogout = () => {
    localStorage.removeItem("super_admin_token");
    localStorage.removeItem("super_admin_user");
    navigate("/super-admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#3A4E63] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Organizations",
      value: stats?.stats?.total_organizations || 0,
      icon: Building2,
      color: "bg-blue-500",
      change: `${stats?.stats?.active_organizations || 0} active`,
    },
    {
      title: "Total Users",
      value: stats?.stats?.total_users || 0,
      icon: Users,
      color: "bg-green-500",
      change: `${stats?.stats?.active_users || 0} active`,
    },
    {
      title: "Active Sessions",
      value: stats?.stats?.active_users || 0,
      icon: Activity,
      color: "bg-purple-500",
      change: "Real-time",
    },
    {
      title: "Platform Health",
      value: "99.9%",
      icon: Server,
      color: "bg-emerald-500",
      change: "Operational",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Super Admin Portal
                </h1>
                <p className="text-xs text-slate-500">InnovateBooks Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* WebSocket Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${wsConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {wsConnected ? (
                  <Wifi className="w-3.5 h-3.5" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5" />
                )}
                {wsConnected ? "Live" : "Disconnected"}
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Settings */}
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{card.change}</p>
                </div>
                <div className={`p-3 ${card.color} rounded-xl`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Subscription Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/super-admin/organizations"
                className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">
                    Manage Organizations
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                to="/super-admin/users"
                className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-slate-900">
                    Manage Users
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
              </Link>

              <Link
                to="/super-admin/analytics"
                className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-slate-900">
                    View Analytics
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Subscription Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Subscription Plans
            </h2>
            <div className="space-y-4">
              {Object.entries(stats?.subscription_breakdown || {}).map(
                ([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          plan === "enterprise"
                            ? "bg-purple-500"
                            : plan === "professional"
                              ? "bg-blue-500"
                              : plan === "basic"
                                ? "bg-green-500"
                                : "bg-slate-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {plan || "Unknown"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {count}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Real-time Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Live Activity
              </h2>
              <div
                className={`flex items-center gap-1 text-xs ${wsConnected ? "text-green-600" : "text-red-600"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                ></span>
                {wsConnected ? "Connected" : "Offline"}
              </div>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div
                    key={`notif-${notif.timestamp || index}-${notif.type || index}`}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {notif.type?.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {notif.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Organizations & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Organizations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Organizations
              </h2>
              <Link
                to="/super-admin/organizations"
                className="text-sm text-[#3A4E63] hover:underline font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recent_organizations?.slice(0, 5).map((org) => (
                <div
                  key={org.org_id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {org.display_name || org.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {org.subscription_plan} plan
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${org.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {org.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
              {(!stats?.recent_organizations ||
                stats.recent_organizations.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No organizations yet
                </p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Users
              </h2>
              <Link
                to="/super-admin/users"
                className="text-sm text-[#3A4E63] hover:underline font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recent_users?.slice(0, 5).map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "super_admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "org_admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
              {(!stats?.recent_users || stats.recent_users.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No users yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
