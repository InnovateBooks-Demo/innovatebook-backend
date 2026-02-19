import React from "react";
import {
  Activity,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
  Bell,
  Calendar,
  FileText,
  Target,
} from "lucide-react";

const WorkspaceDashboardPremium = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Welcome to Your Workspace
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Your central hub for collaboration and productivity
            </p>
          </div>
        </div>

        {/* Premium KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Tasks */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl hover:shadow-2xl hover:border-[#033F99] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#033F99]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
                Active Tasks
              </p>
              <p className="text-4xl font-black text-[#033F99]">24</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200/50 shadow-xl hover:shadow-2xl hover:border-emerald-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Pending Approvals
              </p>
              <p className="text-4xl font-black text-emerald-900">8</p>
            </div>
          </div>

          {/* Due This Week */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-amber-200/50 shadow-xl hover:shadow-2xl hover:border-amber-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-1">
                Due This Week
              </p>
              <p className="text-4xl font-black text-amber-900">12</p>
            </div>
          </div>

          {/* Unread Messages */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl hover:border-purple-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-1">
                Unread Messages
              </p>
              <p className="text-4xl font-black text-purple-900">15</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-[#033F99]/20 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#033F99]/5 to-[#033F99]/10 border-b-2 border-[#033F99]/20">
              <h2 className="text-2xl font-bold text-[#033F99]">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    icon: FileText,
                    color: "from-blue-600 to-blue-700",
                    text: "New document shared: Q4 Revenue Report",
                    time: "2 hours ago",
                  },
                  {
                    icon: CheckCircle,
                    color: "from-emerald-600 to-emerald-700",
                    text: "Task completed: Client onboarding process",
                    time: "4 hours ago",
                  },
                  {
                    icon: Bell,
                    color: "from-amber-600 to-amber-700",
                    text: "Reminder: Team meeting at 3 PM",
                    time: "5 hours ago",
                  },
                  {
                    icon: MessageSquare,
                    color: "from-purple-600 to-purple-700",
                    text: "New message from Sarah Johnson",
                    time: "1 day ago",
                  },
                  {
                    icon: Calendar,
                    color: "from-pink-600 to-pink-700",
                    text: "Event scheduled: Product launch webinar",
                    time: "2 days ago",
                  },
                ].map((activity, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-[#033F99]/5 transition-all duration-300"
                  >
                    <div
                      className={`p-2 bg-gradient-to-br ${activity.color} rounded-xl shadow-md`}
                    >
                      <activity.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#033F99]">
                        {activity.text}
                      </p>
                      <p className="text-sm text-[#033F99]/60 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-[#033F99]/20 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#033F99]/5 to-[#033F99]/10 border-b-2 border-[#033F99]/20">
              <h2 className="text-2xl font-bold text-[#033F99]">
                Quick Actions
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  {
                    icon: FileText,
                    text: "Create Document",
                    color: "from-[#033F99] to-[#033F99]",
                  },
                  {
                    icon: Users,
                    text: "Schedule Meeting",
                    color: "from-emerald-600 to-emerald-700",
                  },
                  {
                    icon: Target,
                    text: "New Task",
                    color: "from-amber-600 to-amber-700",
                  },
                  {
                    icon: MessageSquare,
                    text: "Send Message",
                    color: "from-purple-600 to-purple-700",
                  },
                  {
                    icon: TrendingUp,
                    text: "View Reports",
                    color: "from-pink-600 to-pink-700",
                  },
                ].map((action, index) => (
                  <button
                    key={`item-${index}`}
                    className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${action.color} text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="font-bold">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboardPremium;
