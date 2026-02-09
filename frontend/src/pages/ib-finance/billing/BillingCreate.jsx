import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BillingCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    billing_type: 'milestone',
    party_id: '',
    party_name: '',
    contract_id: '',
    billing_period: new Date().toISOString().slice(0, 7),
    currency: 'INR',
    description: '',
    tax_code: 'GST-18',
    line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  const billingTypes = [
    { value: 'milestone', label: 'Milestone Billing' },
    { value: 'usage', label: 'Usage-Based Billing' },
    { value: 'subscription', label: 'Subscription Billing' },
    { value: 'adjustment', label: 'Adjustment (Credit/Debit Note)' }
  ];

  const taxCodes = [
    { value: 'GST-18', label: 'GST @ 18%', rate: 0.18 },
    { value: 'GST-12', label: 'GST @ 12%', rate: 0.12 },
    { value: 'GST-5', label: 'GST @ 5%', rate: 0.05 },
    { value: 'GST-0', label: 'GST Exempt', rate: 0 },
    { value: 'VAT-20', label: 'VAT @ 20%', rate: 0.20 }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index, field, value) => {
    const items = [...formData.line_items];
    items[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    setFormData(prev => ({ ...prev, line_items: items }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.line_items.length === 1) return;
    const items = formData.line_items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, line_items: items }));
  };

  const calculateTotals = () => {
    const gross = formData.line_items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRate = taxCodes.find(t => t.value === formData.tax_code)?.rate || 0;
    const tax = gross * taxRate;
    const net = gross + tax;
    return { gross, tax, net };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.party_name || !formData.party_id) {
      toast.error('Please enter party details');
      return;
    }

    setLoading(true);
    const totals = calculateTotals();

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-finance/billing`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          gross_amount: totals.gross,
          tax_amount: totals.tax,
          net_amount: totals.net
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Billing record created');
        navigate(`/ib-finance/billing/${data.data.billing_id}`);
      } else {
        toast.error('Failed to create billing');
      }
    } catch (error) {
      toast.error('Failed to create billing');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="billing-create">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/ib-finance/billing')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">IB Finance → Billing → Create</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Receipt className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Billing Record</h1>
              <p className="text-sm text-gray-500 mt-1">Generate invoice from confirmed execution</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Billing Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Type *</label>
                  <select
                    name="billing_type"
                    value={formData.billing_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {billingTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period *</label>
                  <input
                    type="month"
                    name="billing_period"
                    value={formData.billing_period}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract ID</label>
                  <input
                    type="text"
                    name="contract_id"
                    value={formData.contract_id}
                    onChange={handleChange}
                    placeholder="CTR-2025-XXX"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Party Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Party Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party ID *</label>
                  <input
                    type="text"
                    name="party_id"
                    value={formData.party_id}
                    onChange={handleChange}
                    placeholder="CUST-XXX"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party Name *</label>
                  <input
                    type="text"
                    name="party_name"
                    value={formData.party_name}
                    onChange={handleChange}
                    placeholder="Customer/Vendor Name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Line Items</h3>
                <button type="button" onClick={addLineItem} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-20">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-32">Rate</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-32">Amount</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.line_items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes or description..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Tax & Totals */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tax & Totals</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Code</label>
                <select
                  name="tax_code"
                  value={formData.tax_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {taxCodes.map(tax => (
                    <option key={tax.value} value={tax.value}>{tax.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Amount</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totals.gross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totals.tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Net Amount</span>
                  <span className="font-bold text-xl text-blue-600">{formatCurrency(totals.net)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Billing Record'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/ib-finance/billing')}
                className="w-full mt-3 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BillingCreate;
