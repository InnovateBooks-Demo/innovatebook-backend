import React, { useState, useEffect, useRef } from 'react';
import { customerAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, Upload, Download } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    gstin: '',
    credit_limit: 0,
    payment_terms: 'Net 30',
    address: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.create(newCustomer);
      toast.success('Customer added successfully');
      setShowAddDialog(false);
      loadCustomers();
      setNewCustomer({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        gstin: '',
        credit_limit: 0,
        payment_terms: 'Net 30',
        address: ''
      });
    } catch (error) {
      toast.error('Failed to add customer');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await customerAPI.upload(file);
      toast.success(`Successfully uploaded ${response.data.customers_added} customers`);
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} rows had errors`);
      }
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await customerAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customer_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="p-8" data-testid="customers-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Inter', color: '#033F99' }}>Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadTemplate} data-testid="download-template-btn">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="upload-excel-btn">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Excel'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="add-customer-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Enter customer details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4" data-testid="add-customer-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input required value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} data-testid="customer-name-input" />
                  </div>
                  <div>
                    <Label>Contact Person *</Label>
                    <Input required value={newCustomer.contact_person} onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })} data-testid="customer-contact-input" />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" required value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} data-testid="customer-email-input" />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input required value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} data-testid="customer-phone-input" />
                  </div>
                  <div>
                    <Label>GSTIN</Label>
                    <Input value={newCustomer.gstin} onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value })} />
                  </div>
                  <div>
                    <Label>Credit Limit *</Label>
                    <Input type="number" required value={newCustomer.credit_limit} onChange={(e) => setNewCustomer({ ...newCustomer, credit_limit: parseFloat(e.target.value) })} data-testid="customer-credit-input" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-customer-btn">Add Customer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="chart-container mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-customers-input"
              />
            </div>
          </CardContent>
        </Card>

        <div className="table-wrapper">
          <table className="data-table" data-testid="customers-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Outstanding</th>
                <th>Overdue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} data-testid={`customer-row-${customer.id}`}>
                  <td className="font-medium">{customer.name}</td>
                  <td>{customer.contact_person}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td className="font-semibold" style={{ color: '#033F99' }}>{formatCurrency(customer.outstanding_amount)}</td>
                  <td className="font-semibold text-red-600">{formatCurrency(customer.overdue_amount)}</td>
                  <td>
                    <span className={`badge ${customer.status === 'Active' ? 'badge-success' : 'badge-danger'
                      }`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      );
};

      export default Customers;
