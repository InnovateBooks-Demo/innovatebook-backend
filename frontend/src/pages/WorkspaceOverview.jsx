import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Hash,
  ListTodo,
  CheckCircle,
  Users,
  Bell,
  Calendar,
  Mail,
  Workflow,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
  Zap,
  Target,
  Activity,
  Shield,
  FileText,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const WorkspaceOverview = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const modules = [
    {
      id: "chat",
      name: "Chat",
      icon: MessageSquare,
      tagline: "Real-Time Team Communication",
      description:
        "Instant messaging for your entire organization. Direct messages, group conversations, and contextual discussions linked to deals, projects, and tasks.",
      features: [
        "Direct messaging between team members",
        "Group conversations for projects",
        "File sharing and attachments",
        "Message threading and reactions",
        "Search across all conversations",
        "Integration with deals and tasks",
      ],
      benefits: [
        "Reduce email by 70%",
        "Faster decision making",
        "Complete audit trail",
      ],
    },
    {
      id: "channels",
      name: "Channels",
      icon: Hash,
      tagline: "Organized Team Collaboration",
      description:
        "Topic-based channels for departments, projects, and initiatives. Keep discussions organized and accessible to the right people.",
      features: [
        "Public and private channels",
        "Department-specific spaces",
        "Project collaboration rooms",
        "Announcements and broadcasts",
        "Channel-level permissions",
        "Pinned messages and bookmarks",
      ],
      benefits: [
        "Structured communication",
        "Knowledge preservation",
        "Team alignment",
      ],
    },
    {
      id: "tasks",
      name: "Tasks",
      icon: ListTodo,
      tagline: "Unified Task Management",
      description:
        "Centralized task management that aggregates work from across all modules. Track, prioritize, and complete work efficiently.",
      features: [
        "Personal and team task lists",
        "Auto-generated tasks from workflows",
        "Priority and due date management",
        "Task assignments and delegation",
        "Progress tracking and status",
        "Linked to deals, projects, and approvals",
      ],
      benefits: [
        "Nothing falls through cracks",
        "Clear accountability",
        "Deadline visibility",
      ],
    },
    {
      id: "approvals",
      name: "Approvals",
      icon: CheckCircle,
      tagline: "Streamlined Decision Making",
      description:
        "Centralized approval queue for all business decisions. Review deals, expenses, leave requests, and more from one place.",
      features: [
        "Unified approval inbox",
        "Multi-level approval chains",
        "Mobile approval capability",
        "Audit trail for all decisions",
        "Delegation and escalation",
        "SLA tracking and reminders",
      ],
      benefits: ["Faster approvals", "No bottlenecks", "Complete compliance"],
    },
  ];

  const additionalFeatures = [
    {
      icon: Bell,
      title: "Notification Center",
      description: "Smart notifications that surface what matters most",
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Sync with your calendar for meetings and deadlines",
    },
    {
      icon: Mail,
      title: "Email Campaigns",
      description: "Create and manage email campaigns with templates",
    },
    {
      icon: Workflow,
      title: "Workflow Automation",
      description: "Build automated workflows with visual editor",
    },
  ];

  const stats = [
    { metric: "70%", label: "Less Email" },
    { metric: "50%", label: "Faster Approvals" },
    { metric: "100%", label: "Task Visibility" },
    { metric: "24/7", label: "Collaboration" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      {/* Hero Section - Full Color */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden bg-[#033F99]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Users className="h-6 w-6 text-white" />
              <span className="text-white font-bold text-lg">Workspace</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
              Your Team's
              <br />
              <span className="font-light italic">Central Command.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              All your communication, tasks, and approvals in one unified
              workspace. Chat, collaborate, and get things done without
              switching between tools.
            </p>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
              <Link to="/auth/signup">
                <button className="bg-white text-[#033F99] font-bold px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link to="/contact">
                <button className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-10 py-5 rounded-xl transition-all duration-300 text-lg">
                  Book a Demo
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <p className="text-3xl font-bold text-white mb-1">
                    {stat.metric}
                  </p>
                  <p className="text-sm text-white/80 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              Core Workspace Modules
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything your team needs to communicate, collaborate, and
              execute
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200 hover:border-[#0558CC] hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {module.name}
                      </h3>
                      <p className="text-[#033F99] font-semibold">
                        {module.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-6">{module.description}</p>

                  <div className="mb-6">
                    <p className="font-semibold text-slate-900 mb-3">
                      Key Features:
                    </p>
                    <ul className="grid grid-cols-2 gap-2">
                      {module.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <CheckCircle className="h-4 w-4 text-[#033F99] flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {module.benefits.map((benefit, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#EBF3FC] text-[#033F99] text-sm font-medium rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              More Productivity Tools
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Extended capabilities to boost your team's efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#0558CC] hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 bg-[#EBF3FC] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-[#033F99]" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
              How Workspace Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how all the pieces come together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Communicate",
                description:
                  "Start conversations in Chat or Channels. Discuss deals, projects, and decisions in context.",
                icon: MessageSquare,
              },
              {
                step: "2",
                title: "Execute",
                description:
                  "Tasks are automatically generated from workflows. Track progress and meet deadlines.",
                icon: ListTodo,
              },
              {
                step: "3",
                title: "Decide",
                description:
                  "Approvals flow to the right people. Make decisions fast with full context.",
                icon: CheckCircle,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                      {item.step}
                    </div>
                    <Icon className="h-10 w-10 text-[#033F99] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-[#033F99]" />
                  )}
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
            Ready to Transform Your Workspace?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of teams using our unified workspace to collaborate
            better
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

export default WorkspaceOverview;
