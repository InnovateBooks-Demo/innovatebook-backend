import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SignalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [severityFilter, sourceFilter]);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const params = new URLSearchParams();
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (sourceFilter !== "all")
        params.append("source_solution", sourceFilter);

      const [signalsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/api/intelligence/signals?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/intelligence/signals/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSignals(signalsRes.data.signals || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to fetch signals:", error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeSignal = async (signalId) => {
    try {
      const token = authService.getToken();
      await axios.post(
        `${API_URL}/api/intelligence/signals/${signalId}/acknowledge`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Signal acknowledged");
      fetchData();
    } catch (error) {
      toast.error("Failed to acknowledge signal");
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-700";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-[rgba(3,63,153,0.08)] border-[rgba(3,63,153,0.25)] text-blue-700";
    }
  };

  const filteredSignals = signals.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sources = [
    "commerce",
    "operations",
    "finance",
    "workforce",
    "capital",
    "workspace",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#3A4E63] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="signals-page">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/intelligence"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Signals</h1>
              <p className="text-sm text-slate-500">
                Enterprise Nervous System - Detect meaningful events
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Signals</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {summary?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-red-200 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Critical</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {summary?.by_severity?.critical || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-amber-200 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Warning</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {summary?.by_severity?.warning || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[rgba(3,63,153,0.25)] border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Info</p>
                <p className="text-3xl font-bold text-[#033F99] mt-1">
                  {summary?.by_severity?.info || 0}
                </p>
              </div>
              <Info className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            >
              <option value="all">All Sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-4">
          {filteredSignals.length > 0 ? (
            filteredSignals.map((signal) => (
              <div
                key={signal.signal_id}
                className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
                  signal.severity === "critical"
                    ? "border-l-4 border-l-red-500"
                    : signal.severity === "warning"
                      ? "border-l-4 border-l-amber-500"
                      : "border-l-4 border-l-blue-500"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      signal.severity === "critical"
                        ? "bg-red-100"
                        : signal.severity === "warning"
                          ? "bg-amber-100"
                          : "bg-blue-100"
                    }`}
                  >
                    {getSeverityIcon(signal.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {signal.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {signal.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getSeverityStyle(signal.severity)}`}
                      >
                        {signal.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="px-2 py-1 bg-slate-100 rounded-md">
                        {signal.source_solution}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 rounded-md">
                        {signal.signal_type}
                      </span>
                      {signal.entity_reference && (
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          {signal.entity_type}: {signal.entity_reference}
                        </span>
                      )}
                      <span>
                        {new Date(signal.detected_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {signal.acknowledged ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledgeSignal(signal.signal_id)}
                        className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] transition-colors text-sm font-medium"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No signals found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalsPage;
