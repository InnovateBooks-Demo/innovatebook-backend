import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaFilter, FaSearch, FaTh, FaList, FaIndustry, FaCog, FaCheckCircle, FaClock } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManufacturingLeadList = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    approved: 0,
    converted: 0
  });

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, stageFilter, priorityFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      let url = `${API_URL}/api/manufacturing/leads?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (stageFilter) url += `stage=${stageFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        
        // Calculate stats
        const newLeads = data.leads.filter(l => l.status === 'New').length;
        const inProgress = data.leads.filter(l => ['Intake', 'Feasibility Check', 'Costing'].includes(l.status)).length;
        const approved = data.leads.filter(l => l.status === 'Approved').length;
        const converted = data.leads.filter(l => l.status === 'Converted').length;
        
        setStats({
          total: data.total || data.leads.length,
          new: newLeads,
          inProgress,
          approved,
          converted
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Intake': 'bg-purple-100 text-purple-800',
      'Feasibility Check': 'bg-yellow-100 text-yellow-800',
      'Costing': 'bg-orange-100 text-orange-800',
      'Approval Pending': 'bg-red-100 text-red-800',
      'Approved': 'bg-green-100 text-green-800',
      'Converted': 'bg-teal-100 text-teal-800',
      'Lost': 'bg-gray-100 text-gray-800',
      'On Hold': 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-600',
      'Medium': 'bg-blue-100 text-blue-700',
      'High': 'bg-orange-100 text-orange-700',
      'Urgent': 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const filteredLeads = leads.filter(lead =>
    searchTerm === '' ||
    lead.lead_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.product_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaIndustry className="text-blue-600" />
                Manufacturing Leads
              </h1>
              <p className="text-gray-600 mt-1">Global Manufacturing Lead Management System</p>
            </div>
            <Link to="/commerce/manufacturing-leads/create">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-lg">
                <FaPlus /> New Lead
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FaIndustry className="text-4xl text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">New</p>
                <p className="text-3xl font-bold text-gray-900">{stats.new}</p>
              </div>
              <FaClock className="text-4xl text-green-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <FaCog className="text-4xl text-yellow-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Converted</p>
                <p className="text-3xl font-bold text-gray-900">{stats.converted}</p>
              </div>
              <FaCheckCircle className="text-4xl text-teal-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Intake">Intake</option>
              <option value="Feasibility Check">Feasibility Check</option>
              <option value="Costing">Costing</option>
              <option value="Approval Pending">Approval Pending</option>
              <option value="Approved">Approved</option>
              <option value="Converted">Converted</option>
            </select>
            
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Stages</option>
              <option value="Intake">Intake</option>
              <option value="Feasibility">Feasibility</option>
              <option value="Costing">Costing</option>
              <option value="Approval">Approval</option>
              <option value="Convert">Convert</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaList /> Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaTh /> Kanban
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading manufacturing leads...</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Lead ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        No manufacturing leads found. Create your first lead!
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-blue-600">{lead.lead_id}</div>
                          {lead.rfq_number && (
                            <div className="text-xs text-gray-500">RFQ: {lead.rfq_number}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{lead.customer_name}</div>
                          <div className="text-xs text-gray-500">{lead.customer_industry}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{lead.product_description?.substring(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.quantity} {lead.uom}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{lead.current_stage}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/commerce/manufacturing-leads/${lead.lead_id}`)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Kanban view - simplified for Phase 1 */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-4">Intake ({leads.filter(l => l.current_stage === 'Intake').length})</h3>
              {leads.filter(l => l.current_stage === 'Intake').map(lead => (
                <div key={lead.id} className="bg-white p-4 rounded-lg shadow mb-3 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => navigate(`/commerce/manufacturing-leads/${lead.lead_id}`)}>
                  <div className="font-medium text-gray-900">{lead.lead_id}</div>
                  <div className="text-sm text-gray-600 mt-1">{lead.customer_name}</div>
                  <div className="text-xs text-gray-500 mt-1">{lead.product_description?.substring(0, 40)}...</div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-4">Feasibility ({leads.filter(l => l.current_stage === 'Feasibility').length})</h3>
              {leads.filter(l => l.current_stage === 'Feasibility').map(lead => (
                <div key={lead.id} className="bg-white p-4 rounded-lg shadow mb-3 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => navigate(`/commerce/manufacturing-leads/${lead.lead_id}`)}>
                  <div className="font-medium text-gray-900">{lead.lead_id}</div>
                  <div className="text-sm text-gray-600 mt-1">{lead.customer_name}</div>
                  <div className="text-xs text-gray-500 mt-1">{lead.product_description?.substring(0, 40)}...</div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-4">Costing ({leads.filter(l => l.current_stage === 'Costing').length})</h3>
              {leads.filter(l => l.current_stage === 'Costing').map(lead => (
                <div key={lead.id} className="bg-white p-4 rounded-lg shadow mb-3 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => navigate(`/commerce/manufacturing-leads/${lead.lead_id}`)}>
                  <div className="font-medium text-gray-900">{lead.lead_id}</div>
                  <div className="text-sm text-gray-600 mt-1">{lead.customer_name}</div>
                  <div className="text-xs text-gray-500 mt-1">{lead.product_description?.substring(0, 40)}...</div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-4">Approval ({leads.filter(l => l.current_stage === 'Approval').length})</h3>
              {leads.filter(l => l.current_stage === 'Approval').map(lead => (
                <div key={lead.id} className="bg-white p-4 rounded-lg shadow mb-3 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => navigate(`/commerce/manufacturing-leads/${lead.lead_id}`)}>
                  <div className="font-medium text-gray-900">{lead.lead_id}</div>
                  <div className="text-sm text-gray-600 mt-1">{lead.customer_name}</div>
                  <div className="text-xs text-gray-500 mt-1">{lead.product_description?.substring(0, 40)}...</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturingLeadList;
