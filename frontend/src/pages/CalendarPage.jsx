import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  FileText,
  Folder,
  CheckSquare,
  Target,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";
import { authService } from "../utils/auth";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const eventTypeColors = {
  meeting: "bg-blue-500",
  task: "bg-green-500",
  deadline: "bg-red-500",
  milestone: "bg-purple-500",
  reminder: "bg-amber-500",
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month"); // month, week, day
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchSummary();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const token = authService.getToken();
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const response = await fetch(
        `${API_URL}/api/calendar/events?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/calendar/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/calendar/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
      if (response.ok) {
        toast.success("Event created");
        fetchEvents();
        setShowCreateModal(false);
      }
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.start_time?.startsWith(dateStr));
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = getDaysInMonth();
  const today = new Date();

  return (
    <div className="min-h-screen bg-slate-50" data-testid="calendar-page">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3A4E63] to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
                <p className="text-sm text-slate-500">
                  Tasks, meetings, deadlines, and milestones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Today</span>
                  <span className="text-lg font-bold text-slate-900">
                    {summary?.today || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">This Week</span>
                  <span className="text-lg font-bold text-slate-900">
                    {summary?.this_week || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Overdue Tasks</span>
                  <span className="text-lg font-bold text-red-600">
                    {summary?.overdue_tasks || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">By Type</h3>
              <div className="space-y-2">
                {Object.entries(summary?.by_type || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${eventTypeColors[type] || "bg-slate-400"}`}
                    />
                    <span className="text-sm text-slate-600 capitalize flex-1">
                      {type}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-slate-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day &&
                  today.getDate() === day &&
                  today.getMonth() === currentDate.getMonth() &&
                  today.getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={`item-${index}`}
                    className={`min-h-[100px] p-2 border border-slate-100 rounded-lg ${
                      day ? "hover:bg-slate-50 cursor-pointer" : ""
                    } ${isToday ? "bg-blue-50 border-blue-200" : ""}`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <span
                          className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-slate-700"}`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={event.event_id || i}
                              className={`text-xs px-1.5 py-0.5 rounded truncate text-white ${eventTypeColors[event.event_type] || "bg-slate-400"}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{dayEvents.length - 3} more
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createEvent}
          selectedDate={selectedDate}
          currentDate={currentDate}
        />
      )}
    </div>
  );
};

const CreateEventModal = ({ onClose, onCreate, selectedDate, currentDate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: selectedDate
      ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}T09:00`
      : "",
    end_time: "",
    event_type: "meeting",
    all_day: false,
    location: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time) {
      toast.error("Please fill in required fields");
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Create Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              placeholder="Event title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Event Type
            </label>
            <select
              value={formData.event_type}
              onChange={(e) =>
                setFormData({ ...formData, event_type: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
            >
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="deadline">Deadline</option>
              <option value="milestone">Milestone</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
              placeholder="Event details..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022a6b] transition-colors"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarPage;
