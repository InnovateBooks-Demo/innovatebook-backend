import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  Play,
  Sliders,
  Sparkles,
  Brain,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AIForecastPage = () => {
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [activeTab, setActiveTab] = useState("forecasts");
  const [simulationResult, setSimulationResult] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioParams, setScenarioParams] = useState({});
  const [generatingForecast, setGeneratingForecast] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    domain: "commercial",
    metric_name: "revenue",
    horizon: "90d",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const [forecastsRes, scenariosRes] = await Promise.all([
        axios.get(`${API_URL}/api/intelligence/forecasts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/intelligence/forecasts/scenarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setForecasts(forecastsRes.data.forecasts || []);
      setScenarios(scenariosRes.data.scenarios || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIForecast = async () => {
    setGeneratingForecast(true);
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/api/intelligence/forecasts/ai-generate?domain=${aiFormData.domain}&metric_name=${aiFormData.metric_name}&horizon=${aiFormData.horizon}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("AI Forecast generated successfully!");
        // Add the new forecast to the list
        setForecasts((prev) => [response.data.forecast, ...prev]);
        setActiveTab("forecasts");
      } else {
        toast.error(response.data.message || "Failed to generate forecast");
      }
    } catch (error) {
      toast.error("Failed to generate AI forecast");
      console.error(error);
    } finally {
      setGeneratingForecast(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedScenario) {
      toast.error("Please select a scenario");
      return;
    }

    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/api/intelligence/forecasts/simulate?scenario_id=${selectedScenario.id}`,
        scenarioParams,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSimulationResult(response.data);
      toast.success("Simulation completed");
    } catch (error) {
      toast.error("Failed to run simulation");
    }
  };

  const formatValue = (key, value) => {
    if (
      key.includes("rate") ||
      key.includes("utilization") ||
      key.includes("margin") ||
      key.includes("conversion")
    ) {
      return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : value;
    }
    if (
      key.includes("revenue") ||
      key.includes("burn") ||
      key.includes("value")
    ) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (key === "runway") {
      return `${value} months`;
    }
    return typeof value === "number" ? value.toLocaleString() : value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#033F99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="ai-forecast-page">
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
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                AI-Powered Forecast
              </h1>
              <p className="text-sm text-slate-500">
                Machine Learning driven predictions with GPT-5.2
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("forecasts")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === "forecasts"
                ? "bg-[#033F99] text-white"
                : "bg-white text-slate-600 border border-slate-200"
              }`}
          >
            Active Forecasts
          </button>
          <button
            onClick={() => setActiveTab("ai-generate")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === "ai-generate"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                : "bg-white text-slate-600 border border-slate-200"
              }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
          <button
            onClick={() => setActiveTab("whatif")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === "whatif"
                ? "bg-[#033F99] text-white"
                : "bg-white text-slate-600 border border-slate-200"
              }`}
          >
            What-If Scenarios
          </button>
        </div>

        {activeTab === "ai-generate" && (
          /* AI Generation Panel */
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Generate AI Forecast
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Use GPT-5.2 to analyze historical data and generate
                  intelligent predictions with confidence bounds.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Domain
                </label>
                <select
                  value={aiFormData.domain}
                  onChange={(e) =>
                    setAiFormData({ ...aiFormData, domain: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="commercial">Commercial</option>
                  <option value="operational">Operational</option>
                  <option value="financial">Financial</option>
                  <option value="workforce">Workforce</option>
                  <option value="capital">Capital</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Metric
                </label>
                <input
                  type="text"
                  value={aiFormData.metric_name}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      metric_name: e.target.value,
                    })
                  }
                  placeholder="e.g., revenue, burn_rate, headcount"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Forecast Horizon
                </label>
                <select
                  value={aiFormData.horizon}
                  onChange={(e) =>
                    setAiFormData({ ...aiFormData, horizon: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="30d">30 Days</option>
                  <option value="60d">60 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="180d">180 Days</option>
                  <option value="365d">1 Year</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateAIForecast}
              disabled={generatingForecast}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingForecast ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating AI Forecast...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Forecast
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "forecasts" && (
          /* Active Forecasts */
          <div className="space-y-4">
            {forecasts.length > 0 ? (
              forecasts.map((forecast) => (
                <div
                  key={forecast.forecast_id}
                  className="bg-white rounded-2xl border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {forecast.metric_name}
                        </h3>
                        {forecast.ai_generated && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                            <Sparkles className="w-3 h-3" />
                            AI Generated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {forecast.domain} • {forecast.horizon} horizon
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${forecast.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {forecast.status}
                    </span>
                  </div>

                  {/* Projection Visualization */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">
                        Projected Value
                      </span>
                      <span className="text-2xl font-bold text-slate-900">
                        {formatValue("value", forecast.projected_value)}
                      </span>
                    </div>

                    {/* Confidence Band */}
                    <div className="relative h-10 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 rounded-lg overflow-hidden">
                      <div className="absolute inset-y-0 left-1/2 w-1 bg-emerald-600 -translate-x-1/2"></div>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-emerald-700 font-medium">
                        {formatValue(
                          "value",
                          forecast.confidence_lower ||
                          forecast.confidence_band?.lower,
                        )}
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-700 font-medium">
                        {formatValue(
                          "value",
                          forecast.confidence_upper ||
                          forecast.confidence_band?.upper,
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Confidence Band (Lower — Projected — Upper)
                    </p>
                  </div>

                  {/* Assumptions */}
                  {forecast.assumptions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Assumptions:
                      </p>
                      <ul className="space-y-1">
                        {forecast.assumptions.map((assumption, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-500 flex items-start gap-2"
                          >
                            <span className="text-emerald-500 mt-0.5">•</span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No active forecasts</p>
                <button
                  onClick={() => setActiveTab("ai-generate")}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all text-sm font-medium inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Forecast
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "whatif" && (
          /* What-If Scenarios */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Select Scenario
              </h3>
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    onClick={() => {
                      setSelectedScenario(scenario);
                      const defaultParams = {};
                      scenario.parameters?.forEach((p) => {
                        defaultParams[p.name] = p.default;
                      });
                      setScenarioParams(defaultParams);
                      setSimulationResult(null);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedScenario?.id === scenario.id
                        ? "bg-emerald-50 border-2 border-emerald-500"
                        : "bg-slate-50 border border-transparent hover:border-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedScenario?.id === scenario.id
                            ? "bg-emerald-500"
                            : "bg-slate-200"
                          }`}
                      >
                        <Sliders
                          className={`w-5 h-5 ${selectedScenario?.id === scenario.id ? "text-white" : "text-slate-600"}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {scenario.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {scenario.description}
                        </p>
                      </div>
                    </div>
                    {selectedScenario?.id === scenario.id && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {scenario.affected_metrics?.map((metric) => (
                          <span
                            key={metric}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Parameters & Results */}
            <div className="space-y-6">
              {/* Parameters */}
              {selectedScenario && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Parameters
                  </h3>
                  <div className="space-y-4">
                    {selectedScenario.parameters?.map((param) => (
                      <div key={param.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {param.name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                        <input
                          type={param.type}
                          value={scenarioParams[param.name] || ""}
                          onChange={(e) =>
                            setScenarioParams({
                              ...scenarioParams,
                              [param.name]:
                                param.type === "number"
                                  ? parseFloat(e.target.value)
                                  : e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={runSimulation}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    <Play className="w-5 h-5" />
                    Run Simulation
                  </button>
                </div>
              )}

              {/* Results */}
              {simulationResult && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Simulation Results
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(simulationResult.results?.base || {}).map(
                      ([key, baseValue]) => {
                        const simValue =
                          simulationResult.results?.simulated?.[key];
                        const change = simValue - baseValue;
                        const isPositive = change > 0;
                        const isNeutral = change === 0;

                        return (
                          <div key={key} className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">
                              {key.replace(/_/g, " ")}
                            </p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-slate-900">
                                {formatValue(key, simValue)}
                              </span>
                              {!isNeutral && (
                                <span
                                  className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
                                >
                                  {isPositive ? "+" : ""}
                                  {formatValue(key, change)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              was {formatValue(key, baseValue)}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* AI Insights if available */}
                  {simulationResult.ai_insights &&
                    !simulationResult.ai_insights.error && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <p className="text-sm font-medium text-slate-700">
                            AI Insights
                          </p>
                        </div>
                        {simulationResult.ai_insights.insights?.map(
                          (insight, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg mt-2 ${insight.severity === "critical"
                                  ? "bg-red-50 border-l-2 border-red-500"
                                  : insight.severity === "warning"
                                    ? "bg-amber-50 border-l-2 border-amber-500"
                                    : "bg-blue-50 border-l-2 border-blue-500"
                                }`}
                            >
                              <p className="text-sm font-medium">
                                {insight.title}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {insight.description}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                  {/* Impact Summary */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Impact Summary
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {simulationResult.impact_summary?.positive?.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                        >
                          ↑ {m}
                        </span>
                      ))}
                      {simulationResult.impact_summary?.negative?.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                        >
                          ↓ {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mt-8 text-white">
          <h3 className="font-semibold mb-2">
            AI-Powered Forecasting with GPT-5.2
          </h3>
          <p className="text-sm text-white/80">
            Our ML engine uses historical metrics and signals to generate
            intelligent predictions. All forecasts include confidence bounds and
            are clearly marked when AI-generated. Human oversight and validation
            remain essential for all business decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIForecastPage;
