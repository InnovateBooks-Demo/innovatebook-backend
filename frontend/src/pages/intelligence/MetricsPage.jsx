import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Building2,
  Wallet,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { authService } from "../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MetricsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState("all");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${API_URL}/api/intelligence/metrics/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const domains = [
    {
      id: "commercial",
      name: "Commercial",
      icon: DollarSign,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "operational",
      name: "Operational",
      icon: Briefcase,
      color: "from-purple-500 to-violet-600",
    },
    {
      id: "financial",
      name: "Financial",
      icon: Wallet,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "workforce",
      name: "Workforce",
      icon: Users,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "capital",
      name: "Capital",
      icon: Building2,
      color: "from-rose-500 to-red-600",
    },
  ];

  const formatValue = (value, unit) => {
    if (unit === "INR" || unit === "INR/month") {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (unit === "%") {
      return `${value}%`;
    }
    if (unit === "months" || unit === "days") {
      return `${value} ${unit}`;
    }
    if (unit === "ratio") {
      return value.toFixed(2);
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#033F99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="metrics-page">
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Metrics</h1>
              <p className="text-sm text-slate-500">
                Enterprise Measurement Layer - KPIs and Performance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Domain Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDomain("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${selectedDomain === "all"
                ? "bg-[#033F99] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            All Domains
          </button>
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${selectedDomain === domain.id
                  ? "bg-[#033F99] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
            >
              <domain.icon className="w-4 h-4" />
              {domain.name}
            </button>
          ))}
        </div>

        {/* Domain Cards */}
        {domains
          .filter((d) => selectedDomain === "all" || selectedDomain === d.id)
          .map((domain) => {
            const domainData = dashboard?.domains?.[domain.id];
            const Icon = domain.icon;

            return (
              <div key={domain.id} className="mb-8">
                {/* Domain Header */}
                <div
                  className={`bg-gradient-to-r ${domain.color} rounded-t-2xl p-5`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {domain.name} Metrics
                      </h2>
                      <p className="text-sm text-white/80">
                        {domainData?.count || 0} active KPIs
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {domainData?.metrics?.length > 0 ? (
                      domainData.metrics.map((metric) => (
                        <div
                          key={metric.metric_id}
                          className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm text-slate-600 font-medium">
                              {metric.name}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${metric.confidence_level >= 0.9
                                  ? "bg-green-100 text-green-700"
                                  : metric.confidence_level >= 0.7
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {Math.round(
                                (metric.confidence_level || 0.9) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatValue(metric.value, metric.unit)}
                          </p>
                          {metric.formula && (
                            <p
                              className="text-xs text-slate-400 mt-2 font-mono truncate"
                              title={metric.formula}
                            >
                              {metric.formula}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 text-center py-8">
                        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">
                          No metrics available for this domain
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {/* Metric Categories Explanation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-8">
          <h3 className="font-semibold text-slate-900 mb-4">
            Metric Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                name: "Commercial",
                metrics: ["Conversion rate", "Margin %", "Deal cycle time"],
              },
              {
                name: "Operational",
                metrics: ["Delivery variance", "Rework ratio", "Utilization %"],
              },
              {
                name: "Financial",
                metrics: ["Burn rate", "Cash coverage", "AR days"],
              },
              {
                name: "Workforce",
                metrics: ["Capacity utilization", "Attrition risk index"],
              },
              {
                name: "Capital",
                metrics: ["Runway", "Leverage ratio", "Dilution %"],
              },
            ].map((cat) => (
              <div key={cat.name} className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium text-slate-900 mb-2">{cat.name}</h4>
                <ul className="space-y-1">
                  {cat.metrics.map((m) => (
                    <li
                      key={m}
                      className="text-xs text-slate-500 flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
