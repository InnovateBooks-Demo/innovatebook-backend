import React, { useState } from "react";
import { Link } from "react-router-dom";
import SharedNavigation from "../components/SharedNavigation";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
  Lock,
  FileCheck,
  CheckCircle,
  ArrowRight,
  Zap,
  Building2,
  Users,
  MessageSquare,
  Clock,
  Sparkles,
  Globe,
  Award,
} from "lucide-react";
import { toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    companySize: "",
    industry: "",
    currentTools: "",
    problem: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      items: [
        {
          label: "General inquiries, demos, or partnerships",
          email: "hello@innovatebooks.com",
        },
        {
          label: "Sales & pricing discussions",
          email: "sales@innovatebooks.com",
        },
        { label: "Support", email: "support@innovatebooks.com" },
      ],
    },
    {
      icon: MapPin,
      title: "Office",
      address: ["Innovate Books Private Limited", "Andhra Pradesh, India"],
      note: "Global-first product. Remote demos available.",
    },
  ];

  const processSteps = [
    { step: 1, text: "Understand your business stage" },
    { step: 2, text: "Understand your current stack" },
    { step: 3, text: "Identify gaps and risks" },
    { step: 4, text: "Show you how Innovate Books fits (or doesn't)" },
  ];

  const trustBadges = [
    { icon: Shield, text: "Enterprise-grade access control" },
    { icon: FileCheck, text: "Full audit trails" },
    { icon: Lock, text: "Data privacy by design" },
    { icon: Award, text: "Built for compliance from day one" },
  ];

  const useCases = [
    "Replacing fragmented tools",
    "Scaling operations",
    "Preparing for funding",
    "Bringing discipline into execution",
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <SharedNavigation />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Message Sent!
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Thank you for reaching out. Our team will review your message and
              get back to you within 24-48 hours.
            </p>
            <Link to="/">
              <button className="px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl hover:shadow-lg transition-all">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden bg-[#033F99]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-white font-semibold text-sm mb-8">
            <Phone className="h-4 w-4" />
            Contact Us
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"> // RESPONSIVE CHANGE
            Let's <span className="italic font-light">Talk.</span>
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Innovate Books is built for serious businesses. If you're exploring
            us, you're likely thinking about{" "}
            <span className="font-semibold text-white">scaling</span>,{" "}
            <span className="font-semibold text-white">control</span>, or{" "}
            <span className="font-semibold text-white">clarity</span>.
          </p>
          <p className="text-xl text-white font-bold mt-4">
            We're happy to talk.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 md:px-8"> // RESPONSIVE CHANGE
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12"> // RESPONSIVE CHANGE
            {/* Contact Form */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-lg"> // RESPONSIVE CHANGE
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Request a Demo
              </h2>
              <p className="text-slate-600 mb-6">
                Fill out the form and we'll tailor the conversation to your
                needs.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> // RESPONSIVE CHANGE
                  <div className="min-w-0"> // RESPONSIVE CHANGE
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> // RESPONSIVE CHANGE
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="min-w-0"> // RESPONSIVE CHANGE
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> // RESPONSIVE CHANGE
                      Work Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> // RESPONSIVE CHANGE
                  <div className="min-w-0"> // RESPONSIVE CHANGE
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> // RESPONSIVE CHANGE
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div className="min-w-0"> // RESPONSIVE CHANGE
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> // RESPONSIVE CHANGE
                      Company Size
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors bg-white"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> // RESPONSIVE CHANGE
                  <div className="min-w-0"> // RESPONSIVE CHANGE
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> // RESPONSIVE CHANGE
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors"
                      placeholder="e.g., Technology, Manufacturing"
                    />
                  </div>
                  <div className="min-w-0"> // RESPONSIVE CHANGE
                    <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> // RESPONSIVE CHANGE
                      Current Tools
                    </label>
                    <input
                      type="text"
                      name="currentTools"
                      value={formData.currentTools}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors"
                      placeholder="e.g., Tally, Salesforce, Zoho"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What problem are you trying to solve?
                  </label>
                  <select
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors bg-white"
                  >
                    <option value="">Select primary challenge</option>
                    <option value="fragmented-tools">
                      Replacing fragmented tools
                    </option>
                    <option value="scaling">Scaling operations</option>
                    <option value="funding">Preparing for funding</option>
                    <option value="discipline">
                      Bringing discipline to execution
                    </option>
                    <option value="visibility">
                      Better financial visibility
                    </option>
                    <option value="compliance">Compliance & governance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 break-words"> // RESPONSIVE CHANGE
                    How can we help? *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#033F99] transition-colors resize-none"
                    placeholder="Tell us more about your needs..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Request Demo
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info & Process */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  How You Can Reach Us
                </h2>

                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#033F99]/10 rounded-xl flex items-center justify-center">
                          <Icon className="h-5 w-5 text-[#033F99]" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {method.title}
                        </h3>
                      </div>

                      {method.items && (
                        <div className="space-y-2 ml-13">
                          {method.items.map((item, i) => (
                            <div key={i}>
                              <p className="text-sm text-slate-500">
                                {item.label}:
                              </p>
                              <a
                                href={`mailto:${item.email}`}
                                className="text-[#033F99] font-semibold hover:underline"
                              >
                                {item.email}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {method.address && (
                        <div className="ml-13">
                          {method.address.map((line, i) => (
                            <p
                              key={i}
                              className={
                                i === 0
                                  ? "font-semibold text-slate-900"
                                  : "text-slate-600"
                              }
                            >
                              {line}
                            </p>
                          ))}
                          <p className="text-sm text-slate-500 mt-2 italic">
                            {method.note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Our Process */}
              <div className="bg-gradient-to-br from-[#033F99]/5 to-purple-500/5 rounded-3xl border border-[#033F99]/20 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  What Happens When You Contact Us
                </h2>
                <p className="text-slate-600 mb-6">
                  We don't push demos blindly. Our process:
                </p>

                <div className="space-y-4">
                  {processSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#033F99] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {step.step}
                        </span>
                      </div>
                      <p className="text-slate-700">{step.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-600 italic">
                    "If we're not the right fit, we'll tell you."
                  </p>
                </div>
              </div>

              {/* Security & Trust */}
              <div className="bg-slate-900 rounded-3xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">Security & Trust</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"> // RESPONSIVE CHANGE
                  {trustBadges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-white/90 text-sm">
                          {badge.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-white/70 text-sm">
                  We take trust seriously — because our customers run serious
                  businesses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#033F99] to-[#033F99]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Let's Build Clarity Into Your Business
          </h2>
          <p className="text-xl text-white/80 mb-8">Whether you are:</p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {useCases.map((useCase, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white font-medium"
              >
                {useCase}
              </span>
            ))}
          </div>

          <p className="text-xl text-white/90 mb-8">
            Innovate Books is designed to support you.
          </p>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
            <MessageSquare className="h-12 w-12 text-white mx-auto mb-4" />
            <p className="text-2xl font-bold text-white mb-2">
              Reach out. Let's talk.
            </p>
            <a
              href="mailto:hello@innovatebooks.com"
              className="text-white/80 hover:text-white transition-colors"
            >
              hello@innovatebooks.com
            </a>
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

export default ContactPage;
