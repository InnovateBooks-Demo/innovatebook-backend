import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LearningPage = () => {
  const [loading, setLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const [accuracyRes, recordsRes] = await Promise.all([
        axios.get(`${API_URL}/api/intelligence/learning/accuracy`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/intelligence/learning/records?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAccuracy(accuracyRes.data);
      setRecords(recordsRes.data.records || []);
    } catch (error) {
      console.error("Failed to fetch learning data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#033F99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="learning-page">
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
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Learning</h1>
              <p className="text-sm text-slate-500">
                System Memory & Improvement Engine
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Model Accuracy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Forecast Accuracy */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Forecast Engine Accuracy
                </h3>
                <p className="text-sm text-slate-500">
                  {accuracy?.overall_metrics?.forecast_samples || 0} predictions
                  tracked
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(accuracy?.forecast_accuracy || {}).length > 0 ? (
                Object.entries(accuracy.forecast_accuracy).map(
                  ([domain, data]) => (
                    <div
                      key={domain}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {domain}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${data.accuracy >= 90 ? "bg-green-500" : data.accuracy >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${data.accuracy}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold ${data.accuracy >= 90 ? "text-green-600" : data.accuracy >= 70 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {data.accuracy}%
                        </span>
                        <span className="text-xs text-slate-400">
                          ({data.samples} samples)
                        </span>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="text-center py-6">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    No forecast accuracy data yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendation Feedback */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Recommendation Feedback
                </h3>
                <p className="text-sm text-slate-500">
                  {accuracy?.overall_metrics?.recommendation_samples || 0}{" "}
                  recommendations tracked
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(accuracy?.recommendation_feedback || {}).length >
                0 ? (
                Object.entries(accuracy.recommendation_feedback).map(
                  ([action, count]) => {
                    const total = Object.values(
                      accuracy.recommendation_feedback,
                    ).reduce((a, b) => a + b, 0);
                    const percentage =
                      total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <div
                        key={action}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          {action === "accepted" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : action === "dismissed" ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {action}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${action === "accepted"
                                  ? "bg-green-500"
                                  : action === "dismissed"
                                    ? "bg-red-500"
                                    : "bg-amber-500"
                                }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {count}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  },
                )
              ) : (
                <div className="text-center py-6">
                  <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    No recommendation feedback yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learning Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">
            Recent Learning Records
          </h3>

          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Model
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Prediction
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Actual
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Deviation
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Feedback
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.record_id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-slate-900">
                          {record.model_id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">
                          {record.prediction_type || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">
                          {record.prediction_value?.toFixed(2) || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">
                          {record.actual_outcome?.toFixed(2) || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {record.deviation !== null &&
                          record.deviation !== undefined ? (
                          <span
                            className={`text-sm font-medium ${Math.abs(record.deviation) < 0.1
                                ? "text-green-600"
                                : Math.abs(record.deviation) < 0.3
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                          >
                            {record.deviation > 0 ? "+" : ""}
                            {record.deviation?.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.feedback ? (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${record.feedback === "accepted"
                                ? "bg-green-100 text-green-700"
                                : record.feedback === "dismissed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                          >
                            {record.feedback}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-500">
                          {new Date(record.recorded_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No learning records yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Records will appear as forecasts complete and recommendations
                are acted upon
              </p>
            </div>
          )}
        </div>

        {/* Learning Explanation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            How Learning Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-700 mb-2">
                What Learning Does
              </h4>
              <ul className="space-y-2">
                {[
                  "Tracks outcomes vs predictions",
                  "Adjusts confidence scores",
                  "Improves model accuracy",
                  "Records decision outcomes",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-slate-700 mb-2">
                Feedback Sources
              </h4>
              <ul className="space-y-2">
                {[
                  "Actual system outcomes",
                  "User decisions",
                  "Overrides",
                  "Time-based validation",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Note:</span> Learning does NOT
              rewrite history, modify source data, or auto-change rules. It
              continuously improves accuracy and relevance of intelligence based
              on actual outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
