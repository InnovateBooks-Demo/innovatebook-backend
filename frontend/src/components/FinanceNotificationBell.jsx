import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useFinanceNotifications } from "../context/FinanceNotificationContext";
import { useNavigate } from "react-router-dom";

const FinanceNotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    connected,
    markAllAsRead,
    clearNotification,
  } = useFinanceNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type, severity) => {
    if (type === "overdue_receivable" || severity === "critical") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (type === "payment_due" || severity === "warning") {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
    if (type === "billing_approved" || type === "period_closed") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const getNotificationBg = (type, severity) => {
    if (type === "overdue_receivable" || severity === "critical")
      return "bg-red-50 border-red-100";
    if (type === "payment_due" || severity === "warning")
      return "bg-amber-50 border-amber-100";
    if (type === "billing_approved" || type === "period_closed")
      return "bg-green-50 border-green-100";
    return "bg-[rgba(3,63,153,0.08)] border-blue-100";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        data-testid="finance-notification-bell"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Finance Alerts</h3>
              <span
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {connected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {connected ? "Live" : "Offline"}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#033F99] hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <div
                    key={`item-${index}`}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationBg(notification.type, notification.severity)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(
                          notification.type,
                          notification.severity,
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title ||
                            notification.type
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(
                            notification.timestamp || notification.created_at,
                          )}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(index);
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => {
                navigate("/ib-finance");
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-[#033F99] hover:text-blue-800 font-medium"
            >
              View Finance Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceNotificationBell;
