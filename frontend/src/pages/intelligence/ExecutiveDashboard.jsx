import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Shield,
  Zap,
  Activity,
  Target,
  DollarSign,
  Users,
  Clock,
  ChevronRight,
  RefreshCw,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Gauge,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ExecutiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const token = authService.getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [
        dashboardRes,
        signalsRes,
        risksRes,
        recommendationsRes,
        metricsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/intelligence/dashboard`, { headers }),
        axios.get(`${API_URL}/api/intelligence/signals/summary`, { headers }),
        axios.get(`${API_URL}/api/intelligence/risks/heatmap`, { headers }),
        axios.get(`${API_URL}/api/intelligence/recommendations/summary`, {
          headers,
        }),
        axios.get(`${API_URL}/api/intelligence/metrics/dashboard`, { headers }),
      ]);

      setData({
        dashboard: dashboardRes.data,
        signals: signalsRes.data,
        risks: risksRes.data,
        recommendations: recommendationsRes.data,
        metrics: metricsRes.data,
      });
    } catch (error) {
      console.error("Failed to fetch executive dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getHealthScore = () => {
    if (!data) return 0;

    let score = 100;
    // Deduct for critical signals
    score -= (data.signals?.by_severity?.critical || 0) * 10;
    // Deduct for high risks
    score -= (data.risks?.critical_count || 0) * 5;
    // Deduct for pending recommendations
    score -= (data.recommendations?.counts?.pending || 0) * 2;

    return Math.max(0, Math.min(100, score));
  };

  const healthScore = getHealthScore();

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#033F99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="executive-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/intelligence"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Gauge className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Executive Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Real-time business intelligence overview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${refreshing
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
                  }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${refreshing ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
                />
                {refreshing ? "Updating..." : "Live"}
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Health Score Banner */}
        <div
          className={`rounded-2xl p-6 mb-6 border ${getHealthBg(healthScore)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">
                  Enterprise Health Score
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-bold ${getHealthColor(healthScore)}`}
                  >
                    {healthScore}
                  </span>
                  <span className="text-xl text-slate-400">/100</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {healthScore >= 80
                    ? "Excellent - All systems performing well"
                    : healthScore >= 60
                      ? "Good - Minor issues need attention"
                      : healthScore >= 40
                        ? "Fair - Several areas need review"
                        : "Critical - Immediate attention required"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center px-6 py-3 bg-white rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-red-600">
                  {data?.signals?.by_severity?.critical || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Critical Signals</p>
              </div>
              <div className="text-center px-6 py-3 bg-white rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-amber-600">
                  {data?.risks?.total_open || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Open Risks</p>
              </div>
              <div className="text-center px-6 py-3 bg-white rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-[#033F99]">
                  {data?.recommendations?.counts?.pending || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Pending Actions</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data?.signals?.total || 0}
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Signals</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data?.risks?.total_open || 0}
            </p>
            <p className="text-sm text-slate-500 mt-1">Active Risks</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data?.recommendations?.counts?.pending || 0}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Pending Recommendations
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                +5%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data?.recommendations?.acceptance_rate || 0}%
            </p>
            <p className="text-sm text-slate-500 mt-1">Acceptance Rate</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Heatmap */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Risk Heatmap</h3>
              <Link
                to="/intelligence/risk"
                className="text-sm text-[#033F99] hover:underline flex items-center gap-1 font-medium"
              >
                View Details <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center text-xs text-slate-500 mb-2"></div>
              <div className="text-center text-xs text-slate-500 mb-2 font-medium">
                Impact →
              </div>
              <div className="text-center text-xs text-slate-500 mb-2"></div>

              {["high", "medium", "low"].map((prob, pi) => (
                <React.Fragment key={prob}>
                  {["high", "medium", "low"].map((impact, ii) => {
                    const key = `${prob}_${impact}`;
                    const count = data?.risks?.heatmap?.[key]?.length || 0;
                    const intensity =
                      count > 3
                        ? "high"
                        : count > 1
                          ? "medium"
                          : count > 0
                            ? "low"
                            : "none";

                    return (
                      <div
                        key={key}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all border ${intensity === "high"
                            ? "bg-red-100 border-red-300"
                            : intensity === "medium"
                              ? "bg-orange-100 border-orange-300"
                              : intensity === "low"
                                ? "bg-amber-50 border-amber-200"
                                : "bg-slate-50 border-slate-200"
                          }`}
                      >
                        <span
                          className={`text-2xl font-bold ${intensity === "high"
                              ? "text-red-700"
                              : intensity === "medium"
                                ? "text-orange-700"
                                : intensity === "low"
                                  ? "text-amber-700"
                                  : "text-slate-400"
                            }`}
                        >
                          {count}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">
                          {prob[0].toUpperCase()}P/{impact[0].toUpperCase()}I
                        </span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-slate-400">
              <span>← Higher Probability</span>
              <span>Lower Probability →</span>
            </div>
          </div>

          {/* Signals by Source */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">
                Signals by Source
              </h3>
              <Link
                to="/intelligence/signals"
                className="text-sm text-[#033F99] hover:underline flex items-center gap-1 font-medium"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {Object.entries(data?.signals?.by_source || {}).map(
                ([source, counts]) => (
                  <div
                    key={source}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {source}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {counts.critical > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                            {counts.critical} critical
                          </span>
                        )}
                        {counts.warning > 0 && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                            {counts.warning} warning
                          </span>
                        )}
                        {counts.info > 0 && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {counts.info} info
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-slate-700">
                      {counts.total}
                    </span>
                  </div>
                ),
              )}

              {Object.keys(data?.signals?.by_source || {}).length === 0 && (
                <p className="text-center text-slate-500 py-4">
                  No signals by source
                </p>
              )}
            </div>
          </div>

          {/* Recent Critical Signals */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">
              Recent Critical Signals
            </h3>
            <div className="space-y-3">
              {(data?.signals?.recent_critical || []).map((signal, i) => (
                <div
                  key={signal.signal_id || i}
                  className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {signal.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {signal.source_solution} • {signal.signal_type}
                  </p>
                </div>
              ))}
              {(!data?.signals?.recent_critical ||
                data.signals.recent_critical.length === 0) && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No critical signals</p>
                  </div>
                )}
            </div>
          </div>

          {/* High Priority Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                High Priority Recommendations
              </h3>
              <Link
                to="/intelligence/recommendations"
                className="text-sm text-[#033F99] hover:underline flex items-center gap-1 font-medium"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {(data?.recommendations?.high_priority || []).map((rec, i) => (
                <div
                  key={rec.recommendation_id || i}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.priority === 1 ? "bg-red-100" : "bg-amber-100"
                      }`}
                  >
                    <span
                      className={`text-sm font-bold ${rec.priority === 1 ? "text-red-700" : "text-amber-700"}`}
                    >
                      P{rec.priority}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {rec.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {rec.action_type} • {rec.target_module}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${rec.confidence_score >= 0.8
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {Math.round((rec.confidence_score || 0) * 100)}% confident
                  </span>
                </div>
              ))}
              {(!data?.recommendations?.high_priority ||
                data.recommendations.high_priority.length === 0) && (
                  <div className="text-center py-8">
                    <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">
                      No high priority recommendations
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Metrics by Domain */}
        <div className="mt-6 bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Metrics by Domain</h3>
            <Link
              to="/intelligence/metrics"
              className="text-sm text-[#033F99] hover:underline flex items-center gap-1 font-medium"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              "commercial",
              "operational",
              "financial",
              "workforce",
              "capital",
            ].map((domain) => {
              const domainData = data?.metrics?.domains?.[domain];
              const count = domainData?.count || 0;

              const icons = {
                commercial: DollarSign,
                operational: Activity,
                financial: BarChart3,
                workforce: Users,
                capital: TrendingUp,
              };
              const colors = {
                commercial: "from-blue-500 to-blue-600",
                operational: "from-emerald-500 to-emerald-600",
                financial: "from-purple-500 to-purple-600",
                workforce: "from-amber-500 to-amber-600",
                capital: "from-rose-500 to-rose-600",
              };
              const Icon = icons[domain] || BarChart3;

              return (
                <div
                  key={domain}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[domain]} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {domain}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500">active metrics</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
