import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Bell,
  Hash,
  FileText,
  ThumbsUp,
  ArrowRight,
  Loader2,
  Plus,
} from "lucide-react";
import ProductTour, {
  TourTrigger,
  useTour,
} from "../../components/marketing/ProductTour";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkspaceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product Tour
  const { isTourActive, startTour, endTour, checkTourCompleted } =
    useTour("workspace-tour");
  const [showTourPrompt, setShowTourPrompt] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();

    // Check if user has seen the tour
    const tourCompleted = checkTourCompleted();
    if (!tourCompleted) {
      // Show tour prompt after a short delay
      setTimeout(() => setShowTourPrompt(true), 1500);
    }
  }, [checkTourCompleted]);

  const fetchWorkspaceData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Seed data first
      await fetch(`${API_URL}/api/workspace/seed`, { headers });

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/workspace/stats`, {
        headers,
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent tasks
      const tasksRes = await fetch(
        `${API_URL}/api/workspace/tasks?status=open`,
        { headers },
      );
      const tasksData = await tasksRes.json();
      setTasks(tasksData.slice(0, 5));

      // Fetch pending approvals
      const approvalsRes = await fetch(
        `${API_URL}/api/workspace/approvals?pending_for_me=true`,
        { headers },
      );
      const approvalsData = await approvalsRes.json();
      setApprovals(approvalsData.slice(0, 5));

      // Fetch notifications
      const notifsRes = await fetch(
        `${API_URL}/api/workspace/notifications?unread_only=true`,
        { headers },
      );
      const notifsData = await notifsRes.json();
      setNotifications(notifsData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching workspace data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getNotificationIcon = (eventType) => {
    switch (eventType) {
      case "task_assigned":
        return <FileText className="h-4 w-4 text-orange-500" />;
      case "approval_requested":
        return <ThumbsUp className="h-4 w-4 text-yellow-500" />;
      case "sla_breach":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  // Custom tour steps for workspace
  const workspaceTourSteps = [
    {
      target: '[data-tour="workspace-stats"]',
      title: "Your Dashboard at a Glance",
      content:
        "Monitor your active tasks, pending approvals, and notifications in real-time. Click any stat to dive deeper.",
      position: "bottom",
    },
    {
      target: '[data-tour="workspace-tasks"]',
      title: "Task Management",
      content:
        "View and manage your assigned tasks. Track priorities, due dates, and progress all in one place.",
      position: "right",
    },
    {
      target: '[data-tour="workspace-approvals"]',
      title: "Approval Workflows",
      content:
        "Review and approve requests from your team. Never miss an important approval with real-time notifications.",
      position: "left",
    },
    {
      target: '[data-tour="workspace-quick-actions"]',
      title: "Quick Actions",
      content:
        "Create tasks, start chats, and access common features with just one click. Your productivity hub!",
      position: "top",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Product Tour */}
      <ProductTour
        isActive={isTourActive}
        onComplete={() => {
          endTour();
          setShowTourPrompt(false);
        }}
        onSkip={() => {
          endTour();
          setShowTourPrompt(false);
        }}
        steps={workspaceTourSteps}
        tourId="workspace-tour"
      />

      {/* Tour Prompt Modal */}
      {showTourPrompt && !isTourActive && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scaleIn">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3A4E63] to-[#3A4E63] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Welcome to Innovate Books!
            </h2>
            <p className="text-slate-600 text-center mb-6">
              Take a quick tour to learn how to make the most of your workspace.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTourPrompt(false)}
                className="flex-1 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => {
                  setShowTourPrompt(false);
                  startTour();
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3A4E63] to-[#3A4E63] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Start Tour
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to Your Workspace
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your tasks, approvals, and communications in one place
            </p>
          </div>
          <TourTrigger onClick={startTour} />
        </div>

        {/* Quick Stats */}
        <div
          data-tour="workspace-stats"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
        >
          <div
            onClick={() => navigate("/workspace/tasks")}
            className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3A4E63] rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.active_tasks || 0}
                </p>
                <p className="text-xs text-gray-500">Active Tasks</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/workspace/approvals")}
            className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pending_approvals || 0}
                </p>
                <p className="text-xs text-gray-500">Pending Approvals</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/workspace/tasks")}
            className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.due_this_week || 0}
                </p>
                <p className="text-xs text-gray-500">Due This Week</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/workspace/notifications")}
            className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.unread_messages || 0}
                </p>
                <p className="text-xs text-gray-500">Unread</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/workspace/chats")}
            className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.open_chats || 0}
                </p>
                <p className="text-xs text-gray-500">Open Chats</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/workspace/channels")}
            className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgba(3,63,153,0.08)]0 rounded-lg flex items-center justify-center">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.active_channels || 0}
                </p>
                <p className="text-xs text-gray-500">Channels</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div
            data-tour="workspace-tasks"
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">My Tasks</h2>
              <button
                onClick={() => navigate("/workspace/tasks")}
                className="text-[#3A4E63] text-sm hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No open tasks</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#3A4E63] mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                          {task.due_at && (
                            <span className="text-xs text-gray-400">
                              Due: {new Date(task.due_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Approvals Section */}
          <div
            data-tour="workspace-approvals"
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
              <button
                onClick={() => navigate("/workspace/approvals")}
                className="text-[#3A4E63] text-sm hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {approvals.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No pending approvals</p>
                </div>
              ) : (
                approvals.map((approval) => (
                  <div
                    key={approval.approval_id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <ThumbsUp className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {approval.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {approval.approval_type.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Recent Notifications
              </h2>
              <button
                onClick={() => navigate("/workspace/notifications")}
                className="text-[#3A4E63] text-sm hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">All caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        {getNotificationIcon(notification.event_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          data-tour="workspace-quick-actions"
          className="mt-6 bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/workspace/tasks")}
              className="flex items-center gap-3 p-4 bg-[#3A4E63] text-white rounded-lg hover:bg-[#3A4E63] transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium text-sm">Create Task</span>
            </button>
            <button
              onClick={() => navigate("/workspace/channels")}
              className="flex items-center gap-3 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Hash className="h-5 w-5" />
              <span className="font-medium text-sm">Open Channels</span>
            </button>
            <button
              onClick={() => navigate("/workspace/chats")}
              className="flex items-center gap-3 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium text-sm">Start Chat</span>
            </button>
            <button
              onClick={() => navigate("/workspace/approvals")}
              className="flex items-center gap-3 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium text-sm">View Approvals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
