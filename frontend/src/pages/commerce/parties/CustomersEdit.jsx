import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CustomersEdit = () => {
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchCustomer();
  }, [customer_id]);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/commerce/parties/customers/${customer_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFormData(response.data.customer);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(
        `${API_URL}/api/commerce/parties/customers/${customer_id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigate(`/commerce/parties/customers/${customer_id}`);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert(error.response?.data?.detail || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-blue-600 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
          <button onClick={() => navigate('/commerce/parties/customers')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50" style={{ fontFamily: 'Poppins' }}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <button onClick={() => navigate(`/commerce/parties/customers/${customer_id}`)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Customer Details
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
              <p className="text-sm text-gray-600 font-medium">Update customer information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name *</label>
                <input
                  type="text"
                  value={formData.display_name || formData.name || ''}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Legal Name *</label>
                <input
                  type="text"
                  value={formData.legal_name || ''}
                  onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Type *</label>
                <select
                  value={formData.customer_type || 'B2B'}
                  onChange={(e) => setFormData({...formData, customer_type: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                  <option value="B2G">B2G</option>
                  <option value="Export">Export</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Segment</label>
                <select
                  value={formData.segment || 'SMB'}
                  onChange={(e) => setFormData({...formData, segment: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="SMB">SMB</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country of Registration *</label>
                <input
                  type="text"
                  value={formData.country_of_registration || ''}
                  onChange={(e) => setFormData({...formData, country_of_registration: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry_classification || ''}
                  onChange={(e) => setFormData({...formData, industry_classification: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dormant">Dormant</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Level</label>
                <select
                  value={formData.risk_level || 'low'}
                  onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/commerce/parties/customers/${customer_id}`)}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomersEdit;