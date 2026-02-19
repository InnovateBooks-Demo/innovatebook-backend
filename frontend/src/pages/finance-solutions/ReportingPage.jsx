import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBFinanceHub from "../IBFinanceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  BarChart3,
  CheckCircle,
  Zap,
  Play,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react";

const ReportingPage = () => {
  const [selectedReport, setSelectedReport] = useState("pnl");

  const features = [
    {
      title: "Real-Time P&L",
      description: "Profit and loss statement updated in real-time.",
      items: [
        "Revenue breakdown",
        "Cost analysis",
        "Margin tracking",
        "Comparative periods",
      ],
    },
    {
      title: "Balance Sheet",
      description: "Complete position statement with drill-down.",
      items: [
        "Asset classification",
        "Liability tracking",
        "Equity movements",
        "Ratio calculations",
      ],
    },
    {
      title: "Cash Flow Statement",
      description: "Operating, investing, and financing activities.",
      items: [
        "Direct/indirect method",
        "Working capital impact",
        "Free cash flow",
        "Cash conversion",
      ],
    },
    {
      title: "Custom Reports",
      description: "Build any report with drag-and-drop builder.",
      items: [
        "Report builder",
        "Custom dimensions",
        "Scheduled delivery",
        "Export options",
      ],
    },
  ];

  const benefits = [
    {
      metric: "Real-Time",
      label: "Financial Statements",
      description: "Always current",
    },
    { metric: "50+", label: "Pre-Built Reports", description: "Ready to use" },
    {
      metric: "1-Click",
      label: "Export to Excel/PDF",
      description: "Easy sharing",
    },
  ];

  const pnlData = {
    revenue: [
      { label: "Product Sales", value: 85000000 },
      { label: "Service Revenue", value: 32000000 },
      { label: "Other Income", value: 3500000 },
    ],
    expenses: [
      { label: "Cost of Goods Sold", value: 48000000 },
      { label: "Salaries & Wages", value: 28500000 },
      { label: "Rent & Utilities", value: 4500000 },
      { label: "Marketing", value: 6500000 },
      { label: "Other Expenses", value: 8200000 },
    ],
  };

  const balanceSheet = {
    assets: [
      { label: "Cash & Bank", value: 25000000 },
      { label: "Accounts Receivable", value: 38000000 },
      { label: "Inventory", value: 22000000 },
      { label: "Fixed Assets", value: 65000000 },
    ],
    liabilities: [
      { label: "Accounts Payable", value: 18000000 },
      { label: "Short-term Debt", value: 15000000 },
      { label: "Long-term Debt", value: 45000000 },
    ],
    equity: [
      { label: "Share Capital", value: 50000000 },
      { label: "Retained Earnings", value: 22000000 },
    ],
  };

  const totalRevenue = pnlData.revenue.reduce((sum, r) => sum + r.value, 0);
  const totalExpenses = pnlData.expenses.reduce((sum, e) => sum + e.value, 0);
  const netProfit = totalRevenue - totalExpenses;

  const totalAssets = balanceSheet.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = balanceSheet.liabilities.reduce(
    (sum, l) => sum + l.value,
    0,
  );
  const totalEquity = balanceSheet.equity.reduce((sum, e) => sum + e.value, 0);

  const testimonials = [
    {
      quote:
        "Real-time P&L changed how we run the business. We see margin impacts immediately, not at month-end.",
      author: "Suresh Kumar",
      role: "CEO",
      company: "GrowthFirst",
      rating: 5,
    },
    {
      quote:
        "Board reporting used to take 2 weeks to prepare. Now it's automated and always ready. Huge time saver.",
      author: "Lakshmi Narayanan",
      role: "CFO",
      company: "TechVentures",
      rating: 5,
    },
    {
      quote:
        "The custom report builder is powerful. I created investor reports exactly how our VCs want them. No more manual formatting.",
      author: "Amit Sharma",
      role: "Finance Director",
      company: "StartupScale India",
      rating: 5,
    },
    {
      quote:
        "Cash flow statement with drill-down to transactions. Our working capital decisions are now data-driven, not gut-feel.",
      author: "Priya Patel",
      role: "Treasury Head",
      company: "ManufactureGlobal",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "ReportFirst Holdings",
    industry: "Diversified Holdings",
    employees: "1500+",
    logo: "RF",
    challenge:
      "ReportFirst's finance team spent 2 weeks monthly preparing board reports, investor updates, and management reviews. Data came from multiple sources, numbers didn't match, and analysis was always backward-looking.",
    solution:
      "Implemented IB Finance Reporting with real-time financial statements, custom report builder for board/investor templates, automated scheduling, and drill-down capabilities from summary to transactions.",
    results: [
      { metric: "Real-Time", label: "All Reports", detail: "vs 2-week delay" },
      { metric: "80%", label: "Time Saved", detail: "In report prep" },
      { metric: "100%", label: "Data Accuracy", detail: "Single source" },
      { metric: "15", label: "Custom Reports", detail: "Auto-generated" },
    ],
    quote:
      "From 2 weeks to click a button. The board now gets reports the day after month-end, not 2 weeks later. Decision quality improved dramatically.",
    quotePerson: "Venkatesh Rao, Group CFO",
  };

  return (
    <IBFinanceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Reporting</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Financial Statements
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Real-time P&L, Balance Sheet, and Cash Flow statements with
            drill-down capabilities.
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
          title="Financial Reporting Demo"
          description="Explore real-time P&L, Balance Sheet, and custom reports"
          duration="4 min"
          moduleName="IB Finance"
          subModule="Reporting Module"
          Icon={BarChart3}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Live Reports
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSelectedReport("pnl")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedReport === "pnl" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                Profit & Loss
              </button>
              <button
                onClick={() => setSelectedReport("balance")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedReport === "balance" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                Balance Sheet
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {selectedReport === "pnl" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900">
                      Profit & Loss Statement - FY 2025-26 YTD
                    </h4>
                    <button className="text-[#033F99] text-sm font-semibold hover:underline flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Export
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h5 className="font-bold text-green-700">Revenue</h5>
                      </div>
                      <div className="space-y-2 pl-7">
                        {pnlData.revenue.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-semibold text-slate-900">
                              ₹{(item.value / 10000000).toFixed(1)} Cr
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span className="text-green-700">Total Revenue</span>
                          <span className="text-green-700">
                            ₹{(totalRevenue / 10000000).toFixed(1)} Cr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <h5 className="font-bold text-red-700">Expenses</h5>
                      </div>
                      <div className="space-y-2 pl-7">
                        {pnlData.expenses.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-semibold text-slate-900">
                              ₹{(item.value / 10000000).toFixed(2)} Cr
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span className="text-red-700">Total Expenses</span>
                          <span className="text-red-700">
                            ₹{(totalExpenses / 10000000).toFixed(2)} Cr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-800">
                          Net Profit
                        </span>
                        <span className="text-3xl font-bold text-green-700">
                          ₹{(netProfit / 10000000).toFixed(2)} Cr
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Net Margin:{" "}
                        {((netProfit / totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === "balance" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900">
                      Balance Sheet - As of 15 Jan 2026
                    </h4>
                    <button className="text-[#033F99] text-sm font-semibold hover:underline flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Export
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 divide-x">
                    <div className="p-4">
                      <h5 className="font-bold text-[#033F99] mb-3">Assets</h5>
                      <div className="space-y-2">
                        {balanceSheet.assets.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-semibold text-slate-900">
                              ₹{(item.value / 10000000).toFixed(1)} Cr
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span className="text-[#033F99]">Total Assets</span>
                          <span className="text-[#033F99]">
                            ₹{(totalAssets / 10000000).toFixed(1)} Cr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h5 className="font-bold text-red-700 mb-3">
                        Liabilities
                      </h5>
                      <div className="space-y-2 mb-4">
                        {balanceSheet.liabilities.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-semibold text-slate-900">
                              ₹{(item.value / 10000000).toFixed(1)} Cr
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span className="text-red-700">
                            Total Liabilities
                          </span>
                          <span className="text-red-700">
                            ₹{(totalLiabilities / 10000000).toFixed(1)} Cr
                          </span>
                        </div>
                      </div>

                      <h5 className="font-bold text-green-700 mb-3">Equity</h5>
                      <div className="space-y-2">
                        {balanceSheet.equity.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-semibold text-slate-900">
                              ₹{(item.value / 10000000).toFixed(1)} Cr
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span className="text-green-700">Total Equity</span>
                          <span className="text-green-700">
                            ₹{(totalEquity / 10000000).toFixed(1)} Cr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border-t flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      Assets = Liabilities + Equity ✓
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Switch between P&L and Balance Sheet to explore financial reports
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
                Ready for Real-Time Financial Reporting?
              </h2>
              <p className="opacity-90">See your numbers as they happen</p>
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

export default ReportingPage;
