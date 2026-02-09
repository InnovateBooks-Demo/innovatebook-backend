import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Search, Filter, Check, X, AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IntakeQueue = () => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchWorkOrders();
  }, [statusFilter]);

  const fetchWorkOrders = async () => {
    try {
      const token = authService.getToken();
      const url = statusFilter === 'all' 
        ? `${API_URL}/api/operations/work-intake`
        : `${API_URL}/api/operations/work-intake?status=${statusFilter}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (workOrderId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/operations/work-intake/${workOrderId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Work order accepted');
        fetchWorkOrders();
      }
    } catch (error) {
      toast.error('Failed to accept work order');
    }
  };

  const handleBlock = async (workOrderId) => {
    const reason = prompt('Enter block reason:');
    if (!reason) return;
    
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/operations/work-intake/${workOrderId}/block`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        toast.success('Work order blocked');
        fetchWorkOrders();
      }
    } catch (error) {
      toast.error('Failed to block work order');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      blocked: 'bg-red-100 text-red-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredOrders = workOrders.filter(wo => 
    wo.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.work_order_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="intake-queue">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/operations')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">Operations → Intake</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Intake Queue</h1>
                <p className="text-sm text-gray-500 mt-1">Receive and validate work orders from contracts</p>
              </div>
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
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="blocked">Blocked</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Work Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Party</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SLA</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Risk</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(wo => (
                <tr key={wo.work_order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{wo.work_order_id}</p>
                    <p className="text-xs text-gray-500">{wo.source_contract_id}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{wo.party_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                      {wo.delivery_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {wo.sla_snapshot?.duration_days ? `${wo.sla_snapshot.duration_days} days` : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{wo.planned_start_date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(wo.status)}`}>
                      {wo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {wo.risk_flag && <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/operations/intake/${wo.work_order_id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {wo.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(wo.work_order_id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Accept"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBlock(wo.work_order_id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Block"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No work orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntakeQueue;
