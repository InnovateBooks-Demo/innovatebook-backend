import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Bell,
  Hash,
  FileText,
  ThumbsUp,
  ArrowRight,
  Loader2,
  Plus,
} from "lucide-react";
// import ProductTour, { TourTrigger, useTour } from "../../components/marketing";
import { ProductTour, TourTrigger, useTour } from "../../components/marketing";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const safeJson = async (res) => {
  // Handles empty bodies / non-json responses gracefully
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const WorkspaceDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product Tour
  const { isTourActive, startTour, endTour, checkTourCompleted } = useTour("workspace-tour");
  const [showTourPrompt, setShowTourPrompt] = useState(false);

  const fetchWorkspaceData = useCallback(async (signal) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Adjust this path based on your app
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      setLoading(true);

      // Seed data first (optional)
      // If you want to avoid seeding every time:
      // const seeded = localStorage.getItem("workspace_seeded");
      // if (!seeded) { ...; localStorage.setItem("workspace_seeded","1"); }

      const seedRes = await fetch(`${API_URL}/api/workspace/seed`, { headers, signal });
      if (seedRes.status === 401) {
        navigate("/login");
        return;
      }

      const statsRes = await fetch(`${API_URL}/api/workspace/stats`, { headers, signal });
      if (!statsRes.ok) throw new Error(`Stats failed: ${statsRes.status}`);
      const statsData = await safeJson(statsRes);
      setStats(statsData);

      const tasksRes = await fetch(`${API_URL}/api/workspace/tasks?status=open`, { headers, signal });
      if (!tasksRes.ok) throw new Error(`Tasks failed: ${tasksRes.status}`);
      const tasksData = (await safeJson(tasksRes)) || [];
      setTasks(Array.isArray(tasksData) ? tasksData.slice(0, 5) : []);

      const approvalsRes = await fetch(
        `${API_URL}/api/workspace/approvals?pending_for_me=true`,
        { headers, signal }
      );
      if (!approvalsRes.ok) throw new Error(`Approvals failed: ${approvalsRes.status}`);
      const approvalsData = (await safeJson(approvalsRes)) || [];
      setApprovals(Array.isArray(approvalsData) ? approvalsData.slice(0, 5) : []);

      const notifsRes = await fetch(
        `${API_URL}/api/workspace/notifications?unread_only=true`,
        { headers, signal }
      );
      if (!notifsRes.ok) throw new Error(`Notifications failed: ${notifsRes.status}`);
      const notifsData = (await safeJson(notifsRes)) || [];
      setNotifications(Array.isArray(notifsData) ? notifsData.slice(0, 5) : []);
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Error fetching workspace data:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();

    // Load dashboard data
    fetchWorkspaceData(controller.signal);

    // Tour prompt logic
    let t = null;
    const tourCompleted = checkTourCompleted();
    if (!tourCompleted) {
      t = setTimeout(() => setShowTourPrompt(true), 1500);
    }

    return () => {
      controller.abort();
      if (t) clearTimeout(t);
    };
  }, [fetchWorkspaceData, checkTourCompleted]);

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
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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

      {showTourPrompt && !isTourActive && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scaleIn">
            <div className="w-16 h-16 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl flex items-center justify-center mx-auto mb-6">
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Start Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Rest of your JSX stays the same from here --- */}
      {/* (Keep your existing UI blocks below unchanged) */}

      <div className="max-w-7xl mx-auto">
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
              <div className="w-10 h-10 bg-[#033F99] rounded-lg flex items-center justify-center">
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
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
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

        {/* Main grid + quick actions remains same… */}
        {/* Keep your existing sections below unchanged */}
      </div>
    </div>
  );
};

export default WorkspaceDashboard;