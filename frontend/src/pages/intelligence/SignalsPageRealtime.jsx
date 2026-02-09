import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Wifi,
  WifiOff,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronDown,
  Plus,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SignalsPageRealtime = () => {
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws = null;
    let pingInterval = null;

    const connectWebSocket = () => {
      try {
        const wsUrl = API_URL.replace("https://", "wss://").replace(
          "http://",
          "ws://",
        );
        ws = new WebSocket(`${wsUrl}/api/intelligence/ws/org_demo_legacy`);

        ws.onopen = () => {
          console.log("Signals WebSocket connected");
          setWsConnected(true);
          // Send ping every 30 seconds
          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "SIGNAL_CREATED") {
              setSignals((prev) => [data.signal, ...prev]);
              toast.info(`New Signal: ${data.signal.title}`);
              // Update summary counts
              setSummary((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  total: (prev.total || 0) + 1,
                  by_severity: {
                    ...prev.by_severity,
                    [data.signal.severity]:
                      (prev.by_severity?.[data.signal.severity] || 0) + 1,
                  },
                };
              });
            } else if (data.type === "SIGNAL_ACKNOWLEDGED") {
              setSignals((prev) =>
                prev.map((s) =>
                  s.signal_id === data.signal_id
                    ? {
                        ...s,
                        acknowledged: true,
                        acknowledged_by: data.acknowledged_by,
                      }
                    : s,
                ),
              );
            }
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        };

        ws.onclose = () => {
          console.log("Signals WebSocket disconnected");
          setWsConnected(false);
          clearInterval(pingInterval);
          // Attempt reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      if (ws) ws.close();
    };
  }, []);

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
      // The WebSocket will handle the UI update, but also update locally
      setSignals((prev) =>
        prev.map((s) =>
          s.signal_id === signalId ? { ...s, acknowledged: true } : s,
        ),
      );
    } catch (error) {
      toast.error("Failed to acknowledge signal");
    }
  };

  const createSignal = async (signalData) => {
    try {
      const token = authService.getToken();
      await axios.post(`${API_URL}/api/intelligence/signals`, signalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Signal created");
      setShowCreateModal(false);
      // The WebSocket will push the new signal
    } catch (error) {
      toast.error("Failed to create signal");
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
    <div
      className="min-h-screen bg-slate-50"
      data-testid="signals-page-realtime"
    >
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
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Signals</h1>
                <p className="text-sm text-slate-500">
                  Enterprise Nervous System - Real-time event detection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* WebSocket Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  wsConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {wsConnected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {wsConnected ? "Live" : "Connecting..."}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Signal
              </button>
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

      {/* Create Signal Modal */}
      {showCreateModal && (
        <CreateSignalModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createSignal}
          sources={sources}
        />
      )}
    </div>
  );
};

// Create Signal Modal Component
const CreateSignalModal = ({ onClose, onCreate, sources }) => {
  const [formData, setFormData] = useState({
    source_solution: "commerce",
    source_module: "leads",
    signal_type: "ai_detected",
    severity: "warning",
    title: "",
    description: "",
    entity_reference: "",
    entity_type: "",
    metadata: {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Create New Signal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              placeholder="Signal title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              placeholder="Describe the signal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source Solution
              </label>
              <select
                value={formData.source_solution}
                onChange={(e) =>
                  setFormData({ ...formData, source_solution: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              >
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source Module
              </label>
              <input
                type="text"
                value={formData.source_module}
                onChange={(e) =>
                  setFormData({ ...formData, source_module: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                placeholder="e.g., leads, billing..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Signal Type
              </label>
              <select
                value={formData.signal_type}
                onChange={(e) =>
                  setFormData({ ...formData, signal_type: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              >
                <option value="ai_detected">AI Detected</option>
                <option value="margin_erosion">Margin Erosion</option>
                <option value="schedule_slip">Schedule Slip</option>
                <option value="cash_stress">Cash Stress</option>
                <option value="payment_overdue">Payment Overdue</option>
                <option value="deal_discount">Deal Discount</option>
                <option value="project_delay">Project Delay</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] transition-colors"
            >
              Create Signal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignalsPageRealtime;
