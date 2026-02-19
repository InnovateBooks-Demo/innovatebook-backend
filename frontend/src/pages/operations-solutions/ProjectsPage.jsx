import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBOperationsHub from "../IBOperationsHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Building2,
  CheckCircle,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  Play,
  AlertTriangle,
  Target,
  Users,
  ArrowRight,
} from "lucide-react";

const ProjectsPage = () => {
  const [selectedProject, setSelectedProject] = useState(0);

  const features = [
    {
      title: "Budget vs Actual Tracking",
      description: "Real-time comparison of planned vs actual costs.",
      items: [
        "Line-item budgets",
        "Actual cost capture",
        "Variance analysis",
        "Forecast updates",
      ],
    },
    {
      title: "Resource Cost Allocation",
      description: "Track labor and resource costs per project.",
      items: [
        "Hourly rate tracking",
        "Time allocation",
        "Billable vs non-billable",
        "Resource utilization",
      ],
    },
    {
      title: "Revenue Recognition",
      description: "Recognize revenue based on milestones and completion.",
      items: [
        "Milestone-based recognition",
        "Percentage of completion",
        "Deferred revenue tracking",
        "ASC 606 compliance",
      ],
    },
    {
      title: "Project P&L",
      description: "Real-time profit and loss statement per project.",
      items: [
        "Revenue attribution",
        "Direct costs",
        "Overhead allocation",
        "Margin analysis",
      ],
    },
  ];

  const benefits = [
    {
      metric: "23%",
      label: "Overrun Prevention",
      description: "Early detection",
    },
    {
      metric: "₹4.2L",
      label: "Avg Savings/Project",
      description: "Cost control",
    },
    {
      metric: "Real-Time",
      label: "Margin Visibility",
      description: "Live P&L",
    },
  ];

  const projects = [
    {
      name: "ERP Implementation - TechCorp",
      budget: 4500000,
      spent: 3200000,
      revenue: 5500000,
      progress: 71,
      status: "On Track",
      daysLeft: 45,
    },
    {
      name: "Cloud Migration - FinanceHub",
      budget: 2800000,
      spent: 2950000,
      revenue: 3200000,
      progress: 88,
      status: "At Risk",
      daysLeft: 12,
    },
    {
      name: "Mobile App - RetailMax",
      budget: 1500000,
      spent: 800000,
      revenue: 1800000,
      progress: 53,
      status: "On Track",
      daysLeft: 60,
    },
  ];

  const testimonials = [
    {
      quote:
        "We caught a ₹15L budget overrun 3 weeks before it happened. The early warning system is worth its weight in gold.",
      author: "Vikram Mehta",
      role: "PMO Head",
      company: "Consulting Giants",
      rating: 5,
    },
    {
      quote:
        "Real-time project P&L changed how we make decisions. We now know profitability before the project ends.",
      author: "Anita Desai",
      role: "CFO",
      company: "BuildRight Solutions",
      rating: 5,
    },
    {
      quote:
        "Resource cost allocation finally gives us true project costs including overhead. Our pricing is now much more accurate.",
      author: "Rajesh Kumar",
      role: "Operations Director",
      company: "ServiceFirst",
      rating: 5,
    },
    {
      quote:
        "ASC 606 revenue recognition was a nightmare. Now it's automated based on milestones. Auditors are impressed.",
      author: "Priya Menon",
      role: "Finance Controller",
      company: "TechConsult",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "Consulting Giants",
    industry: "Professional Services",
    employees: "1,200+",
    logo: "CG",
    challenge:
      "No real-time visibility into project profitability. Budget overruns discovered only at project end, averaging ₹8L per project.",
    solution:
      "Deployed IB Operations Projects with live budget tracking, resource cost allocation, and real-time P&L dashboards.",
    results: [
      {
        metric: "₹2.4Cr",
        label: "Annual Savings",
        detail: "Prevented overruns",
      },
      { metric: "23%", label: "Margin Improvement", detail: "Better pricing" },
      {
        metric: "3 Weeks",
        label: "Earlier Alerts",
        detail: "Proactive action",
      },
      {
        metric: "Zero",
        label: "Surprise Losses",
        detail: "Real-time visibility",
      },
    ],
    quote:
      "We haven't had a surprise project loss in 18 months. Real-time P&L visibility transformed how we manage projects.",
    quotePerson: "Vikram Mehta",
    quoteRole: "PMO Head",
  };

  const selected = projects[selectedProject];
  const margin = (
    ((selected.revenue - selected.spent) / selected.revenue) *
    100
  ).toFixed(1);
  const budgetVariance = (
    ((selected.budget - selected.spent) / selected.budget) *
    100
  ).toFixed(1);

  return (
    <IBOperationsHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Projects</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Financial Project Management
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Real-time project P&L tracking with budget monitoring, resource cost
            allocation, and revenue recognition.
          </p>
        </div>

        {/* Benefits */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#033F99] to-[#033F99] p-6 rounded-2xl text-white text-center"
              >
                <p className="text-4xl font-bold mb-2">{b.metric}</p>
                <p className="text-lg font-semibold mb-1">{b.label}</p>
                <p className="text-sm opacity-80">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Core Capabilities
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] transition-all hover:shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-600 mb-4">{f.description}</p>
                <ul className="space-y-2">
                  {f.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Video Walkthrough */}
        <VideoWalkthrough
          title="Project P&L Tracking Demo"
          description="Real-time budget monitoring and margin analysis"
          duration="5 min"
          moduleName="IB Operations"
          subModule="Projects Module"
          Icon={Building2}
          category="analytics"
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Live Preview
            </span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            {/* Project Selector */}
            <div className="bg-slate-100 p-4 flex items-center gap-4">
              {projects.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedProject(i)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedProject === i
                      ? "bg-[#033F99] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  {p.name.split(" - ")[1]}
                </button>
              ))}
            </div>

            {/* Project Dashboard */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {selected.name}
                  </h3>
                  <p className="text-slate-600">
                    {selected.daysLeft} days remaining
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full font-semibold ${selected.status === "On Track"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {selected.status === "At Risk" && (
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                  )}
                  {selected.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-900">
                    {selected.progress}%
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${selected.status === "On Track"
                        ? "bg-green-500"
                        : "bg-amber-500"
                      }`}
                    style={{ width: `${selected.progress}%` }}
                  />
                </div>
              </div>

              {/* Financials Grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Budget</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{(selected.budget / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Spent</p>
                  <p
                    className={`text-2xl font-bold ${selected.spent > selected.budget ? "text-red-600" : "text-slate-900"}`}
                  >
                    ₹{(selected.spent / 100000).toFixed(1)}L
                  </p>
                  <p
                    className={`text-xs ${parseFloat(budgetVariance) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {parseFloat(budgetVariance) >= 0 ? "+" : ""}
                    {budgetVariance}% vs budget
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{(selected.revenue / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="bg-[#EBF3FC] p-4 rounded-xl border border-[#C4D9F4]">
                  <p className="text-sm text-[#033F99] mb-1">Current Margin</p>
                  <p className="text-2xl font-bold text-[#033F99]">{margin}%</p>
                  <p className="text-xs text-slate-600">
                    ₹{((selected.revenue - selected.spent) / 100000).toFixed(1)}
                    L profit
                  </p>
                </div>
              </div>

              {/* Warning for At Risk */}
              {selected.status === "At Risk" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      Budget Overrun Alert
                    </p>
                    <p className="text-sm text-amber-700">
                      Project is ₹
                      {((selected.spent - selected.budget) / 100000).toFixed(1)}
                      L over budget. Review resource allocation and scope.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Case Study */}
        <CaseStudy data={caseStudyData} />

        {/* Testimonials */}
        <TestimonialSection testimonials={testimonials} />

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready for Real-Time Project Visibility?
              </h2>
              <p className="opacity-90">
                Never be surprised by project overruns again
              </p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" /> Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBOperationsHub>
  );
};

export default ProjectsPage;
