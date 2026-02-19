import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  Landmark,
  Settings,
  FileText,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  BarChart3,
  Play,
  Sparkles,
  ChevronRight,
  Target,
  Clock,
  Globe,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";
import {
  AnimatedCounter,
  TrustMarquee,
  TestimonialCarousel,
  FAQAccordion,
  SecurityBadges,
  ProcessSteps,
} from "../components/interactive";

const SolutionsIndex = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const solutions = [
    {
      id: "commerce",
      name: "IB Commerce",
      subtitle: "Commercial Governance",
      icon: ShoppingCart,
      description:
        "End-to-end commercial operations from leads to collections with complete audit trails.",
      features: [
        "Pipeline Management",
        "Contract Lifecycle",
        "Revenue Recognition",
        "Collections Automation",
      ],
      stats: { value: "45%", label: "faster collections" },
      path: "/solutions/commerce",
      modules: ["Leads", "Customers", "Contracts", "Invoicing"],
    },
    {
      id: "operations",
      name: "IB Operations",
      subtitle: "Execution & Delivery Control",
      icon: Settings,
      description:
        "Project and service delivery with resource planning and real-time tracking.",
      features: [
        "Project Management",
        "Resource Planning",
        "Time Tracking",
        "Delivery Milestones",
      ],
      stats: { value: "30%", label: "productivity boost" },
      path: "/solutions/operations",
      modules: ["Projects", "Timesheets", "Milestones", "Resources"],
    },
    {
      id: "finance",
      name: "IB Finance",
      subtitle: "Financial System of Record",
      icon: FileText,
      description:
        "Complete financial operations with real-time reporting and automated reconciliation.",
      features: [
        "Multi-Entity Accounting",
        "Bank Reconciliation",
        "Financial Statements",
        "Tax Compliance",
      ],
      stats: { value: "4 hrs", label: "month-end close" },
      path: "/solutions/finance",
      modules: ["Accounting", "Billing", "Expenses", "Reports"],
    },
    {
      id: "workforce",
      name: "IB Workforce",
      subtitle: "People & Payroll",
      icon: Users,
      description:
        "Employee lifecycle, payroll processing, and compliance all in one place.",
      features: [
        "Employee Management",
        "Payroll Processing",
        "Leave & Attendance",
        "Compliance Reports",
      ],
      stats: { value: "99%", label: "payroll accuracy" },
      path: "/solutions/workforce",
      modules: ["Employees", "Payroll", "Attendance", "Benefits"],
    },
    {
      id: "capital",
      name: "IB Capital",
      subtitle: "Ownership & Treasury",
      icon: Landmark,
      description:
        "Cap table management, funding rounds, and treasury operations for growing companies.",
      features: [
        "Cap Table",
        "Funding Rounds",
        "Investor Relations",
        "Treasury Management",
      ],
      stats: { value: "100%", label: "compliance ready" },
      path: "/solutions/capital",
      modules: ["Cap Table", "Funding", "Treasury", "Reports"],
    },
  ];

  const processSteps = [
    { title: "Lead", description: "Capture & qualify" },
    { title: "Contract", description: "Close & govern" },
    { title: "Deliver", description: "Execute & track" },
    { title: "Bill", description: "Invoice & collect" },
    { title: "Pay", description: "Process payroll" },
    { title: "Report", description: "Analyze & decide" },
  ];

  const whyChooseUs = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Predictive insights that help you make better decisions",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and SOC 2 compliance",
    },
    {
      icon: Zap,
      title: "Real-Time Data",
      description: "Live dashboards and instant reporting",
    },
    {
      icon: Globe,
      title: "Multi-Entity Ready",
      description: "Manage multiple companies effortlessly",
    },
  ];

  const faqs = [
    {
      question: "Can I use just one solution or do I need all of them?",
      answer:
        "You can start with any single solution and add more as your needs grow. Each solution works independently, but the real power comes from how they connect—giving you complete visibility across your business.",
    },
    {
      question: "How do the solutions work together?",
      answer:
        "All solutions share a common data layer. When a contract is signed in Commerce, Operations can start delivery, Finance tracks the revenue, Workforce manages the team, and Capital shows the impact on your balance sheet—all automatically.",
    },
    {
      question: "Is there a learning curve?",
      answer:
        "We've designed Innovate Books to be intuitive. Most teams are productive within days, not weeks. Plus, we provide onboarding support, training resources, and dedicated customer success managers.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden bg-[#033F99]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-semibold text-sm mb-8">
              <Sparkles className="h-4 w-4" />
              <span>5 Solutions. One Platform. Complete Control.</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
              Business Solutions
              <br />
              <span className="font-light italic">That Actually Connect.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Stop using disconnected tools. Start with a unified platform where
              every decision is context-aware and every action is governed.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to="/auth/signup"
                className="inline-flex items-center gap-2 bg-white text-[#033F99] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <Sparkles className="h-5 w-5" />
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                <Play className="h-5 w-5" />
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Business Lifecycle Flow */}
      <section
        id="lifecycle"
        data-animate
        className="py-16 px-4 bg-white border-b border-slate-100"
      >
        <div
          className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible["lifecycle"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              The Complete Business Lifecycle
            </h2>
            <p className="text-slate-600">
              From first lead to financial report—all connected
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            {processSteps.map((step, index) => (
              <React.Fragment key={`step-${step.title}-${index}`}>
                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-full bg-[#033F99]/10 group-hover:bg-[#033F99] flex items-center justify-center transition-all mb-2">
                    <span className="font-bold text-[#033F99] group-hover:text-white transition-colors">
                      {index + 1}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {step.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    {step.description}
                  </span>
                </div>
                {index < processSteps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-slate-300 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section
        id="solutions-grid"
        data-animate
        className="py-20 px-4 bg-slate-50"
      >
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["solutions-grid"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
              Our Solutions
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Purpose-Built for Every Function
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Each solution is deep. Together, they form one connected system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Link
                  key={`solution-${solution.id}`}
                  to={solution.path}
                  className="group bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-[#033F99] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
                  onMouseEnter={() => setActiveCard(solution.id)}
                  onMouseLeave={() => setActiveCard(null)}
                  data-testid={`solution-card-${solution.id}`}
                >
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#033F99]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {solution.name}
                      </h3>
                    </div>
                    <p className="text-[#033F99] font-medium text-sm mb-4">
                      {solution.subtitle}
                    </p>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {solution.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {solution.features.slice(0, 3).map((feature, i) => (
                        <div
                          key={`feature-${i}`}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle className="h-4 w-4 text-[#033F99] flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats Badge */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-2xl font-bold text-[#033F99]">
                          {solution.stats.value}
                        </span>
                        <span className="text-sm text-slate-500 ml-2">
                          {solution.stats.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[#033F99] font-semibold group-hover:gap-2 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Intelligence Card */}
            <Link
              to="/solutions/intelligence"
              className="group bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-3xl p-8 border-2 border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden text-white"
              data-testid="solution-card-intelligence"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold">IB Intelligence</h3>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full font-medium">
                    AI
                  </span>
                </div>
                <p className="text-white/70 font-medium text-sm mb-4">
                  The Brain of the Platform
                </p>

                <p className="text-white/80 mb-6 leading-relaxed">
                  Detects risks early, forecasts outcomes, explains why things
                  are happening, and recommends what to do next.
                </p>

                <div className="space-y-2 mb-6">
                  {[
                    "Predictive Analytics",
                    "Anomaly Detection",
                    "Smart Recommendations",
                  ].map((feature, i) => (
                    <div
                      key={`ai-feature-${i}`}
                      className="flex items-center gap-2 text-sm text-white/80"
                    >
                      <CheckCircle className="h-4 w-4 text-white flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-white font-semibold group-hover:gap-2 transition-all pt-4 border-t border-white/20">
                  <span>Explore Intelligence</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" data-animate className="py-20 px-4 bg-white">
        <div
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible["why-us"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
                Why Innovate Books
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-slate-900">
                Not Just Software. <br />A Business Operating System.
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Most companies run on disconnected tools that create silos. We
                built something different—a unified platform where every
                decision has context and every action is governed.
              </p>

              <div className="space-y-6">
                {whyChooseUs.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`why-${item.title}-${index}`}
                      className="flex gap-4 group"
                    >
                      <div className="w-14 h-14 bg-[#033F99]/10 group-hover:bg-[#033F99] rounded-xl flex items-center justify-center flex-shrink-0 transition-all">
                        <Icon className="h-7 w-7 text-[#033F99] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#033F99]/10 to-[#033F99]/5 rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {solutions.slice(0, 4).map((solution, index) => {
                    const Icon = solution.icon;
                    return (
                      <div
                        key={`preview-${solution.id}`}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                      >
                        <Icon className="h-8 w-8 text-[#033F99] mb-3" />
                        <p className="font-bold text-slate-900 text-sm">
                          {solution.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Elements */}
              <div
                className="absolute -left-8 top-1/4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#033F99] rounded-full" />
                  <span className="text-sm font-medium text-slate-700">
                    All Connected
                  </span>
                </div>
              </div>
              <div
                className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 animate-bounce"
                style={{ animationDuration: "4s" }}
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#033F99]" />
                  <span className="text-sm font-medium text-slate-700">
                    AI-Powered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Your data is protected with industry-leading security standards
            </p>
          </div>
          <SecurityBadges />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" data-animate className="py-20 px-4 bg-white">
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible["faq"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#033F99]/10 text-[#033F99] text-sm font-semibold rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              Common Questions
            </h2>
          </div>

          <FAQAccordion faqs={faqs} variant="bordered" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Connect Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start with any solution. Add more as you grow. 14-day free trial. No
            credit card required.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 bg-white text-[#033F99] px-10 py-5 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-105 shadow-xl"
            >
              <Sparkles className="h-5 w-5" />
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-10 py-5 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img
                src="/innovate-books-logo-new.png"
                alt="Innovate Books"
                className="h-8 w-auto"
              />
              <span className="font-bold">Innovate Books</span>
            </div>
            <p className="text-slate-400 text-sm">
              &copy; 2025 Innovate Books. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SolutionsIndex;
