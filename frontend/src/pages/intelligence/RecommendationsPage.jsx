import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Pause,
  FastForward,
  Search,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RecommendationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const [recsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/api/intelligence/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/intelligence/recommendations/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRecommendations(recsRes.data.recommendations || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const actOnRecommendation = async (recId, action) => {
    try {
      const token = authService.getToken();
      await axios.post(
        `${API_URL}/api/intelligence/recommendations/${recId}/act?action=${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`Recommendation ${action}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update recommendation");
    }
  };

  const getActionIcon = (type) => {
    const icons = {
      review: Eye,
      pause: Pause,
      accelerate: FastForward,
      escalate: AlertTriangle,
      investigate: Search,
      approve: CheckCircle,
    };
    return icons[type] || Lightbulb;
  };

  const getActionColor = (type) => {
    const colors = {
      review: "bg-blue-100 text-[#033F99]",
      pause: "bg-amber-100 text-amber-600",
      accelerate: "bg-green-100 text-green-600",
      escalate: "bg-red-100 text-red-600",
      investigate: "bg-purple-100 text-purple-600",
      approve: "bg-emerald-100 text-emerald-600",
    };
    return colors[type] || "bg-slate-100 text-slate-600";
  };

  const getPriorityStyle = (priority) => {
    if (priority === 1) return "bg-red-100 text-red-700 border-red-200";
    if (priority === 2) return "bg-amber-100 text-amber-700 border-amber-200";
    if (priority === 3)
      return "bg-blue-100 text-blue-700 border-[rgba(3,63,153,0.25)]";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const filteredRecs = recommendations.filter(
    (r) => priorityFilter === "all" || r.priority === parseInt(priorityFilter),
  );

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
      data-testid="recommendations-page"
    >
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Recommendations
              </h1>
              <p className="text-sm text-slate-500">
                Decision Support Layer - Actionable Guidance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {summary?.counts?.pending || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-l-green-500">
            <p className="text-sm text-slate-500">Accepted</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {summary?.counts?.accepted || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-l-red-500">
            <p className="text-sm text-slate-500">Dismissed</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {summary?.counts?.dismissed || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-l-amber-500">
            <p className="text-sm text-slate-500">Deferred</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {summary?.counts?.deferred || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500">Acceptance Rate</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {summary?.acceptance_rate || 0}%
            </p>
          </div>
        </div>

        {/* High Priority Alerts */}
        {summary?.high_priority?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">
                High Priority Recommendations Requiring Attention
              </span>
            </div>
            <div className="space-y-2">
              {summary.high_priority.slice(0, 3).map((rec) => (
                <div
                  key={rec.recommendation_id}
                  className="flex items-center justify-between bg-white rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                      P{rec.priority}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {rec.title}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      actOnRecommendation(rec.recommendation_id, "accepted")
                    }
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-slate-500 mr-2">
            Filter by Priority:
          </span>
          {["all", "1", "2", "3", "4", "5"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                priorityFilter === p
                  ? "bg-[#3A4E63] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {p === "all" ? "All" : `P${p}`}
            </button>
          ))}
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecs.length > 0 ? (
            filteredRecs.map((rec) => {
              const ActionIcon = getActionIcon(rec.action_type);

              return (
                <div
                  key={rec.recommendation_id}
                  className="bg-white rounded-2xl border border-slate-200 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getActionColor(rec.action_type)}`}
                    >
                      <ActionIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityStyle(rec.priority)}`}
                            >
                              Priority {rec.priority}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                              {rec.action_type}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900">
                            {rec.title}
                          </h3>
                        </div>
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                          {Math.round(rec.confidence_score * 100)}% confidence
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mb-3">
                        {rec.explanation}
                      </p>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-amber-800">
                          <span className="font-medium">Risk if ignored:</span>{" "}
                          {rec.risk_if_ignored}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 rounded">
                          Target: {rec.target_module}
                        </span>
                        <span>
                          {new Date(rec.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {rec.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            actOnRecommendation(
                              rec.recommendation_id,
                              "accepted",
                            )
                          }
                          className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            actOnRecommendation(
                              rec.recommendation_id,
                              "deferred",
                            )
                          }
                          className="flex items-center gap-1 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-medium"
                        >
                          <Clock className="w-4 h-4" />
                          Defer
                        </button>
                        <button
                          onClick={() =>
                            actOnRecommendation(
                              rec.recommendation_id,
                              "dismissed",
                            )
                          }
                          className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No recommendations found</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 mt-8 text-white">
          <h3 className="font-semibold mb-2">
            Recommendations answer: "What should we consider doing next?"
          </h3>
          <p className="text-sm text-white/80">
            Recommendations combine forecast + risk to propose actions with
            explanations. They do NOT: Auto-execute, Override governance, or
            Force users. Human always decides.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
