import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBCapitalHub from "../IBCapitalHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Wallet,
  CheckCircle,
  Zap,
  Play,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

const TreasuryPage = () => {
  const [selectedTab, setSelectedTab] = useState("fd");

  const features = [
    {
      title: "Fixed Deposits",
      description: "Track all FDs across banks with maturity alerts.",
      items: [
        "Multi-bank FD tracking",
        "Interest accrual",
        "Maturity calendar",
        "Renewal management",
      ],
    },
    {
      title: "Mutual Funds",
      description: "Monitor liquid fund and debt fund investments.",
      items: [
        "NAV tracking",
        "Returns analysis",
        "SIP management",
        "Redemption planning",
      ],
    },
    {
      title: "Maturity Management",
      description: "Never miss a maturity date again.",
      items: [
        "Auto reminders",
        "Rollover decisions",
        "Rate comparison",
        "Reinvestment planning",
      ],
    },
    {
      title: "Investment Returns",
      description: "Track and optimize treasury returns.",
      items: [
        "Yield analysis",
        "Benchmark comparison",
        "Tax-efficient investing",
        "Return optimization",
      ],
    },
  ];

  const benefits = [
    {
      metric: "₹12.4K",
      label: "Extra Interest/Qtr",
      description: "Optimized FDs",
    },
    { metric: "Zero", label: "Missed Maturities", description: "Auto alerts" },
    {
      metric: "100%",
      label: "Investment Visibility",
      description: "Single view",
    },
  ];

  const treasuryData = {
    fd: [
      {
        bank: "HDFC Bank",
        principal: 5000000,
        rate: 7.25,
        maturity: "15 Mar 2026",
        interest: 90625,
        status: "Active",
      },
      {
        bank: "ICICI Bank",
        principal: 3000000,
        rate: 7.1,
        maturity: "28 Jan 2026",
        interest: 53250,
        status: "Maturing Soon",
      },
      {
        bank: "SBI",
        principal: 10000000,
        rate: 6.8,
        maturity: "15 Jul 2026",
        interest: 170000,
        status: "Active",
      },
    ],
    mf: [
      {
        fund: "HDFC Liquid Fund",
        invested: 2000000,
        current: 2145000,
        returns: 7.25,
        type: "Liquid",
      },
      {
        fund: "ICICI Overnight Fund",
        invested: 1500000,
        current: 1584000,
        returns: 5.6,
        type: "Overnight",
      },
      {
        fund: "Axis Treasury Advantage",
        invested: 3000000,
        current: 3225000,
        returns: 7.5,
        type: "Ultra Short",
      },
    ],
  };

  const totalFD = treasuryData.fd.reduce((sum, fd) => sum + fd.principal, 0);
  const totalMF = treasuryData.mf.reduce((sum, mf) => sum + mf.current, 0);

  const testimonials = [
    {
      quote:
        "We were leaving ₹4L/year on the table with poorly timed FD renewals. The maturity alerts and rate comparisons fixed that.",
      author: "Deepak Sharma",
      role: "CFO",
      company: "TradingCorp",
      rating: 5,
    },
    {
      quote:
        "Single dashboard for all treasury investments across 5 banks. What used to take 2 hours monthly now takes 10 minutes.",
      author: "Priya Menon",
      role: "Treasury Manager",
      company: "ExportFirst Ltd",
      rating: 5,
    },
    {
      quote:
        "The rate comparison feature helped us shift ₹2Cr to a bank offering 0.75% more. That's ₹15L extra per year.",
      author: "Amit Kulkarni",
      role: "Finance Head",
      company: "LogisticsKing",
      rating: 5,
    },
    {
      quote:
        "Mutual fund NAV tracking and returns analysis in real-time. Our board reports are now always current and accurate.",
      author: "Shreya Patel",
      role: "Investment Manager",
      company: "WealthFirst Corp",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "TreasuryMaster Holdings",
    industry: "Financial Services",
    employees: "520+",
    logo: "TM",
    challenge:
      "TreasuryMaster had ₹15Cr in FDs and MFs across 8 banks with no unified view. Maturity dates were tracked in spreadsheets, leading to auto-renewals at lower rates and ₹8L in lost interest annually.",
    solution:
      "Implemented IB Capital Treasury module with unified investment dashboard, automated maturity alerts 30 days in advance, and rate comparison across all banks for renewal decisions.",
    results: [
      { metric: "Zero", label: "Missed Maturities", detail: "In 18 months" },
      { metric: "₹12L", label: "Extra Interest", detail: "First year" },
      { metric: "0.65%", label: "Avg Rate Improvement", detail: "On renewals" },
      { metric: "10 Min", label: "vs 4 Hours", detail: "Monthly reporting" },
    ],
    quote:
      "We used to miss FD maturities all the time. Auto-renewals cost us lakhs. Now we get alerts 30 days ahead and always get the best rates.",
    quotePerson: "Ramesh Iyer, Group CFO",
  };

  return (
    <IBCapitalHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Treasury</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Investment Management
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Track fixed deposits, mutual funds, and other treasury investments
            with maturity management.
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
          title="Treasury Management Demo"
          description="Master your investments and never miss a maturity"
          duration="4 min"
          moduleName="IB Capital"
          subModule="Treasury Module"
          Icon={Wallet}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Treasury Dashboard
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600">Total Fixed Deposits</p>
                <p className="text-3xl font-bold text-[#033F99]">
                  ₹{(totalFD / 10000000).toFixed(2)} Cr
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600">Total Mutual Funds</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{(totalMF / 10000000).toFixed(2)} Cr
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSelectedTab("fd")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === "fd" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                Fixed Deposits
              </button>
              <button
                onClick={() => setSelectedTab("mf")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === "mf" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                Mutual Funds
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {selectedTab === "fd" && (
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">
                        Bank
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">
                        Principal
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">
                        Rate
                      </th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-700">
                        Maturity
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">
                        Interest
                      </th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {treasuryData.fd.map((fd, i) => (
                      <tr
                        key={i}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4 font-medium text-slate-900">
                          {fd.bank}
                        </td>
                        <td className="p-4 text-right text-slate-900">
                          ₹{(fd.principal / 100000).toFixed(0)}L
                        </td>
                        <td className="p-4 text-right text-green-600 font-semibold">
                          {fd.rate}%
                        </td>
                        <td className="p-4 text-center text-slate-600">
                          {fd.maturity}
                        </td>
                        <td className="p-4 text-right text-slate-900">
                          ₹{(fd.interest / 1000).toFixed(0)}K
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold ${fd.status === "Maturing Soon" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                          >
                            {fd.status === "Maturing Soon" && (
                              <Clock className="h-3 w-3 inline mr-1" />
                            )}
                            {fd.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedTab === "mf" && (
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">
                        Fund
                      </th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-700">
                        Type
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">
                        Invested
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">
                        Current Value
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">
                        Returns
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {treasuryData.mf.map((mf, i) => (
                      <tr
                        key={i}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4 font-medium text-slate-900">
                          {mf.fund}
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {mf.type}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-600">
                          ₹{(mf.invested / 100000).toFixed(0)}L
                        </td>
                        <td className="p-4 text-right text-slate-900 font-semibold">
                          ₹{(mf.current / 100000).toFixed(1)}L
                        </td>
                        <td className="p-4 text-right text-green-600 font-bold flex items-center justify-end gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {mf.returns}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-700">
                <strong>Upcoming:</strong> ICICI FD (₹30L) maturing on 28 Jan
                2026. Review renewal options.
              </span>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Switch between Fixed Deposits and Mutual Funds to explore treasury
              holdings
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
                Ready to Optimize Treasury Returns?
              </h2>
              <p className="opacity-90">Never miss a maturity date again</p>
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
    </IBCapitalHub>
  );
};

export default TreasuryPage;
