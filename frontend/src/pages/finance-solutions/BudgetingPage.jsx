import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBFinanceHub from "../IBFinanceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Calculator,
  CheckCircle,
  Zap,
  Play,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

const BudgetingPage = () => {
  const [selectedDept, setSelectedDept] = useState("all");

  const features = [
    {
      title: "Rolling Forecasts",
      description: "Continuously updated forecasts that look ahead.",
      items: [
        "12-month rolling",
        "Auto-adjustments",
        "Trend analysis",
        "Driver-based",
      ],
    },
    {
      title: "Variance Analysis",
      description: "Deep dive into budget vs actual differences.",
      items: [
        "Line-item variance",
        "Root cause drill-down",
        "Responsibility mapping",
        "Action tracking",
      ],
    },
    {
      title: "Scenario Planning",
      description: "Model different business scenarios.",
      items: [
        "Best/worst case",
        "Sensitivity analysis",
        "What-if modeling",
        "Scenario comparison",
      ],
    },
    {
      title: "Departmental Budgets",
      description: "Bottom-up budgeting with approvals.",
      items: [
        "Department owners",
        "Approval workflows",
        "Version control",
        "Consolidation",
      ],
    },
  ];

  const benefits = [
    { metric: "95%", label: "Budget Accuracy", description: "Rolling updates" },
    {
      metric: "3 Days",
      label: "Budget Cycle",
      description: "vs 3 weeks traditional",
    },
    {
      metric: "Real-Time",
      label: "Variance Tracking",
      description: "Instant alerts",
    },
  ];

  const budgetData = {
    all: [
      {
        category: "Revenue",
        budget: 120000000,
        actual: 115000000,
        variance: -4.2,
        status: "Under",
      },
      {
        category: "COGS",
        budget: 55000000,
        actual: 52000000,
        variance: 5.5,
        status: "Under",
      },
      {
        category: "Salaries",
        budget: 35000000,
        actual: 36500000,
        variance: -4.3,
        status: "Over",
      },
      {
        category: "Marketing",
        budget: 8000000,
        actual: 9200000,
        variance: -15.0,
        status: "Over",
      },
      {
        category: "Operations",
        budget: 12000000,
        actual: 10800000,
        variance: 10.0,
        status: "Under",
      },
    ],
    sales: [
      {
        category: "Sales Revenue",
        budget: 100000000,
        actual: 95000000,
        variance: -5.0,
        status: "Under",
      },
      {
        category: "Sales Salaries",
        budget: 15000000,
        actual: 15500000,
        variance: -3.3,
        status: "Over",
      },
      {
        category: "Travel & Entertainment",
        budget: 2500000,
        actual: 2800000,
        variance: -12.0,
        status: "Over",
      },
    ],
    marketing: [
      {
        category: "Digital Ads",
        budget: 4000000,
        actual: 4800000,
        variance: -20.0,
        status: "Over",
      },
      {
        category: "Events",
        budget: 2500000,
        actual: 2400000,
        variance: 4.0,
        status: "Under",
      },
      {
        category: "Content",
        budget: 1500000,
        actual: 2000000,
        variance: -33.3,
        status: "Over",
      },
    ],
  };

  const data = budgetData[selectedDept];
  const totalBudget = data.reduce((sum, d) => sum + d.budget, 0);
  const totalActual = data.reduce((sum, d) => sum + d.actual, 0);

  const testimonials = [
    {
      quote:
        "Rolling forecasts transformed our planning. We went from annual budgeting exercise to continuous adaptive planning.",
      author: "Anil Kapoor",
      role: "FP&A Head",
      company: "ConglomerateIndia",
      rating: 5,
    },
    {
      quote:
        "Real-time variance alerts caught a runaway marketing spend before it blew up. Saved us ₹15L in one quarter.",
      author: "Deepika Sharma",
      role: "CFO",
      company: "StartupScale",
      rating: 5,
    },
    {
      quote:
        "Scenario planning helped us navigate the slowdown. We had 3 contingency plans ready and activated the right one instantly.",
      author: "Rajiv Menon",
      role: "Finance Director",
      company: "TechFirst India",
      rating: 5,
    },
    {
      quote:
        "Department owners now manage their own budgets with full visibility. Finance's role shifted from data entry to strategic advisory.",
      author: "Priya Krishnan",
      role: "VP Finance",
      company: "ServicesPro Global",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "AgileGrowth Corp",
    industry: "SaaS Technology",
    employees: "380+",
    logo: "AG",
    challenge:
      "AgileGrowth's annual budget was obsolete within Q1 due to rapid market changes. The 6-week budgeting process consumed FP&A entirely, and variance analysis was always backward-looking, never actionable.",
    solution:
      "Implemented IB Finance Budgeting with rolling 12-month forecasts, real-time variance tracking, scenario planning for different growth trajectories, and self-service departmental budgeting.",
    results: [
      { metric: "3 Days", label: "Budget Cycle", detail: "vs 6 weeks before" },
      { metric: "₹28L", label: "Cost Avoidance", detail: "Proactive alerts" },
      { metric: "5", label: "Active Scenarios", detail: "Always ready" },
      { metric: "95%", label: "Forecast Accuracy", detail: "Monthly rolling" },
    ],
    quote:
      "We used to argue about budgets. Now we adapt to reality in real-time. The variance alerts alone paid for the system.",
    quotePerson: "Kiran Rao, CFO",
  };

  return (
    <IBFinanceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Budgeting</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Planning & Forecasting
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Rolling forecasts, scenario planning, and real-time variance
            analysis.
          </p>
        </div>

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

        <VideoWalkthrough
          title="Budgeting & Forecasting Demo"
          description="See rolling forecasts and real-time variance tracking"
          duration="5 min"
          moduleName="IB Finance"
          subModule="Budgeting Module"
          Icon={Calculator}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Variance Tracker
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-3">
                {[
                  { key: "all", label: "All Departments" },
                  { key: "sales", label: "Sales" },
                  { key: "marketing", label: "Marketing" },
                ].map((dept) => (
                  <button
                    key={dept.key}
                    onClick={() => setSelectedDept(dept.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedDept === dept.key ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Budget Period</p>
                <p className="font-bold text-slate-900">FY 2025-26 YTD</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600">Total Budget</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{(totalBudget / 10000000).toFixed(1)} Cr
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600">Total Actual</p>
                <p
                  className={`text-2xl font-bold ${totalActual > totalBudget ? "text-red-600" : "text-green-600"}`}
                >
                  ₹{(totalActual / 10000000).toFixed(1)} Cr
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border text-center ${totalActual > totalBudget ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
              >
                <p className="text-sm text-slate-600">Variance</p>
                <p
                  className={`text-2xl font-bold ${totalActual > totalBudget ? "text-red-600" : "text-green-600"}`}
                >
                  {(((totalActual - totalBudget) / totalBudget) * 100).toFixed(
                    1,
                  )}
                  %
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">
                      Category
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      Budget
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      Actual
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      Variance
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4 font-medium text-slate-900">
                        {row.category}
                      </td>
                      <td className="p-4 text-right text-slate-600">
                        ₹{(row.budget / 10000000).toFixed(2)} Cr
                      </td>
                      <td className="p-4 text-right text-slate-900 font-semibold">
                        ₹{(row.actual / 10000000).toFixed(2)} Cr
                      </td>
                      <td
                        className={`p-4 text-right font-bold ${row.variance > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {row.variance > 0 ? "+" : ""}
                        {row.variance.toFixed(1)}%
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center justify-center gap-1 ${row.status === "Under" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {row.status === "Under" ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <TrendingUp className="h-3 w-3" />
                          )}
                          {row.status} Budget
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedDept === "marketing" && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-red-700">
                  <strong>Alert:</strong> Marketing Digital Ads is 20% over
                  budget. Review and approve or adjust forecast.
                </span>
              </div>
            )}

            <p className="text-center text-sm text-slate-500 mt-4">
              Filter by department to see detailed variance analysis
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] transition-all"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-600 mb-4">{f.description}</p>
                <div className="space-y-2">
                  {f.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <CaseStudy data={caseStudy} />
        <TestimonialSection testimonials={testimonials} />

        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready for Smarter Budgeting?
              </h2>
              <p className="opacity-90">
                From annual exercise to continuous planning
              </p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBFinanceHub>
  );
};

export default BudgetingPage;
