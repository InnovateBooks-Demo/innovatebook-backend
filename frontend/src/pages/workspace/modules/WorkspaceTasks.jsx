import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Flag,
  MoreVertical,
  ChevronDown,
  X,
  FileText,
  Upload,
  MessageSquare,
  Check,
  Loader2,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkspaceTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [contexts, setContexts] = useState([]);
  const [users, setUsers] = useState([]);

  const [newTask, setNewTask] = useState({
    context_id: "",
    task_type: "action",
    title: "",
    description: "",
    assigned_to_user: "",
    priority: "medium",
    due_at: "",
    visibility_scope: "internal_only",
  });

  useEffect(() => {
    fetchTasks();
    fetchContexts();
    fetchUsers();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_URL}/api/workspace/tasks?`;
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (priorityFilter !== "all") url += `priority=${priorityFilter}&`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContexts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // Seed data first if needed
      await fetch(`${API_URL}/api/workspace/seed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error fetching contexts:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/chat/users/search?q=`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const createTask = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/workspace/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTask,
          due_at: newTask.due_at
            ? new Date(newTask.due_at).toISOString()
            : null,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewTask({
          context_id: "",
          task_type: "action",
          title: "",
          description: "",
          assigned_to_user: "",
          priority: "medium",
          due_at: "",
          visibility_scope: "internal_only",
        });
        fetchTasks();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const completeTask = async (taskId) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/api/workspace/tasks/${taskId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "blocked":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case "action":
        return <Check className="h-4 w-4" />;
      case "review":
        return <FileText className="h-4 w-4" />;
      case "upload":
        return <Upload className="h-4 w-4" />;
      case "confirm":
        return <CheckCircle className="h-4 w-4" />;
      case "respond":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === "open").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm">
            Manage and track your workspace tasks
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#3A4E63] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              <p className="text-xs text-gray-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgress}
              </p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No tasks found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-[#3A4E63] hover:underline"
              >
                Create your first task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.task_id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() =>
                      task.status !== "completed" && completeTask(task.task_id)
                    }
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === "completed"
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-[#3A4E63]"
                    }`}
                  >
                    {task.status === "completed" && (
                      <Check className="h-3 w-3" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`${task.status === "completed" ? "line-through text-gray-400" : "text-gray-900"} font-medium`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        {getTaskTypeIcon(task.task_type)}
                        {task.task_type}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}
                      >
                        <Flag className="h-3 w-3" />
                        {task.priority}
                      </span>
                      {task.due_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_at).toLocaleDateString()}
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

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Task
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type
                  </label>
                  <select
                    value={newTask.task_type}
                    onChange={(e) =>
                      setNewTask({ ...newTask, task_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    <option value="action">Action</option>
                    <option value="review">Review</option>
                    <option value="upload">Upload</option>
                    <option value="confirm">Confirm</option>
                    <option value="respond">Respond</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newTask.due_at}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_at: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Context ID *
                </label>
                <input
                  type="text"
                  value={newTask.context_id}
                  onChange={(e) =>
                    setNewTask({ ...newTask, context_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="e.g., CTX-XXXXXXXX or enter deal/project ID"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={!newTask.title || !newTask.context_id}
                className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#3A4E63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceTasks;
