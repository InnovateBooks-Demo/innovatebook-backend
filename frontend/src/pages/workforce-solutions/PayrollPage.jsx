import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBWorkforceHub from "../IBWorkforceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Calculator,
  CheckCircle,
  Zap,
  FileText,
  Shield,
  Clock,
  DollarSign,
  Play,
  TrendingUp,
  Download,
  Calendar,
  Target,
  ArrowRight,
} from "lucide-react";

const PayrollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("January 2026");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const features = [
    {
      title: "Automated Salary Processing",
      description:
        "One-click monthly payroll with automatic calculations for all components.",
      items: [
        "Basic + DA + HRA calculation",
        "Overtime & shift allowances",
        "Arrears processing",
        "Salary revision handling",
      ],
    },
    {
      title: "Tax Compliance (TDS)",
      description:
        "Automatic tax deduction at source with investment declarations and regime selection.",
      items: [
        "Old vs New regime comparison",
        "Investment declaration (80C, 80D)",
        "Form 16 generation",
        "Monthly TDS calculation",
      ],
    },
    {
      title: "Statutory Deductions",
      description:
        "Automated PF, ESI, and Professional Tax calculations as per latest rates.",
      items: [
        "PF contribution tracking",
        "ESI calculations",
        "Professional Tax",
        "Labour Welfare Fund",
      ],
    },
    {
      title: "Payslip & Reports",
      description:
        "Generate professional payslips and compliance reports instantly.",
      items: [
        "Digital payslip generation",
        "Bank transfer files",
        "PF/ESI challan reports",
        "Salary register",
      ],
    },
  ];

  const benefits = [
    { metric: "35%", label: "Time Saved", description: "Automated processing" },
    {
      metric: "100%",
      label: "Compliance",
      description: "TDS, PF, ESI automated",
    },
    { metric: "Zero", label: "Errors", description: "System-calculated" },
  ];

  const payrollSummary = {
    totalEmployees: 156,
    grossPay: "₹1,24,50,000",
    netPay: "₹98,45,000",
    deductions: "₹26,05,000",
    status: "Ready to Process",
  };

  const demoPayslip = {
    employee: "Rahul Mehta",
    empId: "EMP-2022-0045",
    month: "January 2026",
    earnings: [
      { label: "Basic Salary", amount: 75000 },
      { label: "HRA", amount: 30000 },
      { label: "Special Allowance", amount: 25000 },
    ],
    deductions: [
      { label: "PF (Employee)", amount: 9000 },
      { label: "Professional Tax", amount: 200 },
      { label: "TDS", amount: 12500 },
    ],
  };

  const testimonials = [
    {
      quote:
        "Payroll used to take us 5 days every month. Now it's done in 4 hours. The compliance automation alone is worth the investment.",
      author: "Sunita Agarwal",
      role: "Finance Head",
      company: "ManufacturePro Ltd",
      rating: 5,
    },
    {
      quote:
        "Zero errors in 18 months of payroll processing. Our auditors are impressed with the documentation and trails.",
      author: "Karthik Nair",
      role: "CFO",
      company: "ServiceFirst India",
      rating: 5,
    },
    {
      quote:
        "The Form 16 generation saved us from hiring a CA firm just for TDS compliance. Complete ROI in 3 months.",
      author: "Priya Venkatesh",
      role: "HR Manager",
      company: "RetailMax",
      rating: 5,
    },
    {
      quote:
        "Multi-state compliance was a nightmare. Now PF, ESI, PT for all states is handled automatically.",
      author: "Deepak Sharma",
      role: "Payroll Manager",
      company: "LogisticsFirst",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "ManufacturePro Ltd",
    industry: "Manufacturing",
    employees: "2,400+",
    logo: "MP",
    challenge:
      "Manual payroll processing for 2,400+ employees across 8 locations took 12 days monthly, with frequent errors and compliance penalties averaging ₹4L per year.",
    solution:
      "Deployed IB Workforce Payroll with automated calculations, multi-location support, and integrated statutory compliance for PF, ESI, and TDS.",
    results: [
      { metric: "92%", label: "Time Reduction", detail: "12 days to 1 day" },
      {
        metric: "₹4L",
        label: "Penalties Saved",
        detail: "Zero compliance issues",
      },
      { metric: "₹18L", label: "Annual Savings", detail: "Reduced headcount" },
      { metric: "100%", label: "Accuracy", detail: "Zero payroll errors" },
    ],
    quote:
      "We processed our first error-free payroll in company history. The team now focuses on strategic HR instead of data entry.",
    quotePerson: "Rajesh Kumar",
    quoteRole: "VP Finance",
  };

  const grossTotal = demoPayslip.earnings.reduce((sum, e) => sum + e.amount, 0);
  const deductionsTotal = demoPayslip.deductions.reduce(
    (sum, d) => sum + d.amount,
    0,
  );
  const netPay = grossTotal - deductionsTotal;

  return (
    <IBWorkforceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Payroll</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Automated Compensation Management
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Complete payroll processing with automatic tax calculations,
            statutory deductions, and compliance for India.
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
          title="Payroll Processing Demo"
          description="One-click payroll with full compliance"
          duration="4 min"
          moduleName="IB Workforce"
          subModule="Payroll Module"
          Icon={Calculator}
          category="business"
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Payroll Summary */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-4 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Payroll Summary</h3>
                  <p className="text-sm opacity-80">{selectedMonth}</p>
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white/20 text-white border-0 rounded-lg px-3 py-1 text-sm"
                >
                  <option>January 2026</option>
                  <option>December 2025</option>
                  <option>November 2025</option>
                </select>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Total Employees</span>
                  <span className="font-bold text-slate-900">
                    {payrollSummary.totalEmployees}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Gross Pay</span>
                  <span className="font-bold text-green-600">
                    {payrollSummary.grossPay}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Deductions</span>
                  <span className="font-bold text-red-600">
                    {payrollSummary.deductions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Net Pay</span>
                  <span className="font-bold text-2xl text-[#033F99]">
                    {payrollSummary.netPay}
                  </span>
                </div>
                <button className="w-full bg-[#033F99] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#033F99] transition-colors">
                  <Play className="h-5 w-5" /> Process Payroll
                </button>
              </div>
            </div>

            {/* Sample Payslip */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-slate-100 p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {demoPayslip.employee}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {demoPayslip.empId} • {demoPayslip.month}
                  </p>
                </div>
                <Download className="h-5 w-5 text-[#033F99] cursor-pointer hover:scale-110 transition-transform" />
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Earnings
                  </h4>
                  {demoPayslip.earnings.map((e, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-slate-600">{e.label}</span>
                      <span className="font-semibold text-green-600">
                        ₹{e.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm py-2 border-t border-slate-200 mt-2">
                    <span className="font-semibold text-slate-900">Gross</span>
                    <span className="font-bold text-green-600">
                      ₹{grossTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Deductions
                  </h4>
                  {demoPayslip.deductions.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-slate-600">{d.label}</span>
                      <span className="font-semibold text-red-600">
                        ₹{d.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm py-2 border-t border-slate-200 mt-2">
                    <span className="font-semibold text-slate-900">
                      Total Deductions
                    </span>
                    <span className="font-bold text-red-600">
                      ₹{deductionsTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-[#EBF3FC] p-4 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-slate-900">Net Pay</span>
                  <span className="text-2xl font-bold text-[#033F99]">
                    ₹{netPay.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Study */}
        <CaseStudy data={caseStudyData} />

        {/* Testimonials */}
        <TestimonialSection testimonials={testimonials} />

        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Automate Your Payroll?
              </h2>
              <p className="opacity-90">Process payroll in minutes, not days</p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" /> Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBWorkforceHub>
  );
};

export default PayrollPage;
