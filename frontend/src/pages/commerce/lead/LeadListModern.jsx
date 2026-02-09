import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, LayoutGrid, List, ChevronDown, Eye, Edit2, Mail, Phone, Calendar, TrendingUp, Star, Sparkles, ArrowUpRight, Circle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListModern = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [viewMode, setViewMode] = useState('board'); // board or list
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/manufacturing/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data.leads || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load leads');
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.rfq_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    const colors = {
      'New': { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'Active': { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      'Qualified': { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'Converted': { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }
    };
    return colors[status] || colors['New'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700' },
      'Medium': { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' },
      'Low': { bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-600' }
    };
    return colors[priority] || colors['Medium'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Modern Header with Gradient */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Lead Pipeline</h1>
                <p className="text-sm text-gray-500">{filteredLeads.length} active opportunities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('board')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'board'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => navigate('/commerce/lead/create')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                New Lead
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {viewMode === 'board' ? (
          /* Board View - Modern Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLeads.map((lead) => {
              const statusColor = getStatusColor(lead.status);
              const priorityColor = getPriorityColor(lead.priority);
              const isHovered = hoveredCard === lead.id;

              return (
                <div
                  key={lead.id}
                  onMouseEnter={() => setHoveredCard(lead.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                  className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`h-1 ${statusColor.bg}`}></div>

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                          {lead.customer_name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono">{lead.rfq_number || 'No RFQ'}</p>
                      </div>
                      {lead.lead_score >= 70 && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${statusColor.light} ${statusColor.text}`}>
                        <Circle className="w-2 h-2" fill="currentColor" />
                        {lead.status}
                      </span>
                      {lead.priority && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${priorityColor.light} ${priorityColor.text}`}>
                          {lead.priority}
                        </span>
                      )}
                    </div>

                    {/* Contact */}
                    {lead.contact_person && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium truncate">{lead.contact_person}</span>
                        </div>
                        {lead.contact_email && (
                          <div className="text-xs text-gray-500 truncate ml-5">{lead.contact_email}</div>
                        )}
                      </div>
                    )}

                    {/* Score */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                        <span className="font-medium">Lead Score</span>
                        <span className="font-semibold text-gray-900">{lead.lead_score || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statusColor.bg} transition-all duration-300`}
                          style={{ width: `${lead.lead_score || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className={`absolute bottom-4 right-4 flex items-center gap-1 transition-all duration-200 ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/commerce/lead/${lead.id}`);
                        }}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/commerce/lead/${lead.id}/edit`);
                        }}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View - Clean Table */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">RFQ</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const statusColor = getStatusColor(lead.status);
                  const priorityColor = getPriorityColor(lead.priority);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                      className="group hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${statusColor.light} flex items-center justify-center`}>
                            <span className={`text-sm font-semibold ${statusColor.text}`}>
                              {lead.customer_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {lead.customer_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.contact_person || '—'}</div>
                        <div className="text-xs text-gray-500">{lead.contact_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusColor.light} ${statusColor.text}`}>
                          <Circle className="w-2 h-2" fill="currentColor" />
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.priority && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${priorityColor.light} ${priorityColor.text}`}>
                            {lead.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${statusColor.bg} transition-all`}
                              style={{ width: `${lead.lead_score || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{lead.lead_score || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono">{lead.rfq_number || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
                          <ArrowUpRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-sm text-gray-600 mb-6">
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first lead'}
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedPriority === 'all' && (
              <button
                onClick={() => navigate('/commerce/lead/create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Your First Lead
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListModern;
