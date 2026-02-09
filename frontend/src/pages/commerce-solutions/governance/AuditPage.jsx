import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Book,
  CheckCircle,
  AlertTriangle,
  FileText,
  Target,
  Shield,
  Search,
  Clock,
  Eye,
  History,
  Filter,
} from "lucide-react";
import IBCommerceHub from "../../IBCommerceHub";

const AuditPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const auditCapabilities = [
    {
      capability: "Complete History",
      description: "Every action recorded with timestamp and user",
      examples: [
        "Quote created by John at 2:15 PM",
        "Discount changed from 15% to 25%",
        "Approval granted by Sarah",
      ],
      benefit: "Know exactly who did what, when",
    },
    {
      capability: "Change Tracking",
      description: "Before and after values for all modifications",
      examples: [
        "Price: $100,000 → $85,000",
        "Payment terms: Net 30 → Net 45",
        "Scope: Added 3 line items",
      ],
      benefit: "Understand what changed and why",
    },
    {
      capability: "Approval Chain",
      description: "Complete approval workflow history",
      examples: [
        "Requested by: Sales Rep",
        "Approved by: Manager at 3:00 PM",
        "Final approval: Director at 4:30 PM",
      ],
      benefit: "Demonstrate proper authorization",
    },
    {
      capability: "Exception Documentation",
      description: "Records of policy exceptions and justifications",
      examples: [
        "Exception: Discount exceeded 30% limit",
        "Justification: Strategic new logo",
        "Approved by: VP Sales",
      ],
      benefit: "Transparency in deviations from policy",
    },
  ];

  const auditUseCases = [
    {
      useCase: "External Audit",
      scenario:
        "Annual financial audit requires documentation of revenue recognition",
      questions: [
        "How was this deal priced?",
        "Who approved the non-standard terms?",
        "When was the contract signed?",
        "What deliverables were promised?",
      ],
      withAuditTrail:
        "All answers available in seconds with full documentation chain",
    },
    {
      useCase: "Customer Dispute",
      scenario: "Customer claims different terms were promised",
      questions: [
        "What was in the original quote?",
        "Were there any modifications?",
        "Who communicated the final terms?",
        "What did customer accept?",
      ],
      withAuditTrail:
        "Complete quote history, all versions, all communications logged",
    },
    {
      useCase: "Internal Investigation",
      scenario: "Large deal went bad, need to understand what happened",
      questions: [
        "Who estimated the costs?",
        "Were the estimates reviewed?",
        "What approvals were obtained?",
        "Were any warnings ignored?",
      ],
      withAuditTrail:
        "Full decision chain visible, learn from mistakes, improve processes",
    },
    {
      useCase: "Compliance Review",
      scenario: "Regulatory body requests documentation",
      questions: [
        "How are decisions made?",
        "What controls are in place?",
        "How are exceptions handled?",
        "Who has authority for what?",
      ],
      withAuditTrail:
        "Demonstrate systematic controls and consistent enforcement",
    },
  ];

  const realScenarios = [
    {
      title: "The $5M Dispute Resolution",
      company: "Enterprise Services",
      situation:
        "Customer claimed they were promised unlimited support, not the 40 hours in contract. Threatened lawsuit.",
      problem: {
        customerClaim: '"Your rep promised unlimited support"',
        contractTerms: "40 hours of support per month",
        dispute: "$5M over 3-year term",
        evidence: "Without audit trail: word vs. word",
      },
      withAuditTrail: {
        evidence: [
          "Quote version history shows 40 hours from first draft",
          "Email log shows support terms discussed explicitly",
          "Customer acceptance recorded with terms visible",
          "No modification requests from customer",
        ],
        outcome:
          "Customer withdrew claim when shown documentation. Relationship preserved.",
      },
    },
    {
      title: "The Audit That Almost Failed",
      company: "Public Software Company",
      situation:
        "SOX audit required documentation of revenue recognition. Finance scrambling to find approvals.",
      problem: {
        auditorQuestion: '"Show us the approval chain for these 15 deals"',
        reality: "Approvals in emails, some verbal, incomplete records",
        risk: "Material weakness finding, stock price impact",
      },
      withAuditTrail: {
        capability: [
          "All approvals in system with timestamps",
          "Policy compliance automatically documented",
          "Exception justifications recorded",
          "Searchable by auditor criteria",
        ],
        outcome: "Audit completed in 2 days instead of 2 weeks. Clean finding.",
      },
    },
    {
      title: "The Process Improvement Discovery",
      company: "Professional Services",
      situation:
        "Noticed pattern of low-margin deals. Used audit trail to investigate.",
      discovery: {
        pattern: "85% of low-margin deals came from one team",
        investigation: "Audit trail showed cost estimates consistently 30% low",
        rootCause: "Team using outdated rate cards",
        fix: "Updated rate cards, added validation step",
      },
      outcome:
        "Margin improved 12% in following quarter. Without audit trail, pattern invisible.",
    },
  ];

  const auditReports = [
    {
      report: "Deal Approval Summary",
      frequency: "Daily",
      audience: "Sales Management",
    },
    {
      report: "Exception Analysis",
      frequency: "Weekly",
      audience: "Finance, Compliance",
    },
    {
      report: "Policy Compliance",
      frequency: "Monthly",
      audience: "Executive Team",
    },
    {
      report: "User Activity",
      frequency: "On-demand",
      audience: "Security, HR",
    },
    { report: "Change History", frequency: "On-demand", audience: "Auditors" },
  ];

  return (
    <IBCommerceHub>
      <div className="max-w-6xl">
        {/* Header */}
        <Link
          to="/solutions/commerce/governance"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-700 mb-4 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Governance Module
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-xl">
            <Book className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-slate-900">Audit Trail</h1>
            <p className="text-2xl text-slate-600">
              Complete History & Compliance Documentation
            </p>
          </div>
        </div>

        <div className="bg-[rgba(3,63,153,0.08)] border-2 border-[rgba(3,63,153,0.25)] rounded-2xl p-6 mb-12">
          <p className="text-lg text-blue-900 mb-2">
            <strong>Purpose:</strong> Every commercial action creates a
            permanent record. Know who did what, when, and why—always.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Complete History</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Full Transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Audit Ready</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: "overview", label: "Overview", icon: FileText },
              { key: "capabilities", label: "Capabilities", icon: History },
              { key: "usecases", label: "Use Cases", icon: Target },
              { key: "scenarios", label: "Real Scenarios", icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4 ${
                    activeTab === tab.key
                      ? "border-blue-600 text-[#033F99]"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Why Audit Trail Matters
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Without Audit Trail
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>"Who approved this?" - No one knows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Disputes become word vs. word</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Audits are fire drills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Patterns invisible, mistakes repeated</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    With IB Commerce Audit Trail
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Every action recorded with user and time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Disputes resolved with documentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Audits completed in hours, not weeks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Patterns visible, continuous improvement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Standard Reports
              </h2>
              <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-bold text-slate-900">
                        Report
                      </th>
                      <th className="text-left p-4 font-bold text-slate-900">
                        Frequency
                      </th>
                      <th className="text-left p-4 font-bold text-slate-900">
                        Audience
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditReports.map((report, i) => (
                      <tr
                        key={`item-${i}`}
                        className="border-t border-slate-200"
                      >
                        <td className="p-4 font-semibold text-slate-900">
                          {report.report}
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {report.frequency}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {report.audience}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">
                Audit Trail = Organizational Memory
              </h2>
              <p className="text-xl leading-relaxed">
                Your audit trail is your organization's memory. It enables
                learning from experience, resolving disputes, and demonstrating
                compliance. Without it, you're always starting from zero.
              </p>
            </section>
          </div>
        )}

        {activeTab === "capabilities" && (
          <div className="space-y-6">
            {auditCapabilities.map((cap, index) => (
              <div
                key={`item-${index}`}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {cap.capability}
                  </h3>
                  <p className="text-slate-700">{cap.description}</p>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Examples:</h4>
                    <ul className="space-y-2">
                      {cap.examples.map((ex, i) => (
                        <li
                          key={`item-${i}`}
                          className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg font-mono text-sm"
                        >
                          <History className="h-4 w-4 text-[#033F99] flex-shrink-0" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[rgba(3,63,153,0.08)] p-4 rounded-xl flex items-center">
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">Benefit:</h4>
                      <p className="text-blue-800">{cap.benefit}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "usecases" && (
          <div className="space-y-6">
            {auditUseCases.map((use, index) => (
              <div
                key={`item-${index}`}
                className="bg-white rounded-2xl border-2 border-slate-200 p-6"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {use.useCase}
                </h3>
                <p className="text-slate-700 mb-4">{use.scenario}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">
                      Questions Asked:
                    </h4>
                    <ul className="space-y-2">
                      {use.questions.map((q, i) => (
                        <li
                          key={`item-${i}`}
                          className="flex items-start gap-2 text-slate-700"
                        >
                          <span className="text-[#033F99]">?</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h4 className="font-bold text-green-900 mb-2">
                      With Audit Trail:
                    </h4>
                    <p className="text-green-800">{use.withAuditTrail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="space-y-8">
            {realScenarios.map((scenario, index) => (
              <div
                key={`item-${index}`}
                className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{scenario.title}</h2>
                  <p className="text-xl opacity-90">{scenario.company}</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Situation:
                    </h3>
                    <p className="text-lg text-slate-700">
                      {scenario.situation}
                    </p>
                  </div>

                  {scenario.problem && (
                    <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                      <h3 className="text-xl font-bold text-red-900 mb-4">
                        ❌ Without Audit Trail
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(scenario.problem).map(
                          ([key, value], i) => (
                            <div key={`item-${i}`}>
                              <span className="text-slate-600 capitalize">
                                {key.replace(/([A-Z])/g, " $1")}:{" "}
                              </span>
                              <span className="font-bold text-slate-900">
                                {value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {scenario.discovery && (
                    <div className="bg-[rgba(3,63,153,0.08)] p-6 rounded-2xl border-2 border-[rgba(3,63,153,0.25)]">
                      <h3 className="text-xl font-bold text-blue-900 mb-4">
                        Discovery via Audit Trail
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(scenario.discovery).map(
                          ([key, value], i) => (
                            <div key={`item-${i}`}>
                              <span className="text-slate-600 capitalize">
                                {key.replace(/([A-Z])/g, " $1")}:{" "}
                              </span>
                              <span className="font-bold text-slate-900">
                                {value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {scenario.withAuditTrail && (
                    <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                      <h3 className="text-xl font-bold text-green-900 mb-4">
                        ✅ With Audit Trail
                      </h3>
                      {scenario.withAuditTrail.evidence && (
                        <ul className="space-y-2 mb-4">
                          {scenario.withAuditTrail.evidence.map((e, i) => (
                            <li
                              key={`item-${i}`}
                              className="flex items-center gap-2 text-slate-700"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      )}
                      {scenario.withAuditTrail.capability && (
                        <ul className="space-y-2 mb-4">
                          {scenario.withAuditTrail.capability.map((c, i) => (
                            <li
                              key={`item-${i}`}
                              className="flex items-center gap-2 text-slate-700"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="font-bold text-green-800">
                        {scenario.withAuditTrail.outcome}
                      </p>
                    </div>
                  )}

                  {scenario.outcome && typeof scenario.outcome === "string" && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <p className="font-bold text-green-800">
                        {scenario.outcome}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Complete Organizational Memory
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Know who did what, when, and why—always
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-[#033F99] font-bold rounded-xl hover:shadow-xl transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </IBCommerceHub>
  );
};

export default AuditPage;
