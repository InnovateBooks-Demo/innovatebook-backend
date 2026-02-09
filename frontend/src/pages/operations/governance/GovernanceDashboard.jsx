import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Eye,
  Search,
  Bell,
  Clock,
  Target,
  Activity,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GovernanceDashboard = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [slaSummary, setSlaSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [severityFilter, statusFilter]);

  const fetchData = async () => {
    try {
      const token = authService.getToken();

      // Fetch alerts
      let alertUrl = `${API_URL}/api/operations/governance/alerts`;
      const params = [];
      if (severityFilter !== "all") params.push(`severity=${severityFilter}`);
      if (statusFilter !== "all") params.push(`status=${statusFilter}`);
      if (params.length) alertUrl += "?" + params.join("&");

      const [alertsRes, dashboardRes, slaRes] = await Promise.all([
        fetch(alertUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/operations/governance/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/operations/sla/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.data || []);
      }
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setStats(dashboardData.data || {});
      }
      if (slaRes.ok) {
        const slaData = await slaRes.json();
        setSlaSummary(slaData.data || null);
      }
    } catch (error) {
      toast.error("Failed to load governance data");
    } finally {
      setLoading(false);
    }
  };

  const runSlaCheck = async () => {
    setChecking(true);
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/operations/sla/check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(
          `SLA check completed - ${data.alerts_created} new alerts`,
        );
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to run SLA check");
    } finally {
      setChecking(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/operations/governance/alerts/${alertId}/acknowledge`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Alert acknowledged");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/operations/governance/alerts/${alertId}/resolve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Alert resolved");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      info: "bg-blue-100 text-blue-700",
      warning: "bg-yellow-100 text-yellow-700",
      critical: "bg-red-100 text-red-700",
    };
    return styles[severity] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-red-100 text-red-700",
      acknowledged: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="governance-dashboard">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/operations")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              Operations → Governance
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Governance
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Control, deviation detection & enforcement
                </p>
              </div>
            </div>
            <button
              onClick={runSlaCheck}
              disabled={checking}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
              />
              {checking ? "Checking..." : "Run SLA Check"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-500">Open Alerts</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.open_alerts || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-500">Critical</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {stats.critical_alerts || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-500">SLA Breaches</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.sla_breaches || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500">Active Projects</span>
            </div>
            <p className="text-3xl font-bold text-[#033F99]">
              {stats.active_projects || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-500">At Risk</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {stats.at_risk_projects || 0}
            </p>
          </div>
        </div>

        {/* SLA Compliance Summary */}
        {slaSummary && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SLA Compliance Overview
              </h3>
              <span className="text-3xl font-bold">
                {slaSummary.projects?.compliance_rate || 100}%
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/80">Projects On Track</p>
                <p className="text-2xl font-bold">
                  {slaSummary.projects?.on_track || 0}/
                  {slaSummary.projects?.total || 0}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/80">Projects At Risk</p>
                <p className="text-2xl font-bold">
                  {slaSummary.projects?.at_risk || 0}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/80">Overdue Tasks</p>
                <p className="text-2xl font-bold">
                  {slaSummary.tasks?.overdue || 0}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/80">Total Breaches</p>
                <p className="text-2xl font-bold">
                  {slaSummary.breaches?.total || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Execution Alerts
            </h3>
          </div>
          {alerts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => (
                <div key={alert.alert_id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${
                          alert.severity === "critical"
                            ? "text-red-500"
                            : alert.severity === "warning"
                              ? "text-yellow-500"
                              : "text-blue-500"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${getSeverityBadge(alert.severity)}`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-xs text-gray-400 uppercase">
                            {alert.alert_category}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {alert.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {alert.entity_type}:{" "}
                          {alert.entity_name || alert.entity_id}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Raised: {new Date(alert.raised_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(alert.status)}`}
                      >
                        {alert.status}
                      </span>
                      {alert.status === "open" && (
                        <button
                          onClick={() => acknowledgeAlert(alert.alert_id)}
                          className="px-3 py-1 text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status === "acknowledged" && (
                        <button
                          onClick={() => resolveAlert(alert.alert_id)}
                          className="px-3 py-1 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p>No alerts matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;
