import React from "react";
import { Link } from "react-router-dom";
import IBFinanceHub from "../IBFinanceHub";
import { InteractiveDashboard } from "../../components/marketing";
import {
  FileText,
  BookOpen,
  BarChart3,
  PieChart,
  Scale,
  Shield,
  CheckCircle,
  DollarSign,
  Target,
  Zap,
  ArrowRight,
  AlertTriangle,
  Clock,
  Brain,
  Activity,
} from "lucide-react";

const IBFinanceOverview = () => {
  const keyPrinciples = [
    {
      title: "Continuous Close",
      description: "Books that are always ready, not just month-end",
      icon: Clock,
      examples: [
        "Real-time journal entries",
        "Automated reconciliation",
        "Instant trial balance",
      ],
    },
    {
      title: "Adaptive Intelligence",
      description: "AI that learns and improves your finance operations",
      icon: Brain,
      examples: [
        "Smart categorization",
        "Anomaly detection",
        "Self-healing ledgers",
      ],
    },
    {
      title: "Always Compliant",
      description: "Regulatory requirements handled automatically",
      icon: Shield,
      examples: ["GST automation", "TDS calculations", "Audit-ready trails"],
    },
  ];

  const financeFailures = [
    {
      problem: "Month-End Marathon",
      cost: "2 weeks wasted",
      example:
        "Finance team starts month-end close on 1st. Manual journal entries, bank reconciliation, AR/AP matching. Books ready by 15th. Half the month gone.",
      howPrevented:
        "ACCOUNTING module automates journal entries continuously. Reconciliation runs daily. Close completed in 3 days, not 15.",
      module: "Accounting",
      icon: BookOpen,
    },
    {
      problem: "Stale Financials",
      cost: "Delayed decisions",
      example:
        'CEO asks for current P&L on 10th. Finance says "Still working on June close." Board meeting delayed. Decisions based on 45-day old data.',
      howPrevented:
        "REPORTING module shows real-time P&L, BS, Cash Flow. CEO sees June numbers on July 1st. Decisions based on current data.",
      module: "Reporting",
      icon: BarChart3,
    },
    {
      problem: "Budget Blindness",
      cost: "15% variance surprise",
      example:
        "Q3 ends. Finance discovers marketing overspent by ₹50L. No one knew during the quarter. Budget cuts hit other departments.",
      howPrevented:
        'BUDGETING module alerts in real-time: "Marketing at 85% of Q3 budget in Week 8." Corrective action taken immediately.',
      module: "Budgeting",
      icon: PieChart,
    },
    {
      problem: "Reconciliation Hell",
      cost: "100+ hours per month",
      example:
        "Junior accountant matches bank statements manually. 2000 transactions. Takes 5 days. Errors discovered during audit. Rework required.",
      howPrevented:
        "RECONCILIATION module uses ML to match 95% automatically. Human reviews only exceptions. 5 days → 5 hours.",
      module: "Reconciliation",
      icon: Scale,
    },
  ];

  const stats = [
    { metric: "75%", label: "Faster Close", sublabel: "3 days vs 2 weeks" },
    {
      metric: "Real-Time",
      label: "Financial Visibility",
      sublabel: "Not monthly",
    },
    {
      metric: "99.9%",
      label: "Reconciliation Accuracy",
      sublabel: "ML-powered matching",
    },
    { metric: "100%", label: "Compliance", sublabel: "GST, TDS automated" },
    { metric: "95%", label: "Auto-Matching", sublabel: "Bank reconciliation" },
    { metric: "500+", label: "Finance Teams", sublabel: "In production" },
  ];

  return (
    <IBFinanceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-5xl font-bold text-slate-900">
              IB Finance Overview
            </h1>
            <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-bold">
              FLAGSHIP
            </span>
          </div>
          <p className="text-2xl text-slate-600 leading-relaxed">
            Adaptive Financial Planning That{" "}
            <span className="text-[#033F99] font-semibold">Actually Works</span>
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            What is IB Finance?
          </h2>
          <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white mb-6">
            <p className="text-xl leading-relaxed">
              IB Finance is <span className="font-bold underline">NOT</span>{" "}
              just accounting software. It's{" "}
              <span className="font-bold underline">NOT</span> a reporting tool.
              It's{" "}
              <span className="font-bold">an adaptive finance platform</span>{" "}
              that delivers:
            </p>
            <ul className="mt-4 space-y-2 text-lg">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>CONTINUOUS CLOSE</strong> - Books always ready
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>REAL-TIME STATEMENTS</strong> - P&L as of now
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>AI-POWERED AUTOMATION</strong> - Self-healing ledgers
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>ALWAYS COMPLIANT</strong> - Regulatory automation
                </span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            Think of it as{" "}
            <span className="font-semibold">
              your finance function on autopilot
            </span>{" "}
            - AI that automates accounting, continuously forecasts, and
            self-heals data issues before they become problems.
          </p>
        </section>

        {/* Currently in Production Banner */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-3xl text-white flex items-center gap-4">
            <CheckCircle className="h-12 w-12 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-1">
                Currently in Production
              </h3>
              <p className="opacity-90">
                IB Finance is our flagship solution - fully operational with
                complete financial reporting live for 500+ finance teams
              </p>
            </div>
          </div>
        </section>

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

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Real Finance Failures IB Finance Prevents
          </h2>
          <div className="space-y-6">
            {financeFailures.map((failure, index) => {
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
                            ❌ WHAT HAPPENS WITHOUT IB FINANCE:
                          </p>
                          <p className="text-slate-700 bg-red-50 p-3 rounded-lg">
                            {failure.example}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">
                            ✅ HOW IB FINANCE PREVENTS IT:
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
            type="finance"
            title="IB Finance Dashboard Preview"
          />
        </section>

        <section className="bg-gradient-to-r from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Explore IB Finance Modules
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Click on any module in the left sidebar to see detailed features and
            how it transforms your finance function.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/solutions/finance/accounting"
              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#033F99] hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-[#033F99]" />
                <div>
                  <p className="font-bold text-slate-900">
                    Start with Accounting
                  </p>
                  <p className="text-sm text-slate-600">
                    Automated double-entry bookkeeping
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
                  <p className="font-bold">Try IB Finance</p>
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
    </IBFinanceHub>
  );
};

export default IBFinanceOverview;
