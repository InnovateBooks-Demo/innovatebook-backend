import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Building2, Package, Factory, Users } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const MasterDataView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const tabs = [
    { id: 'customers', label: 'Customers', icon: Building2, endpoint: '/api/manufacturing/masters/customers', dataKey: 'customers' },
    { id: 'product-families', label: 'Product Families', icon: Package, endpoint: '/api/manufacturing/masters/product-families', dataKey: 'product_families' },
    { id: 'skus', label: 'SKUs', icon: Package, endpoint: '/api/manufacturing/masters/skus', dataKey: 'skus' },
    { id: 'plants', label: 'Plants', icon: Factory, endpoint: '/api/manufacturing/masters/plants', dataKey: 'plants' },
    { id: 'raw-materials', label: 'Raw Materials', icon: Package, endpoint: '/api/manufacturing/masters/raw-materials', dataKey: 'raw_materials' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const activeTabConfig = tabs.find(t => t.id === activeTab);
    
    try {
      const response = await axios.get(`${BACKEND_URL}${activeTabConfig.endpoint}`);
      setData(response.data[activeTabConfig.dataKey] || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  });

  const renderCustomerRow = (customer) => (
    <tr key={customer.id} className="hover:bg-blue-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customer_code}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.customer_name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.industry}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.region}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{(customer.credit_limit / 10000000).toFixed(1)}Cr</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {customer.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );

  const renderProductFamilyRow = (family) => (
    <tr key={family.id} className="hover:bg-blue-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{family.family_code}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{family.family_name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{family.category}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{family.description}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          family.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {family.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );

  const renderSKURow = (sku) => (
    <tr key={sku.id} className="hover:bg-blue-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sku.sku_code}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.sku_name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sku.product_family}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sku.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{(sku.standard_price || 0).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          sku.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {sku.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );

  const renderPlantRow = (plant) => (
    <tr key={plant.id} className="hover:bg-blue-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plant.plant_code}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plant.plant_name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plant.location}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plant.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plant.capacity_units}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          plant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {plant.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );

  const renderRawMaterialRow = (material) => (
    <tr key={material.id} className="hover:bg-blue-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.rm_code}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.rm_name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.grade}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.uom}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{(material.standard_price || 0).toLocaleString()}</td>
    </tr>
  );

  const renderTable = () => {
    switch (activeTab) {
      case 'customers':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(renderCustomerRow)}
            </tbody>
          </table>
        );
      case 'product-families':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(renderProductFamilyRow)}
            </tbody>
          </table>
        );
      case 'skus':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Family</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(renderSKURow)}
            </tbody>
          </table>
        );
      case 'plants':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(renderPlantRow)}
            </tbody>
          </table>
        );
      case 'raw-materials':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RM Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(renderRawMaterialRow)}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/commerce/lead')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Leads
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Data Management</h1>
        <p className="text-gray-600">View and manage manufacturing master data</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Showing {filteredData.length} of {data.length} records
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {renderTable()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterDataView;
