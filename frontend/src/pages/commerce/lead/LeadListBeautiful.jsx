import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Mail, Phone, Building2, ArrowRight, Star, TrendingUp, Zap, Target, BarChart3, Calendar, Eye, MoreHorizontal, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LeadListBeautiful = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'high' && lead.priority === 'High') ||
                         (selectedFilter === 'medium' && lead.priority === 'Medium') ||
                         (selectedFilter === 'active' && (lead.status === 'Active' || lead.status === 'New'));
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: leads.length,
    highPriority: leads.filter(l => l.priority === 'High').length,
    active: leads.filter(l => l.status === 'Active' || l.status === 'New').length,
    avgScore: leads.length > 0 ? (leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length).toFixed(0) : 0
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
      case 'Medium': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
      case 'Low': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-indigo-600 border-r-transparent mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Sales Leads</h1>
              <p className="text-gray-600">Track and manage your sales opportunities</p>
            </div>
            <button
              onClick={() => navigate('/commerce/lead/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
            >
              <Plus className="h-4 w-4" />
              New Lead
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.total}</p>
                </div>
              </div>
              <div className="h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Hot Leads</p>
                  <p className="text-2xl font-bold text-red-900">{stats.highPriority}</p>
                </div>
              </div>
              <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{width: `${(stats.highPriority/stats.total)*100}%`}}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Active</p>
                  <p className="text-2xl font-bold text-emerald-900">{stats.active}</p>
                </div>
              </div>
              <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{width: `${(stats.active/stats.total)*100}%`}}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center shadow-sm">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Avg Score</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.avgScore}<span className="text-sm text-purple-600">/100</span></p>
                </div>
              </div>
              <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{width: `${stats.avgScore}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('high')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedFilter === 'high'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => setSelectedFilter('active')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedFilter === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const priorityColors = getPriorityColor(lead.priority);
            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/commerce/lead/${lead.id}`)}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Priority Indicator */}
                <div className={`h-1 ${priorityColors.dot}`}></div>
                
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {lead.customer_name}
                        </h3>
                        {lead.lead_score >= 70 && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{lead.rfq_number}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {lead.contact_person && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{lead.contact_person}</span>
                      </div>
                    )}
                    {lead.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{lead.contact_email}</span>
                      </div>
                    )}
                    {lead.customer_industry && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{lead.customer_industry}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {lead.status}
                    </span>
                    {lead.priority && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${priorityColors.dot}`}></div>
                        {lead.priority}
                      </span>
                    )}
                  </div>

                  {/* Score Bar */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span className="font-medium">Lead Score</span>
                      <span className="font-semibold text-gray-900">{lead.lead_score || 0}/100</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${lead.lead_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-6">Create your first lead to get started</p>
            <button
              onClick={() => navigate('/commerce/lead/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListBeautiful;