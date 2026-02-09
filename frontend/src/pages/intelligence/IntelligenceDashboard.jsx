import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Activity,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  ChevronRight,
  RefreshCw,
  Bell,
  Shield,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Link2,
  Loader2,
  Play,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { authService } from "../../utils/auth";
import TryBeforeCloneModal from "../../components/marketing/TryBeforeCloneModal";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IntelligenceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedModuleForDemo, setSelectedModuleForDemo] = useState(null);

  // Check if user has seen the intelligence demo
  const [hasSeenDemo, setHasSeenDemo] = useState(() => {
    return localStorage.getItem("intelligence_demo_seen") === "true";
  });

  useEffect(() => {
    fetchDashboard();

    // Show demo prompt for first-time users
    if (!hasSeenDemo) {
      setTimeout(() => setShowDemoModal(true), 1000);
    }
  }, [hasSeenDemo]);

  const fetchDashboard = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/api/intelligence/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setSeeding(true);
    try {
      const token = authService.getToken();
      await axios.post(
        `${API_URL}/api/intelligence/seed`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Intelligence data seeded successfully");
      fetchDashboard();
    } catch (error) {
      toast.error("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  const syncLiveData = async () => {
    setSyncing(true);
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/api/intelligence/connect/all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const summary = response.data.summary;
      toast.success(
        `Synced: ${summary.total_signals_created} signals, ${summary.total_recommendations_created} recommendations`,
      );
      fetchDashboard();
    } catch (error) {
      toast.error("Failed to sync live data");
    } finally {
      setSyncing(false);
    }
  };

  const modules = [
    {
      id: "signals",
      name: "Signals",
      description: "Enterprise Nervous System - Detect meaningful events",
      icon: Zap,
      path: "/intelligence/signals",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      stat:
        dashboard?.summary?.signals?.critical +
          dashboard?.summary?.signals?.warning || 0,
      statLabel: "Active Signals",
      status: dashboard?.summary?.signals?.status,
    },
    {
      id: "metrics",
      name: "Metrics",
      description: "Enterprise Measurement Layer - KPIs and performance",
      icon: BarChart3,
      path: "/intelligence/metrics",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      stat: dashboard?.key_metrics?.length || 0,
      statLabel: "Active KPIs",
      status: "healthy",
    },
    {
      id: "risk",
      name: "Risk",
      description: "Early Warning System - Identify potential failures",
      icon: Shield,
      path: "/intelligence/risk",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      stat: dashboard?.summary?.risks?.open || 0,
      statLabel: "Open Risks",
      status: dashboard?.summary?.risks?.status,
    },
    {
      id: "forecast",
      name: "Forecast",
      description: "Future State Simulation - Project business outcomes",
      icon: TrendingUp,
      path: "/intelligence/forecast",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      stat: "3",
      statLabel: "Active Forecasts",
      status: "healthy",
    },
    {
      id: "recommendations",
      name: "Recommendations",
      description: "Decision Support Layer - Actionable guidance",
      icon: Lightbulb,
      path: "/intelligence/recommendations",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      stat: dashboard?.summary?.recommendations?.pending || 0,
      statLabel: "Pending Actions",
      status: dashboard?.summary?.recommendations?.status,
    },
    {
      id: "learning",
      name: "Learning",
      description: "System Memory - Continuous improvement engine",
      icon: GraduationCap,
      path: "/intelligence/learning",
      color: "from-slate-500 to-gray-600",
      bgColor: "bg-slate-50",
      stat: "94%",
      statLabel: "Model Accuracy",
      status: "healthy",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      critical: "bg-red-100 text-red-700 border-red-200",
      warning: "bg-amber-100 text-amber-700 border-amber-200",
      attention: "bg-purple-100 text-purple-700 border-purple-200",
      healthy: "bg-green-100 text-green-700 border-green-200",
      normal: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[status] || styles.normal;
  };

  const handleDemoComplete = () => {
    localStorage.setItem("intelligence_demo_seen", "true");
    setHasSeenDemo(true);
    setShowDemoModal(false);
    toast.success("Welcome to IB Intelligence!");
  };

  const handleDemoSkip = () => {
    localStorage.setItem("intelligence_demo_seen", "true");
    setHasSeenDemo(true);
    setShowDemoModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#3A4E63] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      data-testid="intelligence-dashboard"
    >
      {/* Try Before Clone Modal */}
      <TryBeforeCloneModal
        isOpen={showDemoModal}
        onClose={handleDemoSkip}
        onProceed={handleDemoComplete}
        moduleType="intelligence"
        moduleName="IB Intelligence"
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#3A4E63] to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  IB Intelligence
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Enterprise Intelligence Layer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-[#3A4E63] hover:bg-[#3A4E63]/10 rounded-lg transition-colors text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
              <Link
                to="/intelligence/executive"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Target className="w-4 h-4" />
                Executive Dashboard
              </Link>
              <button
                onClick={syncLiveData}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-[#3A4E63] hover:bg-[#022a6b] text-white rounded-lg transition-colors text-sm font-medium"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                {syncing ? "Syncing..." : "Sync Live Data"}
              </button>
              <button
                onClick={seedData}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`}
                />
                {seeding ? "Seeding..." : "Seed Demo Data"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Intelligence Flow Diagram */}
        <div className="bg-gradient-to-r from-[#3A4E63] to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-lg font-semibold mb-4">Intelligence Flow</h2>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {[
              "Event",
              "Signal",
              "Metric",
              "Risk",
              "Forecast",
              "Recommendation",
              "Decision",
            ].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center min-w-[80px]">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 6 ? "bg-white text-[#3A4E63]" : "bg-white/20"}`}
                  >
                    <span className="text-sm font-bold">{i + 1}</span>
                  </div>
                  <span className="text-xs mt-2 text-white/90 text-center">
                    {step}
                  </span>
                </div>
                {i < 6 && (
                  <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm text-white/70 mt-4 text-center">
            Human always remains in control
          </p>
        </div>

        {/* Summary Cards */}
        {dashboard?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div
              className={`bg-white rounded-xl p-5 border-l-4 ${dashboard.summary.signals.status === "critical" ? "border-red-500" : dashboard.summary.signals.status === "warning" ? "border-amber-500" : "border-green-500"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Signals</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(dashboard.summary.signals.critical || 0) +
                      (dashboard.summary.signals.warning || 0)}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(dashboard.summary.signals.status)}`}
                >
                  {dashboard.summary.signals.critical || 0} Critical
                </div>
              </div>
            </div>

            <div
              className={`bg-white rounded-xl p-5 border-l-4 ${dashboard.summary.risks.status === "critical" ? "border-red-500" : dashboard.summary.risks.status === "warning" ? "border-amber-500" : "border-green-500"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Open Risks</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {dashboard.summary.risks.open || 0}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(dashboard.summary.risks.status)}`}
                >
                  {dashboard.summary.risks.critical || 0} High
                </div>
              </div>
            </div>

            <div
              className={`bg-white rounded-xl p-5 border-l-4 ${dashboard.summary.recommendations.status === "attention" ? "border-purple-500" : "border-green-500"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Pending Recommendations
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {dashboard.summary.recommendations.pending || 0}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(dashboard.summary.recommendations.status)}`}
                >
                  {dashboard.summary.recommendations.high_priority || 0} High
                  Priority
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module Cards */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Intelligence Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className={`bg-gradient-to-r ${module.color} p-5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {module.name}
                        </h3>
                        <p className="text-sm text-white/80">
                          {module.statLabel}
                        </p>
                      </div>
                    </div>
                    <span className="text-3xl font-bold text-white">
                      {module.stat}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 mb-4">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(module.status)}`}
                    >
                      {module.status === "critical"
                        ? "Needs Attention"
                        : module.status === "warning"
                          ? "Warning"
                          : module.status === "attention"
                            ? "Review Needed"
                            : "Healthy"}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#3A4E63] transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Signals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Recent Signals</h3>
              <Link
                to="/intelligence/signals"
                className="text-sm text-[#3A4E63] hover:underline font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboard?.recent_signals?.length > 0 ? (
                dashboard.recent_signals.map((signal) => (
                  <div
                    key={signal.signal_id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        signal.severity === "critical"
                          ? "bg-red-500"
                          : signal.severity === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {signal.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {signal.source_solution} • {signal.signal_type}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        signal.severity === "critical"
                          ? "bg-red-100 text-red-700"
                          : signal.severity === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {signal.severity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No recent signals
                </p>
              )}
            </div>
          </div>

          {/* Pending Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Pending Recommendations
              </h3>
              <Link
                to="/intelligence/recommendations"
                className="text-sm text-[#3A4E63] hover:underline font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboard?.recent_recommendations?.length > 0 ? (
                dashboard.recent_recommendations.map((rec) => (
                  <div
                    key={rec.recommendation_id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        rec.priority <= 2 ? "bg-red-100" : "bg-slate-100"
                      }`}
                    >
                      <Lightbulb
                        className={`w-4 h-4 ${rec.priority <= 2 ? "text-red-600" : "text-slate-600"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {rec.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rec.action_type} • {rec.target_module}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        rec.priority === 1
                          ? "bg-red-100 text-red-700"
                          : rec.priority === 2
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      P{rec.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No pending recommendations
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceDashboard;
