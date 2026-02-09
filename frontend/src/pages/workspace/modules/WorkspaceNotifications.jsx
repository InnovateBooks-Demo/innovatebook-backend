import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  FileText,
  CheckSquare,
  Trash2,
  Check,
  Loader2,
  Filter,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkspaceNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const url =
        filter === "unread"
          ? `${API_URL}/api/workspace/notifications?unread_only=true`
          : `${API_URL}/api/workspace/notifications`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/workspace/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/api/workspace/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/api/workspace/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "new_chat_message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "channel_mention":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "task_assigned":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "task_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "approval_requested":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "approval_decision":
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case "sla_breach":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "escalation":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case "new_chat_message":
        return "bg-[rgba(3,63,153,0.08)] border-[rgba(3,63,153,0.25)]";
      case "channel_mention":
        return "bg-purple-50 border-purple-200";
      case "task_assigned":
        return "bg-orange-50 border-orange-200";
      case "task_completed":
        return "bg-green-50 border-green-200";
      case "approval_requested":
        return "bg-yellow-50 border-yellow-200";
      case "approval_decision":
        return "bg-green-50 border-green-200";
      case "sla_breach":
        return "bg-red-50 border-red-200";
      case "escalation":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-[#3A4E63] hover:bg-[#3A4E63]/10 rounded-lg"
            >
              <Check className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                  !notification.read_status ? "bg-[rgba(3,63,153,0.08)]/30" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventColor(notification.event_type)}`}
                >
                  {getEventIcon(notification.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`font-medium ${!notification.read_status ? "text-gray-900" : "text-gray-700"}`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read_status && (
                        <button
                          onClick={() =>
                            markAsRead(notification.notification_id)
                          }
                          className="p-1.5 text-gray-400 hover:text-[#3A4E63] hover:bg-[#3A4E63]/10 rounded"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          deleteNotification(notification.notification_id)
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    {notification.context_id && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {notification.context_id}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                      {notification.event_type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceNotifications;
