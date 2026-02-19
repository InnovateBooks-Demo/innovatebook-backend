import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Target,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RiskPage = () => {
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [view, setView] = useState("list"); // list | heatmap
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const [risksRes, heatmapRes] = await Promise.all([
        axios.get(`${API_URL}/api/intelligence/risks?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/intelligence/risks/heatmap`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRisks(risksRes.data.risks || []);
      setHeatmap(heatmapRes.data);
    } catch (error) {
      console.error("Failed to fetch risks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRiskStatus = async (riskId, newStatus) => {
    try {
      const token = authService.getToken();
      await axios.put(
        `${API_URL}/api/intelligence/risks/${riskId}/status?status=${newStatus}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`Risk status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update risk status");
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 7) return "bg-red-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-green-500";
  };

  const getRiskScoreLabel = (score) => {
    if (score >= 7) return "High";
    if (score >= 4) return "Medium";
    return "Low";
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-blue-100 text-blue-700 border-blue-200",
      escalating: "bg-red-100 text-red-700 border-red-200",
      mitigated: "bg-green-100 text-green-700 border-green-200",
      closed: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[status] || styles.open;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#033F99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="risk-page">
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
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Risk</h1>
                <p className="text-sm text-slate-500">
                  Enterprise Early Warning System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "list"
                    ? "bg-[#033F99] text-white"
                    : "bg-slate-100 text-slate-600"
                  }`}
              >
                List View
              </button>
              <button
                onClick={() => setView("heatmap")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "heatmap"
                    ? "bg-[#033F99] text-white"
                    : "bg-slate-100 text-slate-600"
                  }`}
              >
                Heatmap
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500">Total Open Risks</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {heatmap?.total_open || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-l-red-500">
            <p className="text-sm text-slate-500">Critical (Score ≥ 7)</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {heatmap?.critical_count || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500">By Domain</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(heatmap?.by_domain || {}).map(
                ([domain, count]) => (
                  <span
                    key={domain}
                    className="px-2 py-0.5 bg-slate-100 rounded text-xs"
                  >
                    {domain}: {count}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500">By Type</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(heatmap?.by_type || {}).map(([type, count]) => (
                <span
                  key={type}
                  className="px-2 py-0.5 bg-slate-100 rounded text-xs"
                >
                  {type}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {view === "heatmap" ? (
          /* Risk Heatmap */
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Risk Heatmap</h2>
            <div className="grid grid-cols-4 gap-1">
              {/* Header */}
              <div className="p-2"></div>
              <div className="p-2 text-center text-sm font-medium text-slate-600">
                Low Impact
              </div>
              <div className="p-2 text-center text-sm font-medium text-slate-600">
                Medium Impact
              </div>
              <div className="p-2 text-center text-sm font-medium text-slate-600">
                High Impact
              </div>

              {/* High Probability Row */}
              <div className="p-2 text-sm font-medium text-slate-600 flex items-center">
                High Prob
              </div>
              {["high_low", "high_medium", "high_high"].map((key) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg min-h-[80px] ${key === "high_high"
                      ? "bg-red-100"
                      : key === "high_medium"
                        ? "bg-amber-100"
                        : "bg-yellow-50"
                    }`}
                >
                  <span className="text-xs font-medium text-slate-600">
                    {heatmap?.heatmap?.[key]?.length || 0} risks
                  </span>
                </div>
              ))}

              {/* Medium Probability Row */}
              <div className="p-2 text-sm font-medium text-slate-600 flex items-center">
                Med Prob
              </div>
              {["medium_low", "medium_medium", "medium_high"].map((key) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg min-h-[80px] ${key === "medium_high"
                      ? "bg-amber-100"
                      : key === "medium_medium"
                        ? "bg-yellow-50"
                        : "bg-green-50"
                    }`}
                >
                  <span className="text-xs font-medium text-slate-600">
                    {heatmap?.heatmap?.[key]?.length || 0} risks
                  </span>
                </div>
              ))}

              {/* Low Probability Row */}
              <div className="p-2 text-sm font-medium text-slate-600 flex items-center">
                Low Prob
              </div>
              {["low_low", "low_medium", "low_high"].map((key) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg min-h-[80px] ${key === "low_high" ? "bg-yellow-50" : "bg-green-50"
                    }`}
                >
                  <span className="text-xs font-medium text-slate-600">
                    {heatmap?.heatmap?.[key]?.length || 0} risks
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <span className="text-sm text-slate-500">Risk Level:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100"></div>
                <span className="text-xs">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-100"></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-50"></div>
                <span className="text-xs">Low-Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-50"></div>
                <span className="text-xs">Low</span>
              </div>
            </div>
          </div>
        ) : (
          /* Risk List */
          <>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              {["all", "open", "escalating", "mitigated", "closed"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                        ? "bg-[#033F99] text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ),
              )}
            </div>

            {/* Risk Cards */}
            <div className="space-y-4">
              {risks.length > 0 ? (
                risks.map((risk) => (
                  <div
                    key={risk.risk_id}
                    className="bg-white rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRiskScoreColor(risk.risk_score)} text-white font-bold`}
                      >
                        {risk.risk_score?.toFixed(1)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {risk.title}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {risk.description}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(risk.status)}`}
                          >
                            {risk.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-slate-500">
                            Domain:{" "}
                            <span className="font-medium">{risk.domain}</span>
                          </span>
                          <span className="text-xs text-slate-500">
                            Type:{" "}
                            <span className="font-medium">
                              {risk.risk_type}
                            </span>
                          </span>
                          <span className="text-xs text-slate-500">
                            Probability:{" "}
                            <span className="font-medium">
                              {(risk.probability_score * 100).toFixed(0)}%
                            </span>
                          </span>
                          <span className="text-xs text-slate-500">
                            Impact:{" "}
                            <span className="font-medium">
                              {risk.impact_score}/10
                            </span>
                          </span>
                        </div>
                      </div>

                      {risk.status !== "closed" && (
                        <div className="flex gap-2">
                          {risk.status === "open" && (
                            <button
                              onClick={() =>
                                updateRiskStatus(risk.risk_id, "escalating")
                              }
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                            >
                              Escalate
                            </button>
                          )}
                          <button
                            onClick={() =>
                              updateRiskStatus(risk.risk_id, "mitigated")
                            }
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                          >
                            Mitigate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No risks found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Risk Score Formula */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-8">
          <h3 className="font-semibold text-slate-900 mb-3">
            Risk Scoring Logic
          </h3>
          <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm">
            <span className="text-purple-600">Risk Score</span> ={" "}
            <span className="text-blue-600">Probability</span> ×{" "}
            <span className="text-amber-600">Impact</span>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Risk is NOT: Block actions, Override governance, or Decide
            mitigation. Risk identifies probability of failure before failure
            happens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskPage;
