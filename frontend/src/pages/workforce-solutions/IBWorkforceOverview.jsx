import React from "react";
import { Link } from "react-router-dom";
import IBWorkforceHub from "../IBWorkforceHub";
import { InteractiveDashboard } from "../../components/marketing";
import {
  Users,
  Calculator,
  Heart,
  Award,
  GraduationCap,
  CheckCircle,
  DollarSign,
  Target,
  Zap,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";

const IBWorkforceOverview = () => {
  const keyPrinciples = [
    {
      title: "ROI-Driven Management",
      description: "Every employee linked to revenue contribution",
      icon: TrendingUp,
      examples: [
        "Calculate ROI per employee",
        "Link salary costs to revenue impact",
        "Identify high-value contributors",
      ],
    },
    {
      title: "Cost Visibility",
      description: "Total cost of employment in one view",
      icon: DollarSign,
      examples: [
        "Salary, benefits, and overhead combined",
        "Department-wise cost allocation",
        "Project-based cost tracking",
      ],
    },
    {
      title: "Predictive Analytics",
      description: "AI-powered workforce insights",
      icon: BarChart3,
      examples: [
        "Flight risk prediction",
        "Performance trajectory analysis",
        "Hiring need forecasting",
      ],
    },
  ];

  const workforceFailures = [
    {
      problem: "Invisible Employee ROI",
      cost: "Misallocated resources",
      example:
        "Company cannot identify which employees drive revenue. High performers leave while low performers stay. Team allocation based on gut feel.",
      howPrevented:
        "PERFORMANCE module links every employee to revenue contribution. Sarah generates ₹14L/mo at ₹2.1L cost = 670% ROI. Data drives decisions.",
      module: "Performance",
      icon: Award,
    },
    {
      problem: "Payroll Chaos",
      cost: "35% time wasted",
      example:
        "Finance team spends 2 weeks on monthly payroll. Manual calculations lead to errors. Compliance issues pile up.",
      howPrevented:
        "PAYROLL module automates everything: TDS, PF, ESI. One-click processing. 100% compliance. Finance freed for strategic work.",
      module: "Payroll",
      icon: Calculator,
    },
    {
      problem: "Turnover Surprises",
      cost: "6-9 months salary per exit",
      example:
        "Star performer resigns. No warning signs detected. Replacement takes 6 months. Knowledge lost. Team morale drops.",
      howPrevented:
        "AI detects flight risk early: engagement drop, market salary gap, tenure patterns. Proactive retention before resignation.",
      module: "Performance",
      icon: Users,
    },
    {
      problem: "Training ROI Unknown",
      cost: "Wasted L&D budget",
      example:
        "Company spends ₹50L on training. No measurement of impact. Same skill gaps persist. Budget cut next year.",
      howPrevented:
        "LEARNING module tracks every training investment. Measures productivity improvement. Shows ₹3 return per ₹1 spent on relevant skills.",
      module: "Learning",
      icon: GraduationCap,
    },
  ];

  const stats = [
    {
      metric: "670%",
      label: "Avg Employee ROI",
      sublabel: "Quantified and tracked",
    },
    {
      metric: "35%",
      label: "Payroll Time Saved",
      sublabel: "Automated processing",
    },
    {
      metric: "18%",
      label: "Turnover Reduction",
      sublabel: "Predictive retention",
    },
    {
      metric: "₹2.1L",
      label: "Cost Visibility",
      sublabel: "Per employee per month",
    },
    { metric: "100%", label: "Compliance", sublabel: "TDS, PF, ESI automated" },
    { metric: "3x", label: "Training ROI", sublabel: "Measurable outcomes" },
  ];

  return (
    <IBWorkforceHub>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            IB Workforce Overview
          </h1>
          <p className="text-2xl text-slate-600 leading-relaxed">
            Human Capital Intelligence That{" "}
            <span className="text-[#033F99] font-semibold">Drives ROI</span>
          </p>
        </div>

        {/* What is IB Workforce */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            What is IB Workforce?
          </h2>
          <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white mb-6">
            <p className="text-xl leading-relaxed">
              IB Workforce is <span className="font-bold underline">NOT</span>{" "}
              just HR software. It's{" "}
              <span className="font-bold underline">NOT</span> a payroll tool.
              It's{" "}
              <span className="font-bold">
                a human capital intelligence platform
              </span>{" "}
              that transforms workforce data into:
            </p>
            <ul className="mt-4 space-y-2 text-lg">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>MEASURABLE ROI</strong> per employee
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>TOTAL COST</strong> visibility
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>PREDICTIVE INSIGHTS</strong> for retention
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>AUTOMATED COMPLIANCE</strong>
                </span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            Think of it as{" "}
            <span className="font-semibold">your CFO's view of HR</span> - not
            just names and roles, but financial impact, cost allocation, and
            strategic workforce decisions powered by data.
          </p>
        </section>

        {/* Key Principles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Core Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {keyPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#033F99] hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{principle.description}</p>
                  <div className="space-y-2">
                    {principle.examples.map((example, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workforce Failures Prevented */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Real Workforce Failures IB Workforce Prevents
          </h2>
          <div className="space-y-6">
            {workforceFailures.map((failure, index) => {
              const Icon = failure.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden"
                >
                  <div className="flex items-start gap-6 p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {failure.problem}
                        </h3>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                          {failure.cost}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">
                            ❌ WHAT HAPPENS WITHOUT IB WORKFORCE:
                          </p>
                          <p className="text-slate-700 bg-red-50 p-3 rounded-lg">
                            {failure.example}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">
                            ✅ HOW IB WORKFORCE PREVENTS IT:
                          </p>
                          <p className="text-slate-700 bg-green-50 p-3 rounded-lg">
                            {failure.howPrevented}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Icon className="h-5 w-5 text-[#033F99]" />
                        <span className="text-sm font-semibold text-[#033F99]">
                          Powered by {failure.module} Module
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Measurable Business Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#033F99] to-[#033F99] p-6 rounded-3xl text-white text-center"
              >
                <p className="text-5xl font-bold mb-2">{stat.metric}</p>
                <p className="text-xl font-semibold mb-1">{stat.label}</p>
                <p className="text-sm opacity-80">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Dashboard Preview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            See It In Action
          </h2>
          <InteractiveDashboard
            type="workforce"
            title="IB Workforce Dashboard Preview"
          />
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Explore IB Workforce Modules
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Click on any module in the left sidebar to see detailed features and
            how it transforms your workforce management.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/solutions/workforce/employees"
              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#033F99] hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#033F99]" />
                <div>
                  <p className="font-bold text-slate-900">
                    Start with Employees
                  </p>
                  <p className="text-sm text-slate-600">
                    The foundation of workforce intelligence
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#033F99] group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/auth/signup"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6" />
                <div>
                  <p className="font-bold">Try IB Workforce</p>
                  <p className="text-sm opacity-90">
                    Start your free trial today
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </IBWorkforceHub>
  );
};

export default IBWorkforceOverview;
