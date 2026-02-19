import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Briefcase,
  Award,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  Sparkles,
  GraduationCap,
  Heart,
  Calculator,
  FileText,
  ChevronRight,
  Package,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const WorkforceSolution = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const problems = [
    {
      icon: Users,
      title: "Talent Black Box",
      problem: "No visibility into employee ROI or revenue contribution",
      solution:
        "WORKFORCE module links every employee to measurable financial impact",
    },
    {
      icon: DollarSign,
      title: "Cost Blind Spots",
      problem: "Payroll, benefits, and expenses scattered across systems",
      solution:
        "HUMAN CAPITAL LEDGER consolidates all workforce costs in one view",
    },
    {
      icon: Target,
      title: "Allocation Guesswork",
      problem: "No data to optimize team assignments or hiring decisions",
      solution: "AI ANALYTICS recommends optimal resource allocation by ROI",
    },
  ];

  const modules = [
    {
      id: "employees",
      name: "Employees",
      icon: Users,
      tagline: "Complete Employee Registry",
      description:
        "Centralized employee data with full profile management, role tracking, and organizational hierarchy.",
      features: [
        "Employee profiles with contact & emergency info",
        "Role and department assignments",
        "Organizational hierarchy visualization",
        "Employment history tracking",
        "Document management (contracts, IDs)",
        "Custom fields for company-specific data",
      ],
    },
    {
      id: "payroll",
      name: "Payroll",
      icon: Calculator,
      tagline: "Automated Compensation Management",
      description:
        "Complete payroll processing with tax calculations, deductions, and compliance automation for India.",
      features: [
        "Monthly payroll processing",
        "Tax calculations (TDS, PF, ESI)",
        "Salary structure management",
        "Bonus and incentive tracking",
        "Payslip generation",
        "Statutory compliance reports",
      ],
    },
    {
      id: "benefits",
      name: "Benefits",
      icon: Heart,
      tagline: "Employee Benefits & Equity",
      description:
        "Manage health insurance, ESOPs, and other benefits with real-time cost tracking and enrollment.",
      features: [
        "Health insurance enrollment",
        "ESOP/equity grant management",
        "Leave balance tracking",
        "Reimbursement processing",
        "Benefit cost allocation",
        "Vesting schedule tracking",
      ],
    },
    {
      id: "performance",
      name: "Performance",
      icon: Award,
      tagline: "Performance & ROI Analytics",
      description:
        "Track employee performance and link it to revenue contribution and business outcomes.",
      features: [
        "Goal setting and tracking",
        "Performance reviews",
        "Revenue contribution analysis",
        "ROI per employee calculation",
        "Skill gap identification",
        "Promotion recommendations",
      ],
    },
    {
      id: "learning",
      name: "Learning",
      icon: GraduationCap,
      tagline: "Training & Development",
      description:
        "Track training investments and measure their impact on employee productivity and retention.",
      features: [
        "Training program management",
        "Certification tracking",
        "Learning budget allocation",
        "Skill development paths",
        "Training ROI measurement",
        "External course integration",
      ],
    },
  ];

  const stats = [
    { metric: "670%", label: "Average Employee ROI" },
    { metric: "35%", label: "Payroll Time Saved" },
    { metric: "₹2.1L", label: "Avg Monthly Cost/Employee" },
    { metric: "18%", label: "Turnover Reduction" },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Quantify Employee ROI",
      description:
        "Link every employee to revenue contribution and measure real business impact",
      metric: "670% avg ROI",
    },
    {
      icon: Clock,
      title: "Automate Payroll",
      description:
        "Reduce payroll processing time with automated calculations and compliance",
      metric: "35% time saved",
    },
    {
      icon: Target,
      title: "Optimize Allocation",
      description:
        "Data-driven decisions on hiring, team composition, and resource deployment",
      metric: "25% better allocation",
    },
    {
      icon: Award,
      title: "Reduce Turnover",
      description:
        "Identify flight risks early and implement targeted retention strategies",
      metric: "18% reduction",
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
              <Users className="h-6 w-6 text-[#033F99]" />
              <span className="text-[#033F99] font-bold text-lg">
                IB Workforce
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                Human Capital Intelligence
              </span>
              <br />
              <span className="text-slate-900">That Drives ROI</span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform workforce data into measurable financial ROI. Link every
              employee to revenue impact and optimize human capital allocation
              with AI.
            </p>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
              <Link to="/auth/signup">
                <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#011B4E] text-white font-bold px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link to="/solutions/workforce/overview">
                <button className="bg-white border-2 border-[#033F99] text-[#033F99] hover:bg-[#033F99] hover:text-white font-bold px-10 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
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

      {/* Why IB Workforce */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Why IB Workforce?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every workforce management failure starts with a lack of
              visibility into human capital ROI
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
            IB Workforce is <span className="underline font-bold">NOT</span>{" "}
            just HR software. It's about
            <span className="font-bold"> FINANCIAL INTELLIGENCE</span> -
            understanding who creates value, how much they cost, and where to
            invest in talent for maximum ROI.
          </p>
        </div>
      </section>

      {/* Workforce Modules */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              5 Integrated Workforce Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Complete human capital management with financial intelligence
              built-in
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

      {/* Human Capital Ledger Demo */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Human Capital Ledger
            </h2>
            <p className="text-xl text-slate-600">
              See the financial story behind every employee
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-[#C4D9F4]/50 p-8 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SM</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Sarah Mehta</p>
                <p className="text-slate-600">
                  Product Engineering Lead • 3.5 years
                </p>
              </div>
              <div className="ml-auto">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                  High Performer
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900">₹2.1L</p>
                <p className="text-xs text-slate-500">Salary + Benefits</p>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">
                  Revenue Attribution
                </p>
                <p className="text-2xl font-bold text-[#033F99]">₹14.1L/mo</p>
                <p className="text-xs text-slate-500">14% of ARR</p>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">ROI</p>
                <p className="text-2xl font-bold text-[#033F99]">670%</p>
                <p className="text-xs text-slate-500">Above benchmark</p>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">Flight Risk</p>
                <p className="text-2xl font-bold text-green-600">Low</p>
                <p className="text-xs text-slate-500">12% probability</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                AI Insight:
              </p>
              <p className="text-slate-600">
                "Sarah's ROI is 2.3x team average. Consider promotion to Senior
                Lead (+₹40K/mo) to reduce flight risk and retain ₹14L/mo revenue
                contribution."
              </p>
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
              Transform workforce management into a competitive advantage
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
            Make Human Capital Your Competitive Advantage
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join companies using IB Workforce to quantify employee ROI and
            optimize talent allocation
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

export default WorkforceSolution;
