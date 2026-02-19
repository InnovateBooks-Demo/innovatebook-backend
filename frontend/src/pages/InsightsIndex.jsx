import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  ArrowRight,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Brain,
  CheckCircle,
  Sparkles,
  Play,
  AlertTriangle,
  TrendingDown,
  Lightbulb,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";
import {
  AnimatedCounter,
  FAQAccordion,
  SecurityBadges,
} from "../components/interactive";

const InsightsIndex = () => {
  const [activeInsight, setActiveInsight] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const insights = [
    {
      id: "cashflow",
      name: "Cashflow Intelligence",
      icon: TrendingUp,
      description:
        "Real-time visibility into cash movements, projections, and liquidity optimization.",
      details:
        "Never be surprised by cash crunches again. Our AI predicts cash flow 3-4 weeks ahead, identifies patterns, and recommends actions.",
      features: [
        "13-week cash forecast",
        "Daily cash position",
        "AR/AP aging analysis",
        "Working capital optimization",
      ],
      metric: { value: "3 weeks", label: "forecast accuracy" },
    },
    {
      id: "profitability",
      name: "Profitability Analysis",
      icon: DollarSign,
      description:
        "Deep dive into margins, costs, and profit drivers across your business.",
      details:
        "Understand profitability at every level—by product, customer, project, or department. Identify what makes money and what drains it.",
      features: [
        "Gross margin tracking",
        "Customer profitability",
        "Product contribution",
        "Cost allocation",
      ],
      metric: { value: "23%", label: "avg margin improvement" },
    },
    {
      id: "performance",
      name: "Performance Metrics",
      icon: Target,
      description:
        "KPIs and dashboards that measure what matters for your growth.",
      details:
        "Custom dashboards that track the metrics that matter to your business. Set targets, monitor progress, and get alerts when things go off track.",
      features: [
        "Custom KPI dashboards",
        "Target vs actual",
        "Trend analysis",
        "Automated alerts",
      ],
      metric: { value: "50+", label: "metrics tracked" },
    },
    {
      id: "planning",
      name: "Planning & Forecasting",
      icon: Calendar,
      description: "AI-powered financial planning and scenario analysis.",
      details:
        "Build budgets, run scenarios, and forecast with confidence. Our AI learns from your history to improve predictions over time.",
      features: [
        "Budget management",
        "Scenario modeling",
        "Rolling forecasts",
        "Variance analysis",
      ],
      metric: { value: "85%", label: "forecast accuracy" },
    },
    {
      id: "reporting",
      name: "Financial Reporting",
      icon: BarChart3,
      description:
        "Comprehensive P&L, Balance Sheet, and custom financial reports.",
      details:
        "Generate any report in seconds, not days. From standard financials to custom management reports—all audit-ready.",
      features: [
        "P&L statements",
        "Balance sheet",
        "Cash flow statement",
        "Custom reports",
      ],
      metric: { value: "1-click", label: "report generation" },
    },
  ];

  const intelligenceFeatures = [
    {
      icon: Brain,
      title: "Predictive Analytics",
      description: "AI predicts issues before they happen",
    },
    {
      icon: AlertTriangle,
      title: "Anomaly Detection",
      description: "Automatically flag unusual patterns",
    },
    {
      icon: Lightbulb,
      title: "Smart Recommendations",
      description: "Get actionable next steps",
    },
    {
      icon: Activity,
      title: "Real-Time Monitoring",
      description: "Live data, not stale reports",
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Companies trust us" },
    { value: 4, suffix: " hrs", label: "Month-end close" },
    { value: 99, suffix: "%", label: "Data accuracy" },
    { value: 10000, prefix: "₹", suffix: "Cr+", label: "Tracked annually" },
  ];

  const faqs = [
    {
      question: "How do Insights differ from regular reports?",
      answer:
        "Regular reports tell you what happened. Insights tell you why it happened, what might happen next, and what you should do about it. Our AI analyzes patterns, detects anomalies, and provides actionable recommendations.",
    },
    {
      question: "Can I customize the dashboards?",
      answer:
        "Absolutely. Every dashboard is fully customizable. Add the metrics that matter to you, set up custom alerts, and create reports tailored to your business needs.",
    },
    {
      question: "How accurate are the forecasts?",
      answer:
        "Our AI-powered forecasts achieve 85%+ accuracy for most businesses. The system learns from your historical data and continuously improves over time.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden bg-[#033F99]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-semibold text-sm mb-8">
              <Brain className="h-4 w-4" />
              <span>AI-Powered Financial Intelligence</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
              Financial Insights
              <br />
              <span className="font-light italic">That Drive Action.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Stop drowning in data. Start making decisions with confidence.
              AI-powered analytics that predict, explain, and recommend.
            </p>

            <div className="flex justify-center gap-4 flex-wrap mb-12">
              <Link
                to="/auth/signup"
                className="inline-flex items-center gap-2 bg-white text-[#033F99] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <Sparkles className="h-5 w-5" />
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                <Play className="h-5 w-5" />
                See Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={`stat-${stat.label}-${index}`}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <p className="text-3xl font-bold text-white">
                    <AnimatedCounter
                      end={stat.value}
                      prefix={stat.prefix || ""}
                      suffix={stat.suffix || ""}
                    />
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

      {/* Interactive Insights Showcase */}
      <section id="insights" data-animate className="py-20 px-4 bg-white">
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["insights"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
              Intelligence Modules
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Five Lenses Into Your Business
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Each module provides deep insights with AI-powered analysis
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <button
                  key={`tab-${insight.id}`}
                  onClick={() => setActiveInsight(index)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${activeInsight === index
                      ? "bg-[#033F99] text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {insight.name.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Active Insight Detail */}
          <div className="bg-gradient-to-br from-slate-50 to-[#033F99]/5 rounded-3xl p-8 md:p-12 border border-slate-100">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(insights[activeInsight].icon, {
                    className: "h-8 w-8 text-[#033F99]",
                  })}
                  <span className="text-[#033F99] font-semibold">
                    {insights[activeInsight].metric.label}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  {insights[activeInsight].name}
                </h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  {insights[activeInsight].details}
                </p>

                <ul className="space-y-3 mb-8">
                  {insights[activeInsight].features.map((feature, i) => (
                    <li
                      key={`feature-${i}`}
                      className="flex items-center gap-3 text-slate-700"
                    >
                      <CheckCircle className="h-5 w-5 text-[#033F99] flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-3xl font-bold text-[#033F99]">
                      {insights[activeInsight].metric.value}
                    </p>
                    <p className="text-sm text-slate-500">
                      {insights[activeInsight].metric.label}
                    </p>
                  </div>
                  <Link
                    to="/auth/signup"
                    className="inline-flex items-center gap-2 text-[#033F99] font-bold hover:gap-3 transition-all"
                  >
                    Try it free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Visual Preview */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
                <div className="aspect-video bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 rounded-xl flex items-center justify-center">
                  {React.createElement(insights[activeInsight].icon, {
                    className: "h-24 w-24 text-[#033F99]/30",
                  })}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Activity className="h-5 w-5 text-[#033F99] mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Real-time</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Brain className="h-5 w-5 text-[#033F99] mx-auto mb-1" />
                    <p className="text-xs text-slate-500">AI-Powered</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Zap className="h-5 w-5 text-[#033F99] mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Instant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* All Insights Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <button
                  key={`card-${insight.id}`}
                  onClick={() => setActiveInsight(index)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${activeInsight === index
                      ? "bg-[#033F99] text-white border-[#033F99] shadow-lg"
                      : "bg-white text-slate-900 border-slate-100 hover:border-[#033F99]/30 hover:shadow-md"
                    }`}
                >
                  <Icon
                    className={`h-8 w-8 mb-3 ${activeInsight === index ? "text-white" : "text-[#033F99]"}`}
                  />
                  <h4 className="font-bold mb-1">
                    {insight.name.split(" ")[0]}
                  </h4>
                  <p
                    className={`text-sm ${activeInsight === index ? "text-white/70" : "text-slate-500"}`}
                  >
                    {insight.description.substring(0, 50)}...
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intelligence Features */}
      <section
        id="intelligence"
        data-animate
        className="py-20 px-4 bg-slate-900"
      >
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["intelligence"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#033F99] text-white text-sm font-semibold rounded-full mb-4">
              AI Intelligence
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Not Just Reports. Intelligence.
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Our AI doesn't just show data—it explains patterns, predicts
              outcomes, and recommends actions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {intelligenceFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={`ai-feature-${feature.title}-${index}`}
                  className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-[#033F99]/50 hover:bg-slate-800 transition-all group"
                >
                  <div className="w-14 h-14 bg-[#033F99]/20 group-hover:bg-[#033F99]/30 rounded-xl flex items-center justify-center mb-6 transition-all">
                    <Icon className="h-7 w-7 text-[#033F99]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" data-animate className="py-20 px-4 bg-white">
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible["faq"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              Questions About Insights
            </h2>
          </div>

          <FAQAccordion faqs={faqs} variant="bordered" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for Real Financial Intelligence?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join 500+ companies making smarter decisions with Innovate Books.
            Start your 14-day free trial today.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 bg-white text-[#033F99] px-10 py-5 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-105 shadow-xl"
            >
              <Sparkles className="h-5 w-5" />
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-10 py-5 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img
                src="/innovate-books-logo-new.png"
                alt="Innovate Books"
                className="h-8 w-auto"
              />
              <span className="font-bold">Innovate Books</span>
            </div>
            <p className="text-slate-400 text-sm">
              &copy; 2025 Innovate Books. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InsightsIndex;
