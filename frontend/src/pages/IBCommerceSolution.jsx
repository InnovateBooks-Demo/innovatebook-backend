import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  Shield,
  CheckCircle,
  ArrowRight,
  Target,
  Building2,
  Globe,
  Briefcase,
  FileText,
  Award,
  Lock,
  Zap,
  BarChart3,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  Clock,
  TrendingDown,
  Activity,
  Layers,
  GitBranch,
  ChevronRight,
  Sparkles,
  Star,
  Settings,
  Database,
  Network,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const IBCommerceSolution = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const modules = [
    {
      id: "parties",
      name: "PARTIES",
      icon: Users,
      gradient: "from-blue-600 via-blue-700 to-blue-800",
      tagline: "Who You Are Allowed to Do Business With",
      subtitle: "Master Data Foundation",
      priority: "FIRST",
      description:
        "Every commercial failure starts with the wrong customer, vendor, or partner. PARTIES ensures no deal, purchase, or contract can start unless the counterparty is commercially eligible.",

      subModules: [
        {
          name: "Customers",
          icon: Users,
          description:
            "Any entity that buys from you: companies, government bodies, individuals, enterprise groups",
          dataPoints: [
            "Legal name & registration",
            "Country & tax classification",
            "Credit exposure limit",
            "Risk score & rating",
            "Contract history & performance",
          ],
          example: {
            scenario: "US Consulting Firm - $120,000 Project",
            data: {
              "Approved Credit Limit": "$100,000",
              "Risk Rating": "Medium",
              "Current Exposure": "$80,000",
            },
            result: {
              allowed: "Deal creation allowed",
              blocked: "Contract blocked at Commit stage",
              action: "System asks for credit limit exception approval",
            },
            prevented: [
              "Customer overexposure",
              "Bad debts after invoicing",
              "Uncontrolled risk accumulation",
            ],
          },
        },
        {
          name: "Vendors",
          icon: Building2,
          description:
            "Anyone you pay: suppliers, contractors, cloud providers, freelancers",
          dataPoints: [
            "Legal entity & bank details",
            "Compliance status & certifications",
            "Risk rating & history",
            "Approved spend limit",
            "Contract validity & terms",
          ],
          example: {
            scenario: "Cloud Services Procurement - $40,000/month",
            data: {
              "Risk Rating": "High",
              "Approved Spend Limit": "$20,000/month",
              "Compliance Status": "Pending",
            },
            result: {
              allowed: "Procurement intent allowed",
              blocked: "Commit stage blocked",
              action: "CFO approval required",
            },
            prevented: [
              "Payments to risky/unverified vendors",
              "Shadow procurement",
              "Compliance violations",
            ],
          },
        },
        {
          name: "Partners",
          icon: Briefcase,
          description:
            "Entities who deliver work, share revenue, or operate jointly",
          dataPoints: [
            "Revenue share percentage",
            "Operating geography",
            "Contract duration & terms",
            "Performance metrics",
            "Risk & compliance score",
          ],
          example: {
            scenario: "Delivery Partner - 25% Revenue Share",
            data: {
              "Deal Value": "$80,000",
              "Partner Share": "$20,000 (25%)",
              Geography: "APAC",
            },
            result: {
              allowed: "Automatically included in costing",
              blocked: "None",
              action: "Margin calculated on net revenue",
            },
            prevented: [
              "Forgotten revenue sharing",
              "Margin leakage",
              "Partner conflicts",
            ],
          },
        },
        {
          name: "Channels",
          icon: Network,
          description:
            "Sales intermediaries: resellers, distributors, affiliates",
          dataPoints: [
            "Commission structure",
            "Approved pricing bands",
            "Territory allocation",
            "Performance metrics",
            "Contract terms",
          ],
          example: {
            scenario: "Reseller Channel Sale - $50,000",
            data: {
              "Commission Rate": "10%",
              "Channel Commission": "$5,000",
              "Net Revenue": "$45,000",
            },
            result: {
              allowed: "Sale proceeds",
              blocked: "None",
              action: "Margin evaluated on net, not gross",
            },
            prevented: [
              "Inflated revenue assumptions",
              "Channel conflicts",
              "Margin miscalculation",
            ],
          },
        },
        {
          name: "Profiles",
          icon: FileText,
          tag: "MOST CRITICAL",
          description: "Progressive commercial identity that evolves over time",
          dataPoints: [
            "Legal verification status",
            "Tax documents & compliance",
            "Historical performance",
            "Progressive risk scoring",
            "Dynamic exposure limits",
          ],
          example: {
            scenario: "Customer Evolution Over 3 Years",
            data: {
              "Year 1 Limit": "$25,000",
              "Year 3 Limit": "$250,000",
              "Clean Payment History": "100%",
              "Risk Reduction": "High → Low",
            },
            result: {
              allowed: "10x credit increase",
              blocked: "None",
              action: "Automatic limit progression",
            },
            prevented: [
              "Static master data",
              "One-size-fits-all approvals",
              "Lost opportunities",
            ],
          },
        },
      ],

      whyFirst: [
        "Every commercial transaction requires a verified counterparty",
        "Credit limits prevent overexposure before deals are signed",
        "Risk ratings block high-risk deals automatically",
        "Compliance checks prevent regulatory violations",
      ],

      outcomes: [
        {
          metric: "100%",
          label: "Counterparty Verification",
          icon: CheckCircle,
        },
        { metric: "0", label: "Bad Debt Surprises", icon: AlertTriangle },
        { metric: "75%", label: "Risk Reduction", icon: Shield },
        { metric: "$2M+", label: "Exposure Prevented", icon: DollarSign },
      ],
    },
    {
      id: "catalog",
      name: "CATALOG",
      icon: Package,
      gradient: "from-purple-600 via-purple-700 to-purple-800",
      tagline: "What You Are Allowed to Trade",
      subtitle: "Commercial Truth Repository",
      description:
        "Deals fail because sales sells the wrong thing, pricing is uncontrolled, and costs are underestimated. Catalog defines commercial truth, not inventory.",

      subModules: [
        {
          name: "Items",
          icon: Package,
          description:
            "Anything tradable: SaaS subscriptions, construction projects, hospital procedures, consulting engagements",
          features: [
            "Product/service definitions",
            "Scope & specifications",
            "Unit of measure",
            "Category classification",
            "Active/inactive status",
          ],
          example: {
            scenario: "Cloud Migration Project Definition",
            item: "Enterprise Cloud Migration",
            baseScope: [
              "Infrastructure assessment",
              "Migration planning",
              "Data transfer",
              "6-month support",
            ],
            result: "Pricing & costing attach to this base definition",
          },
        },
        {
          name: "Pricing",
          icon: DollarSign,
          description: "Commercial price logic with controls",
          features: [
            "Base price by item",
            "Discount range limits",
            "Region-specific overrides",
            "Volume-based pricing",
            "Promotional pricing rules",
          ],
          example: {
            scenario: "Discount Control in Action",
            data: {
              "Base Price": "$100,000",
              "Max Allowed Discount": "15%",
              "Sales Attempts": "$80,000 (20% off)",
              "System Action": "BLOCKED",
            },
            result: "Sales cannot proceed without management override",
          },
        },
        {
          name: "Costing",
          icon: BarChart3,
          tag: "NOT ACCOUNTING",
          description: "Expected costs for approval logic, not actuals",
          features: [
            "Labor cost estimates",
            "Material costs",
            "Partner/subcontractor costs",
            "Overhead allocation",
            "Margin calculation",
          ],
          example: {
            scenario: "Deal Margin Analysis",
            breakdown: {
              "Deal Value": "$150,000",
              "Labor Cost": "$70,000",
              "Cloud Infrastructure": "$20,000",
              "Partner Share": "$15,000",
              "Expected Margin": "$45,000 (30%)",
            },
            usage: "Used only for approval decision, not accounting",
          },
        },
        {
          name: "Rules",
          icon: Shield,
          description: "Commercial guardrails and policies",
          examples: [
            {
              rule: "Minimum margin: 25%",
              action: "Deal below 25% auto-rejected",
            },
            {
              rule: "Certain services blocked in EU",
              action: "Geographic compliance enforced",
            },
            {
              rule: "Tax class must match geography",
              action: "Automatic validation",
            },
            {
              rule: "Customer credit limit check",
              action: "Pre-approval required",
            },
          ],
        },
        {
          name: "Packages",
          icon: Layers,
          description: "Market-facing bundles that expand internally",
          features: [
            "Bundle definitions",
            "Component item mapping",
            "Package-level pricing",
            "Automatic costing expansion",
            "Rule enforcement",
          ],
          example: {
            scenario: "Enterprise IT Transformation Package",
            marketFacing: "$300,000 - Enterprise IT Transformation",
            internalExpansion: [
              "Cloud migration (item)",
              "Security audit (item)",
              "12-month support (item)",
              "Training program (item)",
            ],
            result:
              "Single package price with full cost breakdown and margin check",
          },
        },
      ],

      keyPrinciple:
        "Catalog is about WHAT CAN BE SOLD and AT WHAT TERMS, not about physical inventory",

      outcomes: [
        { metric: "100%", label: "Price Control", icon: Lock },
        { metric: "0", label: "Margin Surprises", icon: TrendingUp },
        { metric: "95%", label: "Quote Accuracy", icon: Target },
        { metric: "50%", label: "Faster Quoting", icon: Zap },
      ],
    },
    {
      id: "revenue",
      name: "REVENUE",
      icon: TrendingUp,
      gradient: "from-green-600 via-green-700 to-green-800",
      tagline: "What You Plan to Sell",
      subtitle: "Not Finance - Permission to Earn",
      whyNotFinance: "No invoice. No cash. Only permission to earn revenue.",
      description:
        "Revenue management tracks the commercial journey from lead to signed contract, ensuring every deal meets approval criteria before commitment.",

      stages: [
        {
          name: "Lead",
          icon: Target,
          stage: "1",
          description: "Commercial intent capture",
          what: "Capture potential opportunity",
          example: {
            customer: "XYZ Inc",
            dealSize: "$200,000",
            package: "Enterprise Suite",
            status: "No approval yet - just intent",
          },
          noApprovalYet: true,
        },
        {
          name: "Evaluate",
          icon: BarChart3,
          stage: "2",
          description: "Commercial viability assessment",
          what: "System evaluates eligibility",
          checks: [
            "Margin percentage",
            "Expected costs",
            "Customer risk score",
            "Policy compliance",
            "Pricing rules",
          ],
          example: {
            scenario: "Deal fails margin check",
            data: {
              "Calculated Margin": "28%",
              "Required Minimum": "30%",
              "System Action": "Flagged for review",
            },
          },
        },
        {
          name: "Commit",
          icon: CheckSquare,
          stage: "3",
          description: "Approval matrix execution",
          what: "Authority-based approvals",
          approvalMatrix: [
            { role: "Manager", limit: "Up to $50,000", auto: true },
            { role: "Director", limit: "$50,001 - $150,000", auto: true },
            { role: "CFO", limit: "Above $150,000", auto: false },
          ],
          example: {
            dealValue: "$200,000",
            route: "Automatically routed to CFO",
            reason: "Exceeds director authority",
          },
        },
        {
          name: "Contract",
          icon: FileText,
          stage: "4",
          description: "Legal agreement execution",
          what: "Final commitment",
          actions: [
            "Final pricing locked",
            "Legal terms applied",
            "Digital signature captured",
            "Contract becomes immutable",
            "Tasks auto-assigned to Operations",
            "Revenue recognition scheduled",
          ],
          afterSignature:
            "Commerce responsibility ends - handoff to Operations & Finance",
          critical: "Contract is the LINE OF NO RETURN",
        },
      ],

      keyInsight:
        "Revenue module is about PERMISSION, not ACCOUNTING. It ends at the signed contract.",

      outcomes: [
        { metric: "100%", label: "Deal Compliance", icon: CheckCircle },
        { metric: "60%", label: "Faster Approvals", icon: Clock },
        { metric: "30%", label: "Better Margins", icon: TrendingUp },
        { metric: "0", label: "Unauthorized Deals", icon: Lock },
      ],
    },
    {
      id: "procurement",
      name: "PROCUREMENT",
      icon: ShoppingCart,
      gradient: "from-orange-600 via-orange-700 to-orange-800",
      tagline: "What You Plan to Buy",
      subtitle: "Mirror of Revenue for Purchases",
      description:
        "Procurement mirrors the Revenue workflow but for purchases. Every spend follows the same rigor: intent → evaluation → approval → contract.",

      stages: [
        {
          name: "Procure",
          icon: ShoppingCart,
          description: "Purchase intent",
          example: {
            vendor: "AWS",
            monthlySpend: "$30,000",
            service: "Cloud Infrastructure",
            status: "Intent captured",
          },
        },
        {
          name: "Evaluate",
          icon: BarChart3,
          description: "Commercial validation",
          checks: [
            "Vendor risk assessment",
            "Budget availability check",
            "Cost justification",
            "Alternative vendor analysis",
            "Compliance verification",
          ],
        },
        {
          name: "Commit",
          icon: CheckSquare,
          description: "Spend authority enforcement",
          approvalMatrix: [
            { role: "Department Head", limit: "Up to $10,000" },
            { role: "Operations Director", limit: "$10,001 - $50,000" },
            { role: "CFO", limit: "Above $50,000" },
          ],
          example: {
            spend: "$30,000/month",
            route: "Operations Director approval required",
          },
        },
        {
          name: "Contract",
          icon: FileText,
          description: "Vendor agreement execution",
          actions: [
            "Terms locked",
            "Vendor agreement signed",
            "Payment terms confirmed",
            "Tasks assigned to Finance",
            "PO auto-generated",
            "Liability tracked",
          ],
        },
      ],

      mirrorPrinciple:
        "Same rigor as Revenue, but for OUTBOUND money instead of INBOUND",

      outcomes: [
        { metric: "100%", label: "Spend Visibility", icon: Activity },
        { metric: "40%", label: "Cost Reduction", icon: TrendingDown },
        { metric: "0", label: "Maverick Spend", icon: Shield },
        { metric: "75%", label: "Vendor Compliance", icon: CheckCircle },
      ],
    },
    {
      id: "governance",
      name: "GOVERNANCE",
      icon: Shield,
      gradient: "from-red-600 via-red-700 to-red-800",
      tagline: "Commercial Constitution",
      subtitle: "The Rule Engine",
      whyCentral:
        "Without governance: Everyone approves everything, Nobody is accountable",
      description:
        "Governance is the central nervous system that enforces rules, limits, authorities, and risk across all commercial activities.",

      components: [
        {
          name: "Policies",
          icon: FileText,
          description: "Commercial rules and guardrails",
          examples: [
            {
              policy: "Maximum Discount Policy",
              rule: "No deal can have more than 20% discount without VP approval",
              enforcement: "Automatic at Evaluate stage",
            },
            {
              policy: "Credit Exposure Policy",
              rule: "No customer can exceed $500,000 outstanding",
              enforcement: "Checked at Contract creation",
            },
            {
              policy: "Geographic Restrictions",
              rule: "Certain services blocked in sanctioned countries",
              enforcement: "Blocked at Lead stage",
            },
            {
              policy: "Procurement Threshold",
              rule: "Any spend above $50,000 needs CFO approval",
              enforcement: "Routing at Commit stage",
            },
          ],
        },
        {
          name: "Limits",
          icon: AlertTriangle,
          description: "Numerical caps and boundaries",
          types: [
            {
              type: "Customer Exposure Limit",
              example: "Max $500,000 per customer",
              action: "New deal blocked if exceeded",
            },
            {
              type: "Department Budget",
              example: "$1M/year for Marketing",
              action: "Procurement blocked beyond budget",
            },
            {
              type: "Discount Ceiling",
              example: "Max 25% off for Enterprise segment",
              action: "Quote validation at Evaluate",
            },
            {
              type: "Vendor Spend Limit",
              example: "Max $100,000/month per vendor",
              action: "Approval required for excess",
            },
          ],
        },
        {
          name: "Authority",
          icon: Award,
          description: "Approval rights and delegation",
          dimensions: [
            "Role-based (Manager, Director, CFO)",
            "Amount-based ($0-50K, $50K-150K, $150K+)",
            "Risk-based (Low, Medium, High)",
            "Geography-based (Region restrictions)",
            "Customer-based (New vs Existing)",
          ],
          example: {
            scenario: "Deal Routing Logic",
            deal: {
              value: "$120,000",
              customer: "New",
              risk: "High",
              region: "EU",
            },
            route: "CFO + Legal approval required",
            reason: "High risk + New customer + Above $100K",
          },
        },
        {
          name: "Risk Engine",
          icon: Activity,
          tag: "CENTRAL",
          description: "Unified risk assessment",
          evaluates: [
            "Party risk (customer/vendor creditworthiness)",
            "Deal size risk (large vs small)",
            "Geographic risk (country stability)",
            "Counterparty concentration",
            "Payment history risk",
          ],
          output: "Risk score 0-100 that influences approval routing",
          example: {
            customer: "ABC Corp",
            factors: {
              "Credit Score": "65/100 (Medium)",
              "Payment History": "15 days average delay",
              Geography: "Emerging market",
              "Current Exposure": "$400K of $500K limit",
            },
            riskScore: "72/100 - High Risk",
            action: "Director approval required (normally Manager sufficient)",
          },
        },
        {
          name: "Audit Trail",
          icon: FileText,
          description: "Immutable compliance record",
          captures: [
            "Who approved",
            "When approved",
            "Why approved",
            "Under which policy",
            "Any exceptions granted",
            "All modifications",
          ],
          auditorView: "Complete forensic trail of every commercial decision",
          compliance: "SOX, SOC2, ISO compliance ready",
        },
      ],

      centralPrinciple:
        "Governance is not optional - it is the FOUNDATION that makes all other modules work",

      outcomes: [
        { metric: "100%", label: "Policy Compliance", icon: CheckCircle },
        { metric: "0", label: "Unauthorized Deals", icon: Lock },
        { metric: "Full", label: "Audit Trail", icon: FileText },
        { metric: "80%", label: "Risk Reduction", icon: Shield },
      ],
    },
  ];

  const fullFlow = [
    {
      step: "1",
      name: "Party Created & Verified",
      icon: Users,
      desc: "Counterparty eligibility confirmed",
    },
    {
      step: "2",
      name: "Catalog Item Approved",
      icon: Package,
      desc: "Product/service commercially valid",
    },
    {
      step: "3",
      name: "Lead Created",
      icon: Target,
      desc: "Commercial intent ($200,000)",
    },
    {
      step: "4",
      name: "Costing & Margin Evaluated",
      icon: BarChart3,
      desc: "System checks viability",
    },
    {
      step: "5",
      name: "Risk & Policy Check",
      icon: Shield,
      desc: "Governance engine validates",
    },
    {
      step: "6",
      name: "Authority Approval",
      icon: CheckSquare,
      desc: "Routed per approval matrix",
    },
    {
      step: "7",
      name: "Contract Signed",
      icon: FileText,
      desc: "Legal commitment executed",
    },
    {
      step: "8",
      name: "Tasks Auto-Assigned",
      icon: Settings,
      desc: "Operations & Finance execute",
    },
  ];

  const benefits = [
    {
      title: "100% Counterparty Verification",
      description: "Never deal with ineligible parties",
      icon: CheckCircle,
      metric: "0 bad deals",
    },
    {
      title: "Real-Time Margin Protection",
      description: "Every deal meets minimum margin requirements",
      icon: DollarSign,
      metric: "30% margin improvement",
    },
    {
      title: "Automated Approval Routing",
      description: "Intelligent routing based on authority matrix",
      icon: GitBranch,
      metric: "60% faster approvals",
    },
    {
      title: "Complete Audit Trail",
      description: "Every decision tracked and auditable",
      icon: FileText,
      metric: "100% compliance",
    },
    {
      title: "Risk-Based Controls",
      description: "High-risk deals automatically escalated",
      icon: Shield,
      metric: "75% risk reduction",
    },
    {
      title: "Commercial Intelligence",
      description: "Real-time visibility into all commercial activity",
      icon: Activity,
      metric: "$2M+ exposure prevented",
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
              <ShoppingCart className="h-6 w-6 text-[#033F99]" />
              <span className="text-[#033F99] font-bold text-lg">
                IB Commerce
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                Commercial Intelligence
              </span>
              <br />
              <span className="text-slate-900">That Prevents Failure</span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Stop commercial failures before they happen. IB Commerce ensures
              every deal, purchase, and contract meets your commercial rules
              before commitment.
            </p>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
              <Link to="/auth/signup">
                <button className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link to="/solutions/commerce/overview">
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
              {[
                { metric: "100%", label: "Deal Compliance" },
                { metric: "$2M+", label: "Exposure Prevented" },
                { metric: "0", label: "Unauthorized Deals" },
                { metric: "60%", label: "Faster Approvals" },
              ].map((stat, index) => (
                <div
                  key={`item-${index}`}
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

      {/* Why IB Commerce Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Why IB Commerce?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every commercial failure starts with a breakdown in foundational
              controls
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Users,
                title: "Wrong Counterparty",
                problem:
                  "Dealing with uncreditworthy customers or risky vendors",
                solution:
                  "PARTIES module ensures eligibility before any deal starts",
              },
              {
                icon: DollarSign,
                title: "Margin Erosion",
                problem:
                  "Sales gives excessive discounts, costs are underestimated",
                solution: "CATALOG enforces pricing rules and costing logic",
              },
              {
                icon: Shield,
                title: "No Governance",
                problem: "Everyone approves anything, no accountability",
                solution:
                  "GOVERNANCE enforces policies, limits, and audit trails",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={`item-${index}`}
                  className="bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-[#0558CC] hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-red-600 font-semibold mb-3">
                    ❌ {item.problem}
                  </p>
                  <p className="text-green-600 font-semibold">
                    ✅ {item.solution}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] rounded-3xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">The Core Principle</h3>
            <p className="text-xl leading-relaxed max-w-4xl mx-auto">
              IB Commerce is <span className="font-bold underline">NOT</span>{" "}
              about finance or accounting. It's about{" "}
              <span className="font-bold">PERMISSION</span> - who you can do
              business with, what you can sell, at what price, and under whose
              authority.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Deep Dive */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              The 5 Core Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Each module serves a specific purpose in your commercial operating
              system
            </p>
          </div>

          <div className="space-y-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#0558CC] transition-all overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setSelectedModule(
                        selectedModule === module.id ? null : module.id,
                      )
                    }
                    className="w-full p-8 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <div
                        className={`w-20 h-20 bg-gradient-to-br ${module.gradient} rounded-3xl flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-slate-900">
                            {module.name}
                          </h3>
                          {module.priority && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                              {module.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-[#033F99] mb-1">
                          {module.tagline}
                        </p>
                        <p className="text-slate-600">{module.description}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-8 w-8 text-[#033F99] transition-transform ${selectedModule === module.id ? "rotate-90" : ""}`}
                    />
                  </button>

                  {selectedModule === module.id && (
                    <div className="px-8 pb-8 border-t border-slate-200 pt-8">
                      {/* Module Details Based on Type */}
                      {module.subModules && (
                        <div className="space-y-8">
                          {module.subModules.map((subModule, subIndex) => {
                            const SubIcon = subModule.icon;
                            return (
                              <div
                                key={subIndex}
                                className="bg-gradient-to-r from-slate-50 to-white p-6 rounded-2xl border border-slate-200"
                              >
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-12 h-12 bg-[#C4D9F4] rounded-xl flex items-center justify-center flex-shrink-0">
                                    <SubIcon className="h-6 w-6 text-[#033F99]" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="text-xl font-bold text-slate-900">
                                        {subModule.name}
                                      </h4>
                                      {subModule.tag && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                          {subModule.tag}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-slate-600 mb-4">
                                      {subModule.description}
                                    </p>

                                    {subModule.dataPoints && (
                                      <div className="mb-4">
                                        <p className="font-semibold text-slate-900 mb-2">
                                          Key Data Points:
                                        </p>
                                        <ul className="grid grid-cols-2 gap-2">
                                          {subModule.dataPoints.map(
                                            (point, i) => (
                                              <li
                                                key={`item-${i}`}
                                                className="flex items-center gap-2 text-sm text-slate-700"
                                              >
                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                {point}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                    {subModule.example &&
                                      subModule.example.data && (
                                        <div className="bg-white p-4 rounded-xl border-2 border-[#033F99]">
                                          <p className="font-bold text-[#033F99] mb-3">
                                            💡 Real Example:{" "}
                                            {subModule.example.scenario}
                                          </p>
                                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                              <p className="text-xs font-semibold text-slate-500 mb-2">
                                                PARTY DATA:
                                              </p>
                                              {Object.entries(
                                                subModule.example.data,
                                              ).map(([key, value], i) => (
                                                <div
                                                  key={`item-${i}`}
                                                  className="flex justify-between text-sm mb-1"
                                                >
                                                  <span className="text-slate-600">
                                                    {key}:
                                                  </span>
                                                  <span className="font-semibold">
                                                    {value}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                            <div>
                                              <p className="text-xs font-semibold text-slate-500 mb-2">
                                                SYSTEM RESULT:
                                              </p>
                                              <div className="space-y-1 text-sm">
                                                {subModule.example.result && (
                                                  <>
                                                    {subModule.example.result
                                                      .allowed && (
                                                        <p className="text-green-600">
                                                          ✅{" "}
                                                          {
                                                            subModule.example
                                                              .result.allowed
                                                          }
                                                        </p>
                                                      )}
                                                    {subModule.example.result
                                                      .blocked && (
                                                        <p className="text-red-600">
                                                          ❌{" "}
                                                          {
                                                            subModule.example
                                                              .result.blocked
                                                          }
                                                        </p>
                                                      )}
                                                    {subModule.example.result
                                                      .action && (
                                                        <p className="text-blue-600">
                                                          →{" "}
                                                          {
                                                            subModule.example
                                                              .result.action
                                                          }
                                                        </p>
                                                      )}
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="border-t pt-3">
                                            <p className="text-xs font-semibold text-slate-500 mb-1">
                                              WHAT THIS PREVENTS:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {subModule.example.prevented &&
                                                subModule.example.prevented.map(
                                                  (item, i) => (
                                                    <span
                                                      key={`item-${i}`}
                                                      className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded"
                                                    >
                                                      {item}
                                                    </span>
                                                  ),
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    {subModule.example &&
                                      subModule.example.item && (
                                        <div className="bg-white p-4 rounded-xl border-2 border-[#033F99]">
                                          <p className="font-bold text-[#033F99] mb-3">
                                            💡 Real Example:{" "}
                                            {subModule.example.scenario}
                                          </p>
                                          <div className="space-y-2 text-sm">
                                            <div>
                                              <span className="font-semibold">
                                                Item:
                                              </span>{" "}
                                              {subModule.example.item}
                                            </div>
                                            {subModule.example.baseScope && (
                                              <div>
                                                <span className="font-semibold">
                                                  Base Scope:
                                                </span>
                                                <ul className="list-disc list-inside ml-4 mt-1">
                                                  {subModule.example.baseScope.map(
                                                    (scope, i) => (
                                                      <li key={`item-${i}`}>
                                                        {scope}
                                                      </li>
                                                    ),
                                                  )}
                                                </ul>
                                              </div>
                                            )}
                                            <div className="text-green-600 font-semibold">
                                              → {subModule.example.result}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    {subModule.example &&
                                      subModule.example.breakdown && (
                                        <div className="bg-white p-4 rounded-xl border-2 border-[#033F99]">
                                          <p className="font-bold text-[#033F99] mb-3">
                                            💡 Real Example:{" "}
                                            {subModule.example.scenario}
                                          </p>
                                          <div className="space-y-2 text-sm">
                                            {Object.entries(
                                              subModule.example.breakdown,
                                            ).map(([key, value], i) => (
                                              <div
                                                key={`item-${i}`}
                                                className="flex justify-between"
                                              >
                                                <span className="text-slate-600">
                                                  {key}:
                                                </span>
                                                <span className="font-semibold">
                                                  {value}
                                                </span>
                                              </div>
                                            ))}
                                            <div className="border-t pt-2 mt-2 text-blue-600 font-semibold">
                                              {subModule.example.usage}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {module.stages && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 overflow-x-auto pb-4">
                            {module.stages.map((stage, stageIndex) => {
                              const StageIcon = stage.icon;
                              return (
                                <React.Fragment key={stageIndex}>
                                  <div className="flex-shrink-0 w-64 bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border-2 border-[#033F99]">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-10 h-10 bg-[#033F99] rounded-full flex items-center justify-center text-white font-bold">
                                        {stage.stage}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-slate-900">
                                          {stage.name}
                                        </h4>
                                        <p className="text-xs text-slate-600">
                                          {stage.what}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2">
                                      {stage.description}
                                    </p>
                                    {stage.noApprovalYet && (
                                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                        No approval yet
                                      </span>
                                    )}
                                  </div>
                                  {stageIndex < module.stages.length - 1 && (
                                    <ArrowRight className="h-8 w-8 text-[#033F99] flex-shrink-0" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {module.components && (
                        <div className="grid md:grid-cols-2 gap-6">
                          {module.components.map((component, compIndex) => {
                            const CompIcon = component.icon;
                            return (
                              <div
                                key={compIndex}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200"
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <CompIcon className="h-8 w-8 text-[#033F99]" />
                                  <div>
                                    <h4 className="font-bold text-lg text-slate-900">
                                      {component.name}
                                    </h4>
                                    {component.tag && (
                                      <span className="text-xs font-semibold text-red-600">
                                        {component.tag}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-600 text-sm mb-3">
                                  {component.description}
                                </p>
                                {component.examples &&
                                  component.examples.length > 0 && (
                                    <div className="space-y-2">
                                      {component.examples.map((ex, i) => (
                                        <div
                                          key={`item-${i}`}
                                          className="bg-white p-3 rounded-lg text-sm"
                                        >
                                          <p className="font-semibold text-[#033F99] mb-1">
                                            {ex.rule || ex.policy}
                                          </p>
                                          <p className="text-slate-600">
                                            {ex.action || ex.enforcement}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Outcomes */}
                      {module.outcomes && (
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                          {module.outcomes.map((outcome, outIndex) => {
                            const OutIcon = outcome.icon;
                            return (
                              <div
                                key={outIndex}
                                className="bg-gradient-to-br from-[#033F99] to-[#033F99] p-4 rounded-2xl text-white text-center"
                              >
                                <OutIcon className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-3xl font-bold mb-1">
                                  {outcome.metric}
                                </p>
                                <p className="text-sm opacity-90">
                                  {outcome.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Complete Flow */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              The Complete Commercial Flow
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From party verification to task execution - see how all modules
              work together
            </p>
          </div>

          <div className="relative">
            {fullFlow.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={`item-${index}`}
                  className="flex items-start gap-6 mb-8 last:mb-0"
                >
                  {/* Step Number & Line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {step.step}
                    </div>
                    {index < fullFlow.length - 1 && (
                      <div className="w-1 h-16 bg-gradient-to-b from-[#033F99] to-[#C4D9F4] mt-2"></div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 bg-gradient-to-r from-slate-50 to-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#0558CC] transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <StepIcon className="h-6 w-6 text-[#033F99]" />
                      <h3 className="text-xl font-bold text-slate-900">
                        {step.name}
                      </h3>
                    </div>
                    <p className="text-slate-600">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-3xl border-2 border-green-200 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Result: Zero Commercial Failures
            </h3>
            <p className="text-lg text-slate-700">
              Every step validates against policies, limits, and authorities
              before proceeding
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Measurable Business Impact
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See the results companies achieve with IB Commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const BenIcon = benefit.icon;
              return (
                <div
                  key={`item-${index}`}
                  className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-[#0558CC] hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mb-6">
                    <BenIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{benefit.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-3xl font-bold text-[#033F99]">
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
            Ready to Eliminate Commercial Failures?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join 500+ companies using IB Commerce to protect margins, enforce
            policies, and prevent bad deals
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

export default IBCommerceSolution;
