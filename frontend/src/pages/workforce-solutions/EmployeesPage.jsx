import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBWorkforceHub from "../IBWorkforceHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Users,
  CheckCircle,
  Zap,
  UserPlus,
  FileText,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Award,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

const EmployeesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      title: "Complete Employee Profiles",
      description:
        "Store all employee information in one place - personal details, emergency contacts, documents, and more.",
      items: [
        "Personal & contact information",
        "Emergency contacts",
        "ID documents & certificates",
        "Bank account details",
      ],
    },
    {
      title: "Organizational Hierarchy",
      description:
        "Visualize reporting structures and departmental organization across your company.",
      items: [
        "Reporting manager assignment",
        "Department & team mapping",
        "Org chart visualization",
        "Role-based access control",
      ],
    },
    {
      title: "Employment Lifecycle",
      description:
        "Track the complete journey from onboarding to exit, with all milestones documented.",
      items: [
        "Onboarding workflows",
        "Probation tracking",
        "Promotion history",
        "Exit management",
      ],
    },
    {
      title: "Document Management",
      description:
        "Securely store and manage all employee-related documents with version control.",
      items: [
        "Offer letters & contracts",
        "ID proofs & certificates",
        "Performance records",
        "Compliance documents",
      ],
    },
  ];

  const benefits = [
    {
      metric: "100%",
      label: "Data Completeness",
      description: "All employee data in one place",
    },
    {
      metric: "60%",
      label: "Faster Onboarding",
      description: "Automated workflows",
    },
    {
      metric: "Zero",
      label: "Compliance Gaps",
      description: "Document tracking",
    },
  ];

  const demoEmployees = [
    {
      id: "EMP001",
      name: "Rahul Mehta",
      role: "Senior Product Manager",
      dept: "Engineering",
      status: "Active",
      joined: "Mar 2022",
      avatar: "RM",
    },
    {
      id: "EMP002",
      name: "Priya Sharma",
      role: "Lead Designer",
      dept: "Design",
      status: "Active",
      joined: "Jan 2023",
      avatar: "PS",
    },
    {
      id: "EMP003",
      name: "Amit Kumar",
      role: "Software Engineer",
      dept: "Engineering",
      status: "Active",
      joined: "Jun 2023",
      avatar: "AK",
    },
    {
      id: "EMP004",
      name: "Sneha Reddy",
      role: "HR Manager",
      dept: "HR",
      status: "Active",
      joined: "Aug 2021",
      avatar: "SR",
    },
    {
      id: "EMP005",
      name: "Vikram Singh",
      role: "Sales Executive",
      dept: "Sales",
      status: "Probation",
      joined: "Nov 2025",
      avatar: "VS",
    },
  ];

  const testimonials = [
    {
      quote:
        "We reduced our onboarding time from 2 weeks to 3 days. The automated document collection and verification is a game-changer.",
      author: "Meera Krishnan",
      role: "HR Director",
      company: "TechCorp India",
      rating: 5,
    },
    {
      quote:
        "Finally, a single source of truth for all employee data. No more hunting through spreadsheets and folders.",
      author: "Rajesh Patel",
      role: "COO",
      company: "StartupXYZ",
      rating: 5,
    },
    {
      quote:
        "The org chart visualization helped us identify reporting gaps we didn't know existed. Our structure is now crystal clear.",
      author: "Ananya Rao",
      role: "CHRO",
      company: "FinanceFirst Ltd",
      rating: 5,
    },
    {
      quote:
        "Compliance audits used to be nightmares. Now all documents are in one place with complete history. Auditors love it.",
      author: "Vikram Malhotra",
      role: "Compliance Head",
      company: "PharmaGlobal India",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "TechScale Solutions",
    industry: "IT Services",
    employees: "850+",
    logo: "TS",
    challenge:
      "TechScale was managing employee data across 12 different spreadsheets, leading to data inconsistencies, compliance issues, and a 3-week onboarding process.",
    solution:
      "Implemented IB Workforce Employee module with centralized profiles, automated onboarding workflows, and digital document management.",
    results: [
      {
        metric: "75%",
        label: "Faster Onboarding",
        detail: "From 3 weeks to 4 days",
      },
      {
        metric: "100%",
        label: "Data Accuracy",
        detail: "Single source of truth",
      },
      {
        metric: "₹18L",
        label: "Annual Savings",
        detail: "Reduced manual work",
      },
      {
        metric: "Zero",
        label: "Compliance Issues",
        detail: "In last 18 months",
      },
    ],
    quote:
      "IB Workforce transformed how we manage our people data. What used to take our HR team weeks now happens automatically.",
    quotePerson: "Sanjay Mehta",
    quoteRole: "VP HR",
  };

  const filteredEmployees = demoEmployees.filter(
    (emp) =>
      (activeTab === "all" || emp.dept.toLowerCase() === activeTab) &&
      (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <IBWorkforceHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Employees</h1>
              <p className="text-lg text-[#033F99] font-semibold">
                Complete Employee Registry
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Centralized employee data management with full profile management,
            organizational hierarchy, and document storage.
          </p>
        </div>

        {/* Key Benefits */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#033F99] to-[#033F99] p-6 rounded-2xl text-white"
              >
                <p className="text-4xl font-bold mb-2">{benefit.metric}</p>
                <p className="font-semibold mb-1">{benefit.label}</p>
                <p className="text-sm opacity-80">{benefit.description}</p>
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
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#033F99] transition-all hover:shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item, i) => (
                    <li
                      key={i}
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

        {/* Interactive Demo Preview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Interactive Preview
          </h2>
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-64"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="text-sm border-0 focus:ring-0 text-slate-700"
                  >
                    <option value="all">All Departments</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="hr">HR</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>
              </div>
              <button className="bg-[#033F99] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Add Employee
              </button>
            </div>

            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-500">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{emp.role}</td>
                    <td className="px-6 py-4 text-slate-700">{emp.dept}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${emp.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {emp.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Video Walkthrough */}
        <VideoWalkthrough
          title="Employee Management Demo"
          description="See how to manage your workforce efficiently"
          duration="5 min"
          moduleName="IB Workforce"
          subModule="Employees Module"
          Icon={Users}
          category="team"
        />

        {/* Case Study */}
        <CaseStudy data={caseStudyData} />

        {/* Testimonials */}
        <TestimonialSection testimonials={testimonials} />

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready to Centralize Your Employee Data?
              </h2>
              <p className="opacity-90">
                Start managing your workforce with complete visibility
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
    </IBWorkforceHub>
  );
};

export default EmployeesPage;
