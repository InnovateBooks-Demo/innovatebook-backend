import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckSquare, ArrowLeft, Search, Play, Pause, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TasksList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('list');

  const isMyTasks = location.pathname === '/operations/tasks/my';

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, isMyTasks]);

  const fetchTasks = async () => {
    try {
      const token = authService.getToken();
      const endpoint = isMyTasks ? '/api/operations/tasks/my' : '/api/operations/tasks';
      const url = statusFilter === 'all'
        ? `${API_URL}${endpoint}`
        : `${API_URL}${endpoint}?status=${statusFilter}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus, reason = null) => {
    try {
      const token = authService.getToken();
      const body = { status: newStatus };
      if (reason) body.reason = reason;
      
      const response = await fetch(`${API_URL}/api/operations/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        toast.success(`Task ${newStatus}`);
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      created: 'bg-gray-100 text-gray-700',
      ready: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-indigo-100 text-indigo-700',
      blocked: 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-500'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return styles[priority] || 'bg-gray-100 text-gray-700';
  };

  const filteredTasks = tasks.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.task_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group tasks by status for Kanban view
  const kanbanColumns = ['ready', 'in_progress', 'blocked', 'completed'];
  const groupedTasks = kanbanColumns.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(t => t.status === status);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50" data-testid="tasks-list">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/operations')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Operations → Tasks</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckSquare className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{isMyTasks ? 'My Tasks' : 'All Tasks'}</h1>
                <p className="text-sm text-gray-500 mt-1">Atomic execution & workflow orchestration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/operations/tasks')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${!isMyTasks ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                All Tasks
              </button>
              <button
                onClick={() => navigate('/operations/tasks/my')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isMyTasks ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                My Tasks
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 text-sm ${view === 'kanban' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600'}`}
            >
              Kanban
            </button>
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">SLA Impact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map(task => (
                  <tr key={task.task_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.task_id} • {task.task_type}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{task.project_id}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {task.sla_impact !== 'none' && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.sla_impact === 'hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{task.sla_impact}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{task.due_date}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(task.status)}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {task.status === 'ready' && (
                          <button
                            onClick={() => updateTaskStatus(task.task_id, 'in_progress')}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Start Task"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => updateTaskStatus(task.task_id, 'completed')}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Complete"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Block reason:');
                                if (reason) updateTaskStatus(task.task_id, 'blocked', reason);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Block"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {task.status === 'blocked' && (
                          <button
                            onClick={() => updateTaskStatus(task.task_id, 'ready')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Unblock"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-gray-500">No tasks found</div>
            )}
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-4 gap-4">
            {kanbanColumns.map(status => (
              <div key={status} className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700 capitalize">{status.replace('_', ' ')}</h3>
                  <span className="text-sm text-gray-500">{groupedTasks[status]?.length || 0}</span>
                </div>
                <div className="space-y-3">
                  {groupedTasks[status]?.map(task => (
                    <div key={task.task_id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <p className="font-medium text-gray-900 text-sm mb-2">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.due_date}</span>
                      </div>
                      {task.sla_impact === 'hard' && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">Hard SLA</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;
