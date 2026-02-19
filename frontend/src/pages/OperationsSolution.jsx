import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Boxes,
  Building2,
  Clock,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Package,
  Wrench,
  FileCheck,
  Cog,
  Activity,
  ChevronRight,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const OperationsSolution = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const problems = [
    {
      icon: Package,
      title: "Project Cost Blindness",
      problem: "Projects run over budget with no early warning signals",
      solution:
        "PROJECTS module tracks real-time costs and predicts overruns before they happen",
    },
    {
      icon: Boxes,
      title: "Inventory-Finance Gap",
      problem: "Stock values don't sync with financial reports",
      solution:
        "INVENTORY module links every item to COGS and working capital impact",
    },
    {
      icon: Wrench,
      title: "Asset Depreciation Chaos",
      problem: "Fixed assets tracked in spreadsheets, depreciation manual",
      solution:
        "ASSETS module automates depreciation and maintenance cost tracking",
    },
  ];

  const modules = [
    {
      id: "projects",
      name: "Projects",
      icon: Building2,
      tagline: "Project P&L Intelligence",
      description:
        "Track projects with real-time cost allocation, revenue recognition, and margin analysis.",
      features: [
        "Project budget vs actual tracking",
        "Resource cost allocation",
        "Revenue recognition scheduling",
        "Milestone-based billing",
        "Margin analysis per project",
        "Time tracking integration",
      ],
    },
    {
      id: "assets",
      name: "Assets",
      icon: Cog,
      tagline: "Fixed Asset Management",
      description:
        "Complete asset lifecycle management with automated depreciation and maintenance tracking.",
      features: [
        "Asset register & categorization",
        "Multiple depreciation methods",
        "Maintenance scheduling",
        "Asset transfer & disposal",
        "Insurance tracking",
        "Location & custodian management",
      ],
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: Boxes,
      tagline: "Stock-to-Finance Sync",
      description:
        "Real-time inventory tracking with automatic COGS calculation and working capital impact.",
      features: [
        "Multi-location stock tracking",
        "Batch & serial number management",
        "Automatic COGS calculation",
        "Reorder point alerts",
        "Stock aging analysis",
        "Working capital optimization",
      ],
    },
    {
      id: "procurement",
      name: "Procurement",
      icon: FileCheck,
      tagline: "Purchase Intelligence",
      description:
        "Streamlined procurement with vendor comparison, approval workflows, and spend analytics.",
      features: [
        "Purchase requisition workflow",
        "Vendor comparison & scoring",
        "Contract management",
        "Spend analytics by category",
        "Budget compliance checks",
        "GRN & invoice matching",
      ],
    },
    {
      id: "production",
      name: "Production",
      icon: Activity,
      tagline: "Manufacturing Cost Tracking",
      description:
        "Bill of materials, production orders, and manufacturing cost analysis for makers.",
      features: [
        "Bill of Materials (BOM)",
        "Production order management",
        "Work center utilization",
        "Scrap & yield tracking",
        "Manufacturing cost variance",
        "Quality control integration",
      ],
    },
  ];

  const stats = [
    { metric: "23%", label: "Cost Overrun Prevention" },
    { metric: "40%", label: "Faster Close Cycles" },
    { metric: "₹4.2L", label: "Avg Savings/Project" },
    { metric: "99.2%", label: "Inventory Accuracy" },
  ];

  const benefits = [
    {
      icon: TrendingDown,
      title: "Prevent Cost Overruns",
      description:
        "AI predicts budget risks 4 weeks in advance with simulation modeling",
      metric: "23% reduction",
    },
    {
      icon: Clock,
      title: "Real-Time Margins",
      description:
        "See project and product margins update instantly as costs are incurred",
      metric: "Live P&L",
    },
    {
      icon: Settings,
      title: "Optimize Operations",
      description:
        "Data-driven decisions on resource allocation, inventory levels, and asset utilization",
      metric: "35% efficiency gain",
    },
    {
      icon: BarChart3,
      title: "Financial Visibility",
      description:
        "Every operational metric links directly to P&L and balance sheet impact",
      metric: "360° view",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#EBF3FC]/30">
      <SharedNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#033F99] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 text-[#033F99] hover:text-[#033F99] font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Solutions
          </Link>

          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-[#EBF3FC] px-6 py-3 rounded-full mb-6">
              <Settings className="h-6 w-6 text-[#033F99]" />
              <span className="text-[#033F99] font-bold text-lg">
                IB Operations
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                Operational Intelligence
              </span>
              <br />
              <span className="text-slate-900">With P&L Impact</span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              See the financial ripple effect of every operational decision.
              Connect projects, assets, and inventory directly to P&L impact in
              real-time.
            </p>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
              <Link to="/auth/signup">
                <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#011B4E] text-white font-bold px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link to="/solutions/operations/overview">
                <button className="bg-white border-2 border-[#033F99] text-[#033F99] hover:bg-[#033F99] hover:text-white font-bold px-10 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Explore Modules
                  <ChevronRight className="h-5 w-5" />
                </button>
              </Link>
              <Link to="/contact">
                <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-10 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg">
                  Book a Demo
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-[#C4D9F4]"
                >
                  <p className="text-3xl font-bold text-[#033F99] mb-1">
                    {stat.metric}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why IB Operations */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Why IB Operations?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every operational surprise impacts your bottom line. IB Operations
              gives you foresight.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200 hover:border-[#033F99] hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-[#EBF3FC] rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-[#033F99]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-red-600 font-medium mb-3 flex items-start gap-2">
                    <span className="text-red-500">✗</span> {item.problem}
                  </p>
                  <p className="text-green-600 font-medium flex items-start gap-2">
                    <span className="text-green-500">✓</span> {item.solution}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Principle */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#033F99] to-[#033F99]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The Core Principle
          </h2>
          <p className="text-xl leading-relaxed">
            IB Operations is <span className="underline font-bold">NOT</span>{" "}
            just project management or ERP. It's about
            <span className="font-bold"> FINANCIAL VISIBILITY</span> -
            understanding how every operational decision impacts your P&L,
            balance sheet, and cash flow in real-time.
          </p>
        </div>
      </section>

      {/* Operations Modules */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              5 Integrated Operations Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Complete operational control with financial intelligence built-in
            </p>
          </div>

          <div className="space-y-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#033F99] transition-all overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-slate-900">
                            {module.name}
                          </h3>
                          <span className="text-[#033F99] font-semibold">
                            {module.tagline}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-4">
                          {module.description}
                        </p>
                        <div className="grid md:grid-cols-3 gap-3">
                          {module.features.map((feature, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-sm text-slate-700"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operations Digital Twin */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Operations Digital Twin
            </h2>
            <p className="text-xl text-slate-600">
              Simulate financial outcomes before making operational changes
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4]/50 p-8 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#033F99] mb-3">
                  ⚠️ Simulation Alert
                </p>
                <p className="text-slate-700 leading-relaxed">
                  "Delaying{" "}
                  <span className="font-semibold">Project Phoenix</span> by 2
                  weeks increases total cost by{" "}
                  <span className="font-semibold text-[#033F99]">₹4.2L</span>{" "}
                  and impacts Q4 gross margins by{" "}
                  <span className="font-semibold text-[#033F99]">1.8%</span>.
                  Consider accelerating resource allocation."
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl mb-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-600 mb-1">
                    Original Timeline
                  </p>
                  <p className="font-bold text-slate-900 text-lg">12 weeks</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">
                    Delayed Timeline
                  </p>
                  <p className="font-bold text-[#033F99] text-lg">14 weeks</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Cost Impact</p>
                  <p className="font-bold text-red-600 text-lg">+₹4.2L</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Margin Impact</p>
                  <p className="font-bold text-red-600 text-lg">-1.8%</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] text-white px-6 py-2 rounded-lg font-semibold hover:from-[#033F99] hover:to-[#011B4E] transition-all">
                Accelerate Resources
              </button>
              <button className="border border-[#033F99] text-[#033F99] px-6 py-2 rounded-lg font-semibold hover:bg-[#EBF3FC] transition-all">
                Accept Delay
              </button>
              <button className="border border-slate-300 text-slate-600 px-6 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-all">
                Run New Scenario
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Business Impact
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Turn operations into a source of competitive advantage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const BenIcon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mb-6">
                    <BenIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{benefit.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-2xl font-bold text-[#033F99]">
                      {benefit.metric}
                    </p>
                  </div>
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
            Turn Operations Into Competitive Advantage
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Predict overruns, optimize resources, correlate every decision to
            financial impact
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

export default OperationsSolution;
