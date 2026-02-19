import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBFinanceHub from "../IBFinanceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import { BookOpen, CheckCircle, Zap, Play } from "lucide-react";

const AccountingPage = () => {
  const [selectedView, setSelectedView] = useState("journal");

  const features = [
    {
      title: "Automated Journal Entries",
      description: "Auto-generate journals from business transactions.",
      items: [
        "Transaction mapping",
        "Multi-currency handling",
        "Inter-company entries",
        "Accrual automation",
      ],
    },
    {
      title: "Multi-Entity Consolidation",
      description: "Consolidate financials across entities instantly.",
      items: [
        "Entity setup",
        "Elimination entries",
        "Minority interest",
        "Currency translation",
      ],
    },
    {
      title: "Chart of Accounts",
      description: "Flexible, hierarchical account structure.",
      items: [
        "Customizable hierarchy",
        "Segment mapping",
        "Cost center tracking",
        "Natural account types",
      ],
    },
    {
      title: "Period Close Management",
      description: "Streamlined month and year-end closing.",
      items: [
        "Close checklist",
        "Accrual management",
        "Cut-off procedures",
        "Audit trail",
      ],
    },
  ];

  const benefits = [
    {
      metric: "75%",
      label: "Faster Month Close",
      description: "Automated processes",
    },
    {
      metric: "99.9%",
      label: "Entry Accuracy",
      description: "System validation",
    },
    { metric: "100%", label: "Audit Trail", description: "Complete history" },
  ];

  const journalEntries = [
    {
      id: "JE-2026-0125",
      date: "15 Jan 2026",
      description: "Sales Invoice - TechCorp",
      debit: "Accounts Receivable",
      credit: "Sales Revenue",
      amount: 850000,
      status: "Posted",
    },
    {
      id: "JE-2026-0124",
      date: "15 Jan 2026",
      description: "Bank Receipt - Customer Payment",
      debit: "Bank - HDFC",
      credit: "Accounts Receivable",
      amount: 520000,
      status: "Posted",
    },
    {
      id: "JE-2026-0123",
      date: "14 Jan 2026",
      description: "Vendor Bill - Office Supplies",
      debit: "Office Expenses",
      credit: "Accounts Payable",
      amount: 45000,
      status: "Posted",
    },
    {
      id: "JE-2026-0122",
      date: "14 Jan 2026",
      description: "Salary Accrual - Jan 2026",
      debit: "Salary Expense",
      credit: "Salary Payable",
      amount: 2850000,
      status: "Draft",
    },
  ];

  const trialBalance = [
    { account: "Cash & Bank", debit: 4520000, credit: 0 },
    { account: "Accounts Receivable", debit: 8750000, credit: 0 },
    { account: "Fixed Assets", debit: 12500000, credit: 0 },
    { account: "Accounts Payable", debit: 0, credit: 3200000 },
    { account: "Share Capital", debit: 0, credit: 10000000 },
    { account: "Retained Earnings", debit: 0, credit: 8500000 },
    { account: "Revenue", debit: 0, credit: 15250000 },
    { account: "Expenses", debit: 11180000, credit: 0 },
  ];

  const testimonials = [
    {
      quote:
        "Month-end close went from 12 days to 3 days. The automated journal entries and consolidation saved us countless hours.",
      author: "Rajan Krishnamurthy",
      role: "Group CFO",
      company: "ConglomerateCorp",
      rating: 5,
    },
    {
      quote:
        "Multi-entity consolidation with 7 subsidiaries used to take a week. Now it's real-time. Auditors are impressed.",
      author: "Priya Menon",
      role: "Financial Controller",
      company: "TechGroup Holdings",
      rating: 5,
    },
    {
      quote:
        "The automated accrual engine is brilliant. No more manual calculations for prepaid expenses and revenue recognition.",
      author: "Vikram Reddy",
      role: "Chief Accountant",
      company: "ServiceFirst India",
      rating: 5,
    },
    {
      quote:
        "Complete audit trail for every journal entry. Our statutory audit time reduced by 40%. Auditors love the system.",
      author: "Anita Sharma",
      role: "Finance Director",
      company: "ManufactureGlobal",
      rating: 5,
    },
  ];

  const caseStudy = {
    company: "MultiCorp Industries",
    industry: "Diversified Conglomerate",
    employees: "2500+",
    logo: "MC",
    challenge:
      "MultiCorp had 12 entities across 4 countries with different ERPs. Consolidation was a nightmare - 15 days monthly with manual eliminations, currency translations, and reconciliations. Errors were common.",
    solution:
      "Implemented IB Finance Accounting with unified chart of accounts, automated inter-company eliminations, real-time currency translation, and consolidated reporting across all entities.",
    results: [
      { metric: "3 Days", label: "Month Close", detail: "vs 15 days before" },
      { metric: "100%", label: "Elimination Accuracy", detail: "Automated" },
      { metric: "Real-Time", label: "Consolidation", detail: "12 entities" },
      { metric: "₹45L", label: "Annual Savings", detail: "Reduced errors" },
    ],
    quote:
      "What took us 15 days now happens in real-time. The automated eliminations alone saved us from countless errors and audit queries.",
    quotePerson: "Suresh Nair, Group CFO",
  };

  const totalDebit = trialBalance.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = trialBalance.reduce((sum, row) => sum + row.credit, 0);

  return (
    <IBFinanceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-bold text-slate-900">
                  Accounting
                </h1>
                <span className="px-3 py-1 bg-[#033F99] text-white text-sm font-semibold rounded-full">
                  FLAGSHIP
                </span>
              </div>
              <p className="text-lg text-[#033F99] font-semibold">
                Core Accounting Engine
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Complete double-entry accounting with automated journals,
            multi-entity consolidation, and seamless month close.
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
          title="Core Accounting Demo"
          description="See automated journals, consolidation, and fast month close"
          duration="6 min"
          moduleName="IB Finance"
          subModule="Accounting Module"
          Icon={BookOpen}
        />

        {/* Interactive Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#033F99]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              General Ledger
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSelectedView("journal")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedView === "journal" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                Journal Entries
              </button>
              <button
                onClick={() => setSelectedView("trial")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedView === "trial" ? "bg-[#033F99] text-white" : "bg-white text-slate-700 border border-slate-300 hover:border-[#033F99]"}`}
              >
                Trial Balance
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {selectedView === "journal" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900">
                      Recent Journal Entries
                    </h4>
                    <button className="bg-[#033F99] text-white px-3 py-1 rounded-lg text-sm font-medium">
                      + New Entry
                    </button>
                  </div>
                  <div className="divide-y">
                    {journalEntries.map((entry, i) => (
                      <div key={i} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {entry.description}
                            </p>
                            <p className="text-sm text-slate-600">
                              {entry.id} • {entry.date}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${entry.status === "Posted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {entry.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">
                            Dr:{" "}
                            <strong className="text-slate-900">
                              {entry.debit}
                            </strong>
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-slate-600">
                            Cr:{" "}
                            <strong className="text-slate-900">
                              {entry.credit}
                            </strong>
                          </span>
                          <span className="ml-auto font-bold text-slate-900">
                            ₹{(entry.amount / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedView === "trial" && (
                <div>
                  <div className="p-4 bg-slate-50 border-b">
                    <h4 className="font-semibold text-slate-900">
                      Trial Balance - Jan 2026
                    </h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-slate-700">
                          Account
                        </th>
                        <th className="text-right p-3 text-sm font-semibold text-slate-700">
                          Debit (₹)
                        </th>
                        <th className="text-right p-3 text-sm font-semibold text-slate-700">
                          Credit (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialBalance.map((row, i) => (
                        <tr
                          key={i}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-3 text-slate-900">{row.account}</td>
                          <td className="p-3 text-right text-slate-900">
                            {row.debit > 0
                              ? `₹${(row.debit / 100000).toFixed(1)}L`
                              : "-"}
                          </td>
                          <td className="p-3 text-right text-slate-900">
                            {row.credit > 0
                              ? `₹${(row.credit / 100000).toFixed(1)}L`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                        <td className="p-3 text-slate-900">Total</td>
                        <td className="p-3 text-right text-slate-900">
                          ₹{(totalDebit / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="p-3 text-right text-slate-900">
                          ₹{(totalCredit / 10000000).toFixed(2)} Cr
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-3 bg-green-50 border-t flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      Trial Balance is in balance
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Switch between Journal Entries and Trial Balance views
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
                Ready to Transform Your Accounting?
              </h2>
              <p className="opacity-90">
                Close books faster with complete accuracy
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

export default AccountingPage;
