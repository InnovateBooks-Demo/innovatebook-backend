import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  Lightbulb,
  BarChart3,
  Shield,
  TrendingUp,
  Target,
  BookOpen,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle,
  AlertTriangle,
  LineChart,
  PieChart,
  Eye,
  Bell,
  ChevronRight,
  Clock,
  DollarSign,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const IntelligenceOverview = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const modules = [
    {
      id: "signals",
      name: "Signals",
      icon: Lightbulb,
      tagline: "Real-Time Business Alerts",
      description:
        "Intelligent signals that surface critical business events as they happen. Know what needs attention before it becomes a problem.",
      features: [
        "Real-time event detection",
        "Severity-based prioritization",
        "Cross-module signal aggregation",
        "Custom alert rules",
        "Smart notification routing",
        "Signal history and trends",
      ],
      examples: [
        {
          type: "Revenue",
          alert: "Large deal closing this week",
          severity: "success",
        },
        {
          type: "Risk",
          alert: "Customer payment 45 days overdue",
          severity: "warning",
        },
        {
          type: "Operations",
          alert: "Project milestone at risk",
          severity: "critical",
        },
      ],
    },
    {
      id: "metrics",
      name: "Metrics",
      icon: BarChart3,
      tagline: "Business Performance Dashboard",
      description:
        "Track KPIs across all business dimensions. From revenue growth to operational efficiency, see the numbers that matter.",
      features: [
        "Revenue metrics (MRR, ARR, growth)",
        "Operational KPIs",
        "Financial ratios",
        "Department scorecards",
        "Custom metric builder",
        "Benchmark comparisons",
      ],
      metrics: [
        { name: "Monthly Revenue", value: "₹8.5 Cr", trend: "+12%" },
        { name: "Deal Win Rate", value: "68%", trend: "+5%" },
        { name: "DSO", value: "32 days", trend: "-3 days" },
        { name: "Margin", value: "42%", trend: "+2%" },
      ],
    },
    {
      id: "risk",
      name: "Risk",
      icon: Shield,
      tagline: "Proactive Risk Management",
      description:
        "Identify and monitor business risks before they impact your bottom line. From credit risk to operational threats.",
      features: [
        "Credit risk scoring",
        "Customer concentration analysis",
        "Payment delay predictions",
        "Vendor risk assessment",
        "Geographic risk mapping",
        "Compliance risk monitoring",
      ],
      riskCategories: [
        { category: "Customer Credit", score: 72, status: "Medium" },
        { category: "Revenue Concentration", score: 85, status: "Low" },
        { category: "Payment Risk", score: 45, status: "High" },
        { category: "Operational", score: 90, status: "Low" },
      ],
    },
    {
      id: "forecast",
      name: "Forecast",
      icon: TrendingUp,
      tagline: "AI-Powered Predictions",
      description:
        "Machine learning models that predict revenue, cash flow, and business outcomes. Plan with confidence using data-driven forecasts.",
      features: [
        "Revenue forecasting",
        "Cash flow predictions",
        "Deal probability scoring",
        "Demand forecasting",
        "Scenario modeling",
        "Confidence intervals",
      ],
      forecasts: [
        { period: "Q1 FY26", revenue: "₹28 Cr", confidence: "85%" },
        { period: "Q2 FY26", revenue: "₹32 Cr", confidence: "78%" },
        { period: "FY26 Full", revenue: "₹125 Cr", confidence: "72%" },
      ],
    },
    {
      id: "recommendations",
      name: "Recommendations",
      icon: Target,
      tagline: "Actionable Insights",
      description:
        "AI-generated recommendations to improve business outcomes. From deal prioritization to cost optimization.",
      features: [
        "Deal prioritization",
        "Pricing optimization",
        "Collection strategies",
        "Resource allocation",
        "Process improvements",
        "Cost reduction opportunities",
      ],
      sampleRecommendations: [
        "Focus on 3 high-value deals closing this month",
        "Increase follow-up on ₹2.5 Cr overdue receivables",
        "Consider renegotiating top vendor contract",
      ],
    },
    {
      id: "learning",
      name: "Learning",
      icon: BookOpen,
      tagline: "Continuous Improvement",
      description:
        "The system learns from your business patterns. Better predictions and recommendations over time.",
      features: [
        "Pattern recognition",
        "Behavioral analytics",
        "Seasonal adjustments",
        "Feedback loops",
        "Model accuracy tracking",
        "Automated model updates",
      ],
      improvements: [
        { metric: "Forecast Accuracy", before: "72%", after: "89%" },
        { metric: "Risk Detection", before: "65%", after: "94%" },
        { metric: "Recommendation Adoption", before: "40%", after: "78%" },
      ],
    },
  ];

  const stats = [
    { metric: "89%", label: "Forecast Accuracy" },
    { metric: "4x", label: "Faster Insights" },
    { metric: "25%", label: "Risk Reduction" },
    { metric: "₹2Cr+", label: "Savings Identified" },
  ];

  const benefits = [
    {
      icon: Eye,
      title: "Complete Visibility",
      description: "See everything happening across your business in real-time",
    },
    {
      icon: Zap,
      title: "Instant Alerts",
      description: "Know about issues and opportunities as they happen",
    },
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Machine learning models trained on your data",
    },
    {
      icon: Target,
      title: "Actionable",
      description: "Clear recommendations you can act on immediately",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden bg-[#033F99]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Brain className="h-6 w-6 text-white" />
              <span className="text-white font-bold text-lg">
                Intelligence Layer
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
              Business Intelligence
              <br />
              <span className="font-light italic">That Actually Works.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              AI-powered insights, real-time signals, and predictive analytics.
              Transform your data into decisions with our intelligence layer.
            </p>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
              <Link to="/auth/signup">
                <button className="bg-white text-[#033F99] font-bold px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link to="/contact">
                <button className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-10 py-5 rounded-xl transition-all duration-300 text-lg">
                  Book a Demo
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <p className="text-3xl font-bold text-white mb-1">
                    {stat.metric}
                  </p>
                  <p className="text-sm text-white/80 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 p-6 rounded-2xl border border-[#033F99]/20 text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intelligence Modules */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Intelligence Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Six powerful modules working together to give you complete
              business intelligence
            </p>
          </div>

          <div className="space-y-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#033F99] transition-all overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">
                          {module.name}
                        </h3>
                        <p className="text-[#033F99] font-semibold mb-3">
                          {module.tagline}
                        </p>
                        <p className="text-slate-600">{module.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Features */}
                      <div>
                        <p className="font-semibold text-slate-900 mb-3">
                          Key Features:
                        </p>
                        <ul className="space-y-2">
                          {module.features.map((feature, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-slate-700"
                            >
                              <CheckCircle className="h-4 w-4 text-[#033F99] flex-shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Module-specific content */}
                      <div>
                        {module.examples && (
                          <div>
                            <p className="font-semibold text-slate-900 mb-3">
                              Example Signals:
                            </p>
                            <div className="space-y-2">
                              {module.examples.map((ex, i) => (
                                <div
                                  key={i}
                                  className={`p-3 rounded-lg text-sm ${ex.severity === "success"
                                      ? "bg-[#033F99]/10 border-l-4 border-[#033F99]"
                                      : ex.severity === "warning"
                                        ? "bg-yellow-50 border-l-4 border-yellow-500"
                                        : "bg-red-50 border-l-4 border-red-500"
                                    }`}
                                >
                                  <span className="font-semibold">
                                    {ex.type}:
                                  </span>{" "}
                                  {ex.alert}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.metrics && (
                          <div>
                            <p className="font-semibold text-slate-900 mb-3">
                              Sample Metrics:
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {module.metrics.map((m, i) => (
                                <div
                                  key={i}
                                  className="bg-slate-50 p-3 rounded-lg"
                                >
                                  <p className="text-xs text-slate-500">
                                    {m.name}
                                  </p>
                                  <p className="text-lg font-bold text-slate-900">
                                    {m.value}
                                  </p>
                                  <p className="text-xs text-[#033F99]">
                                    {m.trend}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.riskCategories && (
                          <div>
                            <p className="font-semibold text-slate-900 mb-3">
                              Risk Categories:
                            </p>
                            <div className="space-y-2">
                              {module.riskCategories.map((r, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                  <span className="text-sm font-medium">
                                    {r.category}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${r.status === "Low"
                                            ? "bg-[#033F99]/100"
                                            : r.status === "Medium"
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                          }`}
                                        style={{ width: `${r.score}%` }}
                                      />
                                    </div>
                                    <span
                                      className={`text-xs font-semibold ${r.status === "Low"
                                          ? "text-[#033F99]"
                                          : r.status === "Medium"
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                        }`}
                                    >
                                      {r.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.forecasts && (
                          <div>
                            <p className="font-semibold text-slate-900 mb-3">
                              Revenue Forecasts:
                            </p>
                            <div className="space-y-2">
                              {module.forecasts.map((f, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-gradient-to-r from-[#033F99]/10 to-[#033F99]/5 rounded-lg"
                                >
                                  <span className="text-sm font-medium">
                                    {f.period}
                                  </span>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-[#033F99]">
                                      {f.revenue}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {f.confidence} confidence
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.sampleRecommendations && (
                          <div>
                            <p className="font-semibold text-slate-900 mb-3">
                              Sample Recommendations:
                            </p>
                            <div className="space-y-2">
                              {module.sampleRecommendations.map((rec, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
                                >
                                  <Target className="h-4 w-4 text-[#033F99] flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-slate-700">
                                    {rec}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.improvements && (
                          <div>
                            <p className="font-semibold text-slate-900 mb-3">
                              System Improvements:
                            </p>
                            <div className="space-y-2">
                              {module.improvements.map((imp, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                  <span className="text-sm font-medium">
                                    {imp.metric}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">
                                      {imp.before}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-[#033F99]" />
                                    <span className="text-sm font-bold text-[#033F99]">
                                      {imp.after}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Intelligence in Action
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how our intelligence layer transforms your business operations
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              {
                step: "1",
                title: "Collect",
                desc: "Data flows from all modules",
                icon: Activity,
              },
              {
                step: "2",
                title: "Analyze",
                desc: "AI processes patterns",
                icon: Brain,
              },
              {
                step: "3",
                title: "Alert",
                desc: "Signals surface issues",
                icon: Bell,
              },
              {
                step: "4",
                title: "Act",
                desc: "Recommendations guide action",
                icon: Target,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 p-6 rounded-2xl border border-[#033F99]/20 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                      {item.step}
                    </div>
                    <Icon className="h-8 w-8 text-[#033F99] mx-auto mb-3" />
                    <h3 className="font-bold text-lg text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <ChevronRight className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 text-[#033F99]/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#033F99] via-[#033F99] to-[#033F99]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready for Intelligent Business Insights?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Transform your data into actionable intelligence with our AI-powered
            platform
          </p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Start Free Trial
              </button>
            </Link>
            <Link to="/contact">
              <button className="border-2 border-white text-white hover:bg-white/10 font-bold px-10 py-5 rounded-xl transition-all duration-300 text-lg">
                Schedule Demo
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntelligenceOverview;
