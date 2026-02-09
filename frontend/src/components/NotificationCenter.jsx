import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Zap,
  FileText,
  ThumbsUp,
  Clock,
  User,
} from "lucide-react";
import { authService } from "../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const typeIcons = {
  signal: Zap,
  task: FileText,
  approval: ThumbsUp,
  alert: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const severityColors = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  success: "bg-green-100 text-green-700 border-green-200",
};

const NotificationCenter = ({ isOpen, onClose, onNotificationCountChange }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      const token = authService.getToken();
      const unreadOnly = filter === "unread";
      const response = await fetch(
        `${API_URL}/api/workspace/notifications?unread_only=${unreadOnly}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data || []);
        const unreadCount = data.filter((n) => !n.read).length;
        onNotificationCountChange?.(unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = authService.getToken();
      await fetch(
        `${API_URL}/api/workspace/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(
        notifications.map((n) =>
          n.notification_id === notificationId ? { ...n, read: true } : n,
        ),
      );
      const unreadCount = notifications.filter(
        (n) => !n.read && n.notification_id !== notificationId,
      ).length;
      onNotificationCountChange?.(unreadCount);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = authService.getToken();
      await fetch(`${API_URL}/api/workspace/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      onNotificationCountChange?.(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = authService.getToken();
      await fetch(`${API_URL}/api/workspace/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = notifications.filter(
        (n) => n.notification_id !== notificationId,
      );
      setNotifications(updated);
      const unreadCount = updated.filter((n) => !n.read).length;
      onNotificationCountChange?.(unreadCount);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.notification_id);
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
      data-testid="notification-center"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === "all"
                ? "bg-[#3A4E63] text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === "unread"
                ? "bg-[#3A4E63] text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-[#3A4E63] rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => {
              const Icon = typeIcons[notification.event_type] || Bell;
              const severity = notification.severity || "info";

              return (
                <div
                  key={notification.notification_id}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severityColors[severity]}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${!notification.read ? "font-medium text-slate-900" : "text-slate-700"}`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#3A4E63] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {formatTime(notification.created_at)}
                        </span>
                        {notification.source_module && (
                          <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                            {notification.source_module}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.notification_id);
                      }}
                      className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => {
            navigate("/workspace/notifications");
            onClose();
          }}
          className="w-full text-center text-sm text-[#3A4E63] hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

// Bell icon with badge for header
export const NotificationBell = ({ onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      data-testid="notification-bell"
    >
      <Bell className="w-5 h-5 text-slate-600" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
};

export default NotificationCenter;
