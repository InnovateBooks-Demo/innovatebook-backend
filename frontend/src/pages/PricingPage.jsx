import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Zap,
  Building2,
  Users,
  TrendingUp,
  Shield,
  Briefcase,
  Brain,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  Calculator,
  Sparkles,
  Clock,
  HeadphonesIcon,
  Play,
  ArrowDown,
  MousePointer,
  Layers,
  Lock,
  Globe,
  ChartBar,
  Rocket,
  Award,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

// Animated counter hook
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return [count, ref];
};

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [selectedSolutions, setSelectedSolutions] = useState(["Platform"]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Animated stats
  const [savedAmount, savedRef] = useCountUp(50, 2000);
  const [speedup, speedupRef] = useCountUp(85, 2000);
  const [activeUsers, usersRef] = useCountUp(10000, 2500);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Solution Prices with colors for interactive calculator
  const solutions = [
    {
      id: "Platform",
      name: "Platform",
      description: "Workspace + Intelligence Core",
      price: 6000,
      icon: Building2,
      color: "from-slate-600 to-slate-800",
      included: true,
    },
    {
      id: "IB Commerce",
      name: "IB Commerce",
      description: "Commercial Governance Engine",
      price: 7000,
      icon: Briefcase,
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "IB Operations",
      name: "IB Operations",
      description: "Execution & Delivery Control",
      price: 6000,
      icon: TrendingUp,
      color: "from-green-500 to-green-700",
    },
    {
      id: "IB Finance",
      name: "IB Finance",
      description: "Financial System of Record",
      price: 8000,
      icon: Calculator,
      color: "from-yellow-500 to-yellow-700",
    },
    {
      id: "IB Workforce",
      name: "IB Workforce",
      description: "People, Time, Payroll",
      price: 7000,
      icon: Users,
      color: "from-orange-500 to-orange-700",
    },
    {
      id: "IB Capital",
      name: "IB Capital",
      description: "Ownership, Funding, Treasury",
      price: 10000,
      icon: Shield,
      color: "from-red-500 to-red-700",
    },
    {
      id: "Advanced Intelligence",
      name: "Advanced Intelligence",
      description: "Risk, Forecasts, Simulations",
      price: 6000,
      icon: Brain,
      color: "from-purple-500 to-purple-700",
      addon: true,
    },
  ];

  // Bundled Plans
  const plans = [
    {
      name: "Starter",
      subtitle: "Early-stage companies",
      price: 18000,
      annualPrice: 15000,
      features: [
        "Platform (Workspace + Intelligence)",
        "IB Commerce",
        "IB Finance",
        "10 users included",
        "Email support",
      ],
      solutions: ["Platform", "IB Commerce", "IB Finance"],
      cta: "Start Free Trial",
      popular: false,
      gradient: "from-slate-50 to-slate-100",
      accent: "slate",
    },
    {
      name: "Growth",
      subtitle: "Scaling companies",
      price: 28000,
      annualPrice: 23333,
      features: [
        "Everything in Starter",
        "IB Operations",
        "IB Workforce",
        "Intelligence (basic)",
        "10 users included",
        "Priority email support",
      ],
      solutions: [
        "Platform",
        "IB Commerce",
        "IB Operations",
        "IB Finance",
        "IB Workforce",
      ],
      cta: "Start Free Trial",
      popular: true,
      gradient: "from-[#033F99] to-[#033F99]",
      accent: "blue",
    },
    {
      name: "Enterprise",
      subtitle: "CFO / Board driven",
      price: 45000,
      annualPrice: 37500,
      features: [
        "All Solutions included",
        "Advanced Intelligence",
        "Priority support",
        "Custom governance rules",
        "Dedicated success manager",
        "API access",
        "Custom integrations",
      ],
      solutions: [
        "Platform",
        "IB Commerce",
        "IB Operations",
        "IB Finance",
        "IB Workforce",
        "IB Capital",
        "Advanced Intelligence",
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-slate-800 to-slate-900",
      accent: "slate",
    },
  ];

  const faqs = [
    {
      q: "What is included in the Platform fee?",
      a: "The Platform fee includes Workspace layer (Chat, Tasks, Approvals, Notifications), Intelligence core (Signals, Metrics), Security, audit trails, and permissions management.",
    },
    {
      q: "Can I add more users?",
      a: "Yes! Up to 10 internal users are included in all plans. Additional users are ₹300/user/month. Client and vendor portal users are FREE with limited access.",
    },
    {
      q: "What is the annual discount?",
      a: "Pay annually and get 2 months free (approximately 17% off). For example, Enterprise at ₹45,000/month becomes ₹4,50,000/year instead of ₹5,40,000.",
    },
    {
      q: "Can I upgrade or downgrade my plan?",
      a: "Yes, you can change your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at the next billing cycle.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes! All plans come with a 14-day free trial. No credit card required. You'll have access to all features in your selected plan.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, debit cards, UPI, net banking, and bank transfers for annual plans. Enterprise customers can also pay via invoice.",
    },
  ];

  const getDisplayPrice = (monthlyPrice) => {
    if (billingCycle === "annual") {
      return Math.round((monthlyPrice * 10) / 12);
    }
    return monthlyPrice;
  };

  // Calculate total for custom pricing calculator
  const calculateCustomTotal = () => {
    return solutions
      .filter((s) => selectedSolutions.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  };

  const toggleSolution = (solutionId) => {
    if (solutionId === "Platform") return; // Platform is mandatory
    setSelectedSolutions((prev) =>
      prev.includes(solutionId)
        ? prev.filter((id) => id !== solutionId)
        : [...prev, solutionId],
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-24 pb-20 px-6 relative overflow-hidden bg-[#033F99]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-semibold text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            Enterprise Operating System
            <span className="px-2 py-0.5 bg-white text-[#033F99] text-xs rounded-full ml-1 font-bold">
              NEW
            </span>
          </div>

          <h1 className="text-4xl xs:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Pricing built for
            <br />
            <span className="italic font-light">business maturity.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Not by number of buttons you click.{" "}
            <span className="font-semibold text-white">
              Choose what you need today
            </span>
            , expand as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/20 backdrop-blur-sm p-2 rounded-2xl mb-8 w-full sm:w-auto">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${billingCycle === "monthly"
                ? "bg-white text-[#033F99] shadow-lg"
                : "text-white hover:bg-white/10"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${billingCycle === "annual"
                ? "bg-white text-[#033F99] shadow-lg"
                : "text-white hover:bg-white/10"
                }`}
            >
              Annual
              <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans Section with Hover Effects */}
      <section className="py-16 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl border-2 transition-all duration-500 transform ${hoveredPlan === index ? "scale-105 shadow-2xl" : "shadow-lg"
                  } ${plan.popular
                    ? "border-[#033F99] ring-4 ring-[#033F99]/20"
                    : "border-slate-200 hover:border-[#033F99]/50"
                  }`}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-[#033F99] to-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Star className="h-4 w-4 fill-current" /> Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div
                  className={`p-8 ${plan.popular ? "bg-gradient-to-br from-[#033F99]/5 to-purple-500/5" : ""} rounded-t-3xl`}
                >
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="text-slate-600">{plan.subtitle}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        ₹{getDisplayPrice(plan.price).toLocaleString()}
                      </span>
                      <span className="text-slate-600 text-lg">/month</span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-sm text-green-600 font-semibold mt-2 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Billed ₹
                        {(getDisplayPrice(plan.price) * 12).toLocaleString()}
                        /year
                      </p>
                    )}
                  </div>

                  <Link
                    to={
                      plan.name === "Enterprise" ? "/contact" : "/auth/signup"
                    }
                  >
                    <button
                      className={`w-full py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${plan.popular
                        ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white hover:shadow-lg hover:shadow-[#033F99]/30"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        }`}
                    >
                      <Zap className="h-5 w-5" />
                      {plan.cta}
                    </button>
                  </Link>
                </div>

                {/* Features List */}
                <div className="p-8 pt-0 space-y-4">
                  {plan.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 opacity-0 animate-fadeIn"
                      style={{
                        animationDelay: `${i * 100 + 300}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Included Solutions Preview */}
                <div className="px-8 pb-8">
                  <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">
                    Included Solutions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {plan.solutions.map((sol, i) => {
                      const solution = solutions.find((s) => s.id === sol);
                      const Icon = solution?.icon || Layers;
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {sol.replace("IB ", "")}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Pricing Calculator */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-[#033F99]/90 to-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Build Your Custom Plan
            </h2>
            <p className="text-slate-300 text-lg">
              Select the solutions you need and see your price in real-time
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Solution Selector */}
              <div className="space-y-4">
                {solutions.map((solution) => {
                  const Icon = solution.icon;
                  const isSelected = selectedSolutions.includes(solution.id);
                  const isRequired = solution.included;

                  return (
                    <button
                      key={solution.id}
                      onClick={() => toggleSolution(solution.id)}
                      disabled={isRequired}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border-2 ${isSelected
                        ? "bg-white/20 border-white/40 shadow-lg"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        } ${isRequired ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">
                            {solution.name}
                          </p>
                          {isRequired && (
                            <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-300 text-xs rounded-full font-semibold">
                              Required
                            </span>
                          )}
                          {solution.addon && (
                            <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full font-semibold">
                              Add-on
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300">
                          {solution.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          ₹{solution.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">/month</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                          ? "bg-green-500 border-green-500"
                          : "border-white/40"
                          }`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 sticky top-32 h-fit">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Your Custom Plan
                </h3>

                <div className="space-y-4 mb-6">
                  {solutions
                    .filter((s) => selectedSolutions.includes(s.id))
                    .map((solution) => {
                      const Icon = solution.icon;
                      return (
                        <div
                          key={solution.id}
                          className="flex items-center justify-between py-2 border-b border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-[#033F99]" />
                            <span className="text-slate-700">
                              {solution.name}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-900">
                            ₹{solution.price.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="bg-gradient-to-r from-[#033F99]/10 to-purple-500/10 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">Monthly Total</span>
                    <span className="text-3xl font-bold text-slate-900">
                      ₹{calculateCustomTotal().toLocaleString()}
                    </span>
                  </div>
                  {billingCycle === "annual" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-semibold">
                        Annual Savings
                      </span>
                      <span className="text-green-600 font-bold">
                        ₹
                        {Math.round(
                          calculateCustomTotal() * 2,
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <Link to="/auth/signup">
                  <button className="w-full py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#033F99]/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Start 14-Day Free Trial
                  </button>
                </Link>

                <p className="text-center text-sm text-slate-500 mt-4">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              ref={savedRef}
              className="text-center p-6 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            >
              <p className="text-5xl font-bold text-green-600 mb-2">
                ₹{savedAmount}L+
              </p>
              <p className="text-slate-900 font-semibold">Saved by Customers</p>
              <p className="text-slate-600 text-sm">In compliance penalties</p>
            </div>
            <div
              ref={speedupRef}
              className="text-center p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            >
              <p className="text-5xl font-bold text-blue-600 mb-2">
                {speedup}%
              </p>
              <p className="text-slate-900 font-semibold">Faster Reporting</p>
              <p className="text-slate-600 text-sm">Month-end close</p>
            </div>
            <div
              ref={usersRef}
              className="text-center p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
            >
              <p className="text-5xl font-bold text-purple-600 mb-2">
                {activeUsers.toLocaleString()}+
              </p>
              <p className="text-slate-900 font-semibold">Active Users</p>
              <p className="text-slate-600 text-sm">Across India</p>
            </div>
            <div className="text-center p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <p className="text-5xl font-bold text-slate-700 mb-2">99.9%</p>
              <p className="text-slate-900 font-semibold">Uptime</p>
              <p className="text-slate-600 text-sm">Enterprise-grade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution-wise Pricing Table */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Solution-wise Pricing
            </h2>
            <p className="text-slate-600 text-lg">
              Each solution is independently valuable, but stronger together.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] sm:min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="text-left p-6 font-bold text-slate-700">
                      Solution
                    </th>
                    <th className="text-left p-6 font-bold text-slate-700 hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-right p-6 font-bold text-slate-700">
                      Price/Month
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {solutions.map((solution, i) => {
                    const Icon = solution.icon;
                    return (
                      <tr
                        key={i}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {solution.name}
                              </p>
                              {solution.included && (
                                <span className="text-xs text-[#033F99] font-bold uppercase">
                                  Mandatory
                                </span>
                              )}
                              {solution.addon && (
                                <span className="text-xs text-purple-600 font-bold uppercase">
                                  Add-on
                                </span>
                              )}
                              <p className="text-sm text-slate-600 md:hidden">
                                {solution.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-slate-600 hidden md:table-cell">
                          {solution.description}
                        </td>
                        <td className="p-6 text-right">
                          <span className="text-2xl font-bold text-slate-900">
                            ₹{solution.price.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Pricing Card */}
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold">User Pricing</h4>
                  <p className="text-white/80">
                    Up to 10 users included • Additional users ₹300/user/month
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right bg-white/10 px-8 py-4 rounded-2xl">
                <p className="text-sm text-white/80">Client & Vendor Portal</p>
                <p className="text-3xl font-bold">FREE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#033F99] via-[#033F99] to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why This Pricing Makes Sense
            </h2>
            <p className="text-xl text-white/70">
              You&apos;re buying risk reduction + control, not features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calculator,
                title: "Market Comparison",
                description:
                  "Tally + Zoho + CRM + Payroll + Cap table = ₹50k–₹1L/month. Innovate Books = single governed system at fraction of cost.",
              },
              {
                icon: Shield,
                title: "Risk Prevention",
                description:
                  "Prevents margin leakage, compliance penalties, and capital mistakes. One governance gap can cost 10x your annual subscription.",
              },
              {
                icon: Award,
                title: "Board Visibility",
                description:
                  "Enables board-grade visibility and governance. From startup to IPO-ready in a single platform.",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 hover:-translate-y-2"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section with Smooth Accordion */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-slate-50 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${expandedFaq === i
                  ? "border-[#033F99] shadow-lg"
                  : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="font-bold text-slate-900 text-lg pr-4">
                    {faq.q}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${expandedFaq === i
                      ? "bg-[#033F99] rotate-180"
                      : "bg-slate-200"
                      }`}
                  >
                    <ChevronDown
                      className={`h-5 w-5 transition-colors ${expandedFaq === i ? "text-white" : "text-slate-600"}`}
                    />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${expandedFaq === i ? "max-h-48" : "max-h-0"
                    }`}
                >
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aC0ydi00aDJ2LTJoLTR2NmgzdjJ6bTAtOGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/signup">
              <button className="bg-white text-[#033F99] px-10 py-5 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-105 flex items-center gap-3 shadow-2xl">
                <Zap className="h-6 w-6" />
                Start Free Trial
              </button>
            </Link>
            <Link to="/contact">
              <button className="bg-transparent text-white px-10 py-5 rounded-xl font-bold border-2 border-white/40 hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-sm">
                <HeadphonesIcon className="h-6 w-6" />
                Talk to Sales
              </button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/70">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span>GDPR Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-[#033F99] font-bold text-xl">IB</span>
              </div>
              <span className="text-2xl font-bold">Innovate Books</span>
            </div>
            <p className="text-slate-400">
              © 2026 Innovate Books. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
