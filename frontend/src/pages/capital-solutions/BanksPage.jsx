import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBCapitalHub from "../IBCapitalHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Building,
  CheckCircle,
  Zap,
  Play,
  RefreshCw,
  Clock,
} from "lucide-react";

const BanksPage = () => {
  const [selectedBank, setSelectedBank] = useState("all");

  const features = [
    {
      title: "Multi-Bank Integration",
      description: "Connect all your bank accounts in one dashboard.",
      items: [
        "API integration",
        "Statement import",
        "Real-time balance",
        "Transaction sync",
      ],
    },
    {
      title: "Cash Position View",
      description: "Consolidated view of cash across all accounts.",
      items: [
        "Real-time balances",
        "Currency wise view",
        "Sweep account tracking",
        "Float analysis",
      ],
    },
    {
      title: "Bank Reconciliation",
      description: "Automated matching of bank transactions.",
      items: [
        "AI-powered matching",
        "Rule-based reconciliation",
        "Exception handling",
        "Reconciliation reports",
      ],
    },
    {
      title: "Bank Charges Analysis",
      description: "Track and optimize banking costs.",
      items: [
        "Fee tracking",
        "Interest analysis",
        "Service charge comparison",
        "Negotiation insights",
      ],
    },
  ];

  const benefits = [
    { metric: "95%", label: "Auto Reconciliation", description: "AI matching" },
    {
      metric: "Real-Time",
      label: "Cash Visibility",
      description: "All banks in one view",
    },
    {
      metric: "40%",
      label: "Bank Fee Savings",
      description: "Cost optimization",
    },
  ];

  const banks = [
    {
      name: "HDFC Bank",
      type: "Current",
      balance: 12500000,
      lastSync: "2 min ago",
      status: "Active",
      pendingReconcile: 12,
    },
    {
      name: "ICICI Bank",
      type: "Current",
      balance: 8750000,
      lastSync: "5 min ago",
      status: "Active",
      pendingReconcile: 5,
    },
    {
      name: "Axis Bank",
      type: "CC Account",
      balance: -1500000,
      lastSync: "10 min ago",
      status: "Active",
      pendingReconcile: 0,
    },
    {
      name: "SBI",
      type: "FD Account",
      balance: 25000000,
      lastSync: "1 hr ago",
      status: "Active",
      pendingReconcile: 0,
    },
  ];

  const filteredBanks =
    selectedBank === "all"
      ? banks
      : banks.filter((b) => b.type === selectedBank);
  const totalBalance = banks.reduce((sum, b) => sum + b.balance, 0);

  const testimonials = [
    {
      quote:
        "Bank reconciliation went from 3 days to 30 minutes. The AI matching is scarily accurate - 96% auto-matched in month one.",
      author: "Arvind Krishnan",
      role: "Finance Manager",
      company: "ExportGiant India",
      rating: 5,
    },
    {
      quote:
        "We discovered ₹12L in hidden bank charges across 8 accounts. Renegotiated and saved 35% on banking fees.",
      author: "Neha Gupta",
      role: "Treasury Head",
      company: "ManufacturePro",
      rating: 5,
    },
    {
      quote:
        "Real-time cash visibility across 12 banks transformed our daily treasury operations. No more morning spreadsheet updates.",
      author: "Rakesh Sharma",
      role: "Group Treasurer",
      company: "ConglomerateIndia",
      rating: 5,
    },
    {
      quote:
        "The automated bank statement import saved our team 15 hours per week. Now we focus on analysis, not data entry.",
      author: "Sunita Reddy",
      role: "Finance Director",
      company: "TechScale Solutions",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "MultiBank Enterprises",
    industry: "Trading & Distribution",
    employees: "450+",
    logo: "ME",
    challenge:
      "MultiBank was managing 14 bank accounts across 6 banks manually. Cash position updates took half a day, reconciliation consumed 5 days monthly, and hidden charges went unnoticed.",
    solution:
      "Implemented IB Capital Banks module with API integration to all major banks, automated reconciliation, and bank charges analytics dashboard.",
    results: [
      { metric: "95%", label: "Auto-Match Rate", detail: "First month itself" },
      {
        metric: "₹18L",
        label: "Hidden Fees Found",
        detail: "Across 14 accounts",
      },
      {
        metric: "4 Hours",
        label: "vs 5 Days",
        detail: "Monthly reconciliation",
      },
      {
        metric: "Real-Time",
        label: "Cash Visibility",
        detail: "vs Half-day delay",
      },
    ],
    quote:
      "We had no idea how much we were losing to bank charges until the analytics showed us. The ROI was immediate.",
    quotePerson: "Vijay Mehta, CFO",
  };

  return (
    <IBCapitalHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Building className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Banks</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Multi-Bank Management
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Connect all your bank accounts for unified cash visibility and
            automated reconciliation.
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
          title="Multi-Bank Management Demo"
          description="See how to manage all your bank accounts in one place"
          duration="4 min"
          moduleName="IB Capital"
          subModule="Banks Module"
          Icon={Building}
          category="finance"
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Cash Position
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-600">Consolidated Cash Position</p>
                <p className="text-4xl font-bold text-[#033F99]">
                  ₹{(totalBalance / 10000000).toFixed(2)} Cr
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                >
                  <option value="all">All Accounts</option>
                  <option value="Current">Current Accounts</option>
                  <option value="CC Account">CC Accounts</option>
                  <option value="FD Account">FD Accounts</option>
                </select>
                <button className="bg-[#033F99] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold">
                  <RefreshCw className="h-4 w-4" />
                  Sync All
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredBanks.map((bank, index) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#033F99] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#EBF3FC] rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-[#033F99]" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{bank.name}</p>
                        <p className="text-sm text-slate-600">{bank.type}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Clock className="h-3 w-3" />
                      {bank.lastSync}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-2xl font-bold ${bank.balance < 0 ? "text-red-600" : "text-slate-900"}`}
                    >
                      ₹{(Math.abs(bank.balance) / 100000).toFixed(1)}L
                      {bank.balance < 0 && (
                        <span className="text-sm font-normal ml-1">(OD)</span>
                      )}
                    </p>
                    {bank.pendingReconcile > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        {bank.pendingReconcile} to reconcile
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-[#033F99]" />
                  <span className="font-semibold text-slate-900">
                    Reconciliation Status
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    Auto-matched:{" "}
                    <strong className="text-green-600">847 txns</strong>
                  </span>
                  <span className="text-sm text-slate-600">
                    Pending:{" "}
                    <strong className="text-yellow-600">17 txns</strong>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Filter by account type to see different categories
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
                Ready for Unified Bank Management?
              </h2>
              <p className="opacity-90">See all your cash in one dashboard</p>
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

export default BanksPage;
