import React from "react";
import { Link } from "react-router-dom";
import IBOperationsHub from "../IBOperationsHub";
import { InteractiveDashboard } from "../../components/marketing";
import {
  Settings,
  Building2,
  Boxes,
  Cog,
  FileCheck,
  Activity,
  CheckCircle,
  DollarSign,
  Target,
  Zap,
  ArrowRight,
  AlertTriangle,
  TrendingDown,
  Clock,
  BarChart3,
} from "lucide-react";

const IBOperationsOverview = () => {
  const keyPrinciples = [
    {
      title: "Financial Visibility",
      description: "Every operational decision linked to P&L impact",
      icon: BarChart3,
      examples: [
        "Real-time project margins",
        "Live inventory COGS",
        "Asset depreciation tracking",
      ],
    },
    {
      title: "Predictive Control",
      description: "See problems before they become costly",
      icon: TrendingDown,
      examples: [
        "Cost overrun predictions",
        "Inventory stockout alerts",
        "Maintenance scheduling",
      ],
    },
    {
      title: "Integrated Operations",
      description: "All operational data in one financial view",
      icon: Settings,
      examples: [
        "Projects + Assets + Inventory",
        "Procurement + Production",
        "Unified reporting",
      ],
    },
  ];

  const operationsFailures = [
    {
      problem: "Project Cost Overruns",
      cost: "23% average overrun",
      example:
        "Project Phoenix planned for ₹50L runs to ₹62L. Team realizes overrun only at completion. Margin wiped out. Client unhappy.",
      howPrevented:
        'PROJECTS module shows real-time costs vs budget. At 60% milestone, system alerts: "On track for ₹4.2L overrun." Team adjusts resource allocation.',
      module: "Projects",
      icon: Building2,
    },
    {
      problem: "Inventory-Finance Mismatch",
      cost: "Audit failures, wrong COGS",
      example:
        "Physical count shows ₹1.2Cr inventory. Finance reports ₹1.5Cr. Difference discovered during audit. Emergency reconciliation.",
      howPrevented:
        "INVENTORY module syncs every transaction. Real-time COGS calculation. Stock value always matches finance. Zero surprises.",
      module: "Inventory",
      icon: Boxes,
    },
    {
      problem: "Asset Tracking Chaos",
      cost: "Missed depreciation, ghost assets",
      example:
        "Company has 500 laptops on books. Physical verification finds 420. ₹80L in ghost assets. Depreciation overcalculated for years.",
      howPrevented:
        "ASSETS module tracks every item from purchase to disposal. Barcode scanning. Location tracking. Accurate depreciation always.",
      module: "Assets",
      icon: Cog,
    },
    {
      problem: "Procurement Delays",
      cost: "Production stoppage",
      example:
        "Raw material stockout halts production for 5 days. Rush order costs 40% premium. Delivery deadline missed. Penalty applied.",
      howPrevented:
        "PROCUREMENT module monitors reorder levels. Auto-generates POs 4 weeks before stockout. Vendor lead times factored in.",
      module: "Procurement",
      icon: FileCheck,
    },
  ];

  const stats = [
    {
      metric: "23%",
      label: "Overrun Prevention",
      sublabel: "Costs caught early",
    },
    { metric: "40%", label: "Faster Close", sublabel: "Operations to finance" },
    {
      metric: "₹4.2L",
      label: "Avg Savings/Project",
      sublabel: "Through early detection",
    },
    {
      metric: "99.2%",
      label: "Inventory Accuracy",
      sublabel: "Real-time sync",
    },
    { metric: "0", label: "Ghost Assets", sublabel: "Full lifecycle tracking" },
    {
      metric: "35%",
      label: "Efficiency Gain",
      sublabel: "Process optimization",
    },
  ];

  return (
    <IBOperationsHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            IB Operations Overview
          </h1>
          <p className="text-2xl text-slate-600 leading-relaxed">
            Operational Intelligence With{" "}
            <span className="text-[#033F99] font-semibold">P&L Impact</span>
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            What is IB Operations?
          </h2>
          <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white mb-6">
            <p className="text-xl leading-relaxed">
              IB Operations is <span className="font-bold underline">NOT</span>{" "}
              just project management. It's{" "}
              <span className="font-bold underline">NOT</span> an ERP. It's{" "}
              <span className="font-bold">
                an operational intelligence platform
              </span>{" "}
              that connects:
            </p>
            <ul className="mt-4 space-y-2 text-lg">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>PROJECTS</strong> to real-time P&L
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>INVENTORY</strong> to live COGS
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>ASSETS</strong> to accurate depreciation
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <span>
                  <strong>EVERY DECISION</strong> to financial impact
                </span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            Think of it as{" "}
            <span className="font-semibold">
              your CFO embedded in operations
            </span>{" "}
            - seeing every project cost, every inventory movement, every asset
            change through the lens of financial impact.
          </p>
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
            Real Operations Failures IB Operations Prevents
          </h2>
          <div className="space-y-6">
            {operationsFailures.map((failure, index) => {
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
                            ❌ WHAT HAPPENS WITHOUT IB OPERATIONS:
                          </p>
                          <p className="text-slate-700 bg-red-50 p-3 rounded-lg">
                            {failure.example}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">
                            ✅ HOW IB OPERATIONS PREVENTS IT:
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
            type="operations"
            title="IB Operations Dashboard Preview"
          />
        </section>

        <section className="bg-gradient-to-r from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Explore IB Operations Modules
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Click on any module in the left sidebar to see detailed features and
            how it transforms your operations.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/solutions/operations/projects"
              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#033F99] hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-[#033F99]" />
                <div>
                  <p className="font-bold text-slate-900">
                    Start with Projects
                  </p>
                  <p className="text-sm text-slate-600">
                    Real-time project P&L tracking
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
                  <p className="font-bold">Try IB Operations</p>
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
    </IBOperationsHub>
  );
};

export default IBOperationsOverview;
