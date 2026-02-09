import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Square,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TimeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authService.getToken();
      const today = new Date().toISOString().split("T")[0];

      const [attRes, entriesRes, sheetsRes] = await Promise.all([
        fetch(`${API_URL}/api/ib-workforce/attendance?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-workforce/time-entries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ib-workforce/timesheets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (attRes.ok) {
        const data = await attRes.json();
        setAttendance(data.data || []);
        // Check if current user has checked in
        const user = authService.getUser();
        const userAtt = (data.data || []).find(
          (a) => a.person_id === user?.user_id,
        );
        if (userAtt && !userAtt.check_out_time) {
          setCheckedIn(true);
        }
      }
      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setTimeEntries(data.data || []);
      }
      if (sheetsRes.ok) {
        const data = await sheetsRes.json();
        setTimesheets(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch time data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/attendance/check-in`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (response.ok) {
        toast.success("Checked in successfully");
        setCheckedIn(true);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to check in");
      }
    } catch (error) {
      toast.error("Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-workforce/attendance/check-out`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (response.ok) {
        toast.success("Checked out successfully");
        setCheckedIn(false);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to check out");
      }
    } catch (error) {
      toast.error("Failed to check out");
    }
  };

  const stats = [
    {
      label: "Today Attendance",
      value: attendance.length,
      icon: Users,
      color: "text-[#033F99]",
    },
    {
      label: "Time Entries",
      value: timeEntries.length,
      icon: Clock,
      color: "text-emerald-600",
    },
    {
      label: "Pending Timesheets",
      value: timesheets.filter((t) => t.status === "submitted").length,
      icon: FileText,
      color: "text-amber-600",
    },
    {
      label: "Approved",
      value: timesheets.filter((t) => t.status === "approved").length,
      icon: CheckCircle,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="time-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Time Management
                </h1>
                <p className="text-sm text-gray-500">
                  Attendance, time tracking & timesheets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {checkedIn ? (
                <button
                  onClick={handleCheckOut}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  data-testid="checkout-btn"
                >
                  <Square className="h-4 w-4" />
                  Check Out
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  data-testid="checkin-btn"
                >
                  <Play className="h-4 w-4" />
                  Check In
                </button>
              )}
              <button
                onClick={() => toast.info("Log time feature coming soon")}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] transition-colors"
                data-testid="log-time-btn"
              >
                <Plus className="h-4 w-4" />
                Log Time
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Today's Attendance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Today's Attendance
              </h3>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : attendance.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No attendance records for today
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {attendance.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${att.check_out_time ? "bg-gray-400" : "bg-emerald-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {att.person_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          In:{" "}
                          {att.check_in_time?.split("T")[1]?.substring(0, 5) ||
                            "-"}
                          {att.check_out_time &&
                            ` • Out: ${att.check_out_time.split("T")[1]?.substring(0, 5)}`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        att.attendance_status === "present"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {att.attendance_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Time Entries */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Time Entries
              </h3>
              <button className="text-sm text-[#3A4E63] hover:underline">
                View All
              </button>
            </div>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : timeEntries.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No time entries yet. Start logging your work time.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {timeEntries.slice(0, 10).map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.reference_name || entry.work_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.date} • {entry.hours}h
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : entry.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timesheets */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Timesheets</h3>
            <button
              onClick={() => toast.info("Create timesheet coming soon")}
              className="text-sm text-[#3A4E63] hover:underline flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Create Timesheet
            </button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : timesheets.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No timesheets found. Create a timesheet to submit your time
              entries for approval.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Period
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Person
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Total Hours
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timesheets.slice(0, 5).map((ts, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {ts.period}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ts.person_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ts.total_hours}h
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ts.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : ts.status === "submitted"
                              ? "bg-blue-100 text-blue-700"
                              : ts.status === "locked"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ts.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ts.status === "submitted" && (
                        <button className="text-sm text-[#3A4E63] hover:underline">
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeDashboard;
