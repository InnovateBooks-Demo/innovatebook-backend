import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderKanban, ArrowLeft, Calendar, Clock, Users, Package, AlertTriangle, CheckCircle, FileText, Activity, DollarSign, History } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { project_id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [project_id]);

  const fetchProject = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/operations/projects/${project_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
      }
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'milestones', label: 'Milestones', icon: CheckCircle },
    { id: 'tasks', label: 'Tasks', icon: Activity },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'changelog', label: 'Change Log', icon: History }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      planned: 'bg-gray-100 text-gray-700',
      active: 'bg-blue-100 text-blue-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="project-detail">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/operations/projects')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Operations → Projects → {project.project_id}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <FolderKanban className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500">{project.project_type} Project</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${project.progress_percent}%` }} />
                </div>
                <span className="text-lg font-bold text-gray-900">{project.progress_percent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-t border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Project Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Work Order</p>
                    <p className="font-medium text-gray-900">{project.work_order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Project Type</p>
                    <p className="font-medium text-gray-900 capitalize">{project.project_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">{project.start_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Target End Date</p>
                    <p className="font-medium text-gray-900">{project.target_end_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Owner</p>
                    <p className="font-medium text-gray-900">{project.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SLA Status</p>
                    <p className={`font-medium capitalize ${project.sla_status === 'on_track' ? 'text-green-600' : project.sla_status === 'at_risk' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {project.sla_status?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scope Snapshot */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope (Read-Only)</h3>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(project.scope_snapshot, null, 2)}
                </pre>
              </div>
            </div>

            {/* SLA Snapshot */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA (Read-Only)</h3>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(project.sla_snapshot, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
            </div>
            {project.milestones?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {project.milestones.map((milestone, i) => (
                  <div key={milestone.milestone_id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <CheckCircle className={`h-4 w-4 ${milestone.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{milestone.title}</p>
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Planned: {milestone.planned_date}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                        milestone.status === 'delayed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{milestone.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">No milestones defined</div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
              <span className="text-sm text-gray-500">{project.tasks?.length || 0} tasks</span>
            </div>
            {project.tasks?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assignee</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {project.tasks.map(task => (
                    <tr key={task.task_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.task_id}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{task.assignee_name || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{task.priority}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{task.status?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{task.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">No tasks assigned</div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Resources</h3>
            </div>
            {project.resources?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Allocation</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {project.resources.map(res => (
                    <tr key={res.assignment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{res.resource_name}</td>
                      <td className="px-6 py-4 text-gray-700">{res.role}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-purple-600">{res.allocation_percent}%</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{res.start_date} - {res.end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">No resources assigned</div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Allocations</h3>
            </div>
            {project.inventory?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Reserved</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Consumed</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {project.inventory.map(inv => (
                    <tr key={inv.allocation_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.item_name}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{inv.quantity_reserved}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{inv.quantity_consumed}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          inv.allocation_status === 'fully_consumed' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{inv.allocation_status?.replace('_', ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">No inventory allocated</div>
            )}
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Issues & Deviations</h3>
            </div>
            {project.issues?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {project.issues.map(issue => (
                  <div key={issue.issue_id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                          issue.severity === 'critical' ? 'text-red-500' :
                          issue.severity === 'high' ? 'text-orange-500' :
                          'text-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{issue.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{issue.description}</p>
                          <p className="text-xs text-gray-400 mt-2">Type: {issue.issue_type} • Raised: {issue.raised_at}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        issue.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{issue.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">No issues reported</div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Budget Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{(project.budget?.total || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Spent</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">₹{(project.budget?.spent || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Committed</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">₹{(project.budget?.committed || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{(project.budget?.remaining || (project.budget?.total || 0) - (project.budget?.spent || 0)).toLocaleString()}</p>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown by Category</h3>
              </div>
              {project.budget?.breakdown?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Budgeted</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actual</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Variance</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {project.budget.breakdown.map((item, i) => {
                      const variance = (item.actual || 0) - (item.budgeted || 0);
                      const utilization = item.budgeted ? ((item.actual || 0) / item.budgeted) * 100 : 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.category}</td>
                          <td className="px-6 py-4 text-right text-gray-700">₹{(item.budgeted || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-gray-700">₹{(item.actual || 0).toLocaleString()}</td>
                          <td className={`px-6 py-4 text-right font-medium ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {variance > 0 ? '+' : ''}₹{variance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full ${utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{utilization.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No budget breakdown available</p>
                  <p className="text-sm mt-2">Budget data will appear here once costs are tracked</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Change Log Tab */}
        {activeTab === 'changelog' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Change Log</h3>
            </div>
            {project.changelog?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {project.changelog.map((entry, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <History className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{entry.action}</p>
                          <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                        <p className="text-xs text-gray-400 mt-2">By: {entry.actor || 'System'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No changes recorded yet</p>
                <p className="text-sm mt-2">Project modifications will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
