import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Upload, Download, Edit, Trash2 } from "lucide-react";

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const fileInputRef = useRef(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    gstin: "",
    credit_limit: 0,
    payment_terms: "Net 30",
    address: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.create(newCustomer);
      toast.success("Customer added successfully");
      setShowAddDialog(false);
      loadCustomers();
      setNewCustomer({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        gstin: "",
        credit_limit: 0,
        payment_terms: "Net 30",
        address: "",
      });
    } catch (error) {
      toast.error("Failed to add customer");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await customerAPI.upload(file);
      toast.success(
        `Successfully uploaded ${response.data.customers_added} customers`,
      );
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} rows had errors`);
      }
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await customerAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customer_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template downloaded");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handleExportCustomers = async () => {
    try {
      const response = await customerAPI.exportToExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Customers exported successfully");
    } catch (error) {
      toast.error("Failed to export customers");
    }
  };

  const handleEdit = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setShowEditDialog(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.update(selectedCustomer.id, selectedCustomer);
      toast.success("Customer updated successfully");
      setShowEditDialog(false);
      loadCustomers();
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  const handleDelete = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await customerAPI.delete(selectedCustomer.id);
      toast.success("Customer deleted successfully");
      setShowDeleteDialog(false);
      loadCustomers();
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
      setSelectAll(false);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
      setSelectAll(true);
    }
  };

  const handleSelectCustomer = (customerId) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedCustomers, customerId];
      setSelectedCustomers(newSelected);
      if (newSelected.length === filteredCustomers.length) {
        setSelectAll(true);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    try {
      // Delete all selected customers
      await Promise.all(selectedCustomers.map((id) => customerAPI.delete(id)));
      toast.success(
        `Successfully deleted ${selectedCustomers.length} customer(s)`,
      );
      setShowBulkDeleteDialog(false);
      setSelectedCustomers([]);
      setSelectAll(false);
      loadCustomers();
    } catch (error) {
      toast.error("Failed to delete customers");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="customers-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "Inter", color: "#033F99" }}
          >
            Customers
          </h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <div className="flex gap-3">
          {selectedCustomers.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              data-testid="bulk-delete-btn"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedCustomers.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleExportCustomers}
            data-testid="export-customers-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Customers
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            data-testid="download-template-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid="upload-excel-btn"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Excel"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
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
                <DialogDescription>
                  Enter customer details below
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleAddCustomer}
                className="space-y-4"
                data-testid="add-customer-form"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      required
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      data-testid="customer-name-input"
                    />
                  </div>
                  <div>
                    <Label>Contact Person *</Label>
                    <Input
                      required
                      value={newCustomer.contact_person}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          contact_person: e.target.value,
                        })
                      }
                      data-testid="customer-contact-input"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      required
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          email: e.target.value,
                        })
                      }
                      data-testid="customer-email-input"
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      required
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          phone: e.target.value,
                        })
                      }
                      data-testid="customer-phone-input"
                    />
                  </div>
                  <div>
                    <Label>GSTIN</Label>
                    <Input
                      value={newCustomer.gstin}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          gstin: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Credit Limit *</Label>
                    <Input
                      type="number"
                      required
                      value={newCustomer.credit_limit}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          credit_limit: parseFloat(e.target.value),
                        })
                      }
                      data-testid="customer-credit-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="submit-customer-btn"
                >
                  Add Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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

      <div className="w-full overflow-x-auto"> {/* RESPONSIVE CHANGE */}
        <table className="data-table min-w-[800px]" data-testid="customers-table"> {/* RESPONSIVE CHANGE */}
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                  data-testid="select-all-checkbox"
                />
              </th>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Outstanding</th>
              <th>Overdue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                data-testid={`customer-row-${customer.id}`}
                className="hover:bg-gray-50"
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleSelectCustomer(customer.id)}
                    className="w-4 h-4 cursor-pointer"
                    data-testid={`select-customer-${customer.id}`}
                  />
                </td>
                <td
                  className="font-medium cursor-pointer"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  style={{ color: "#033F99" }}
                >
                  {customer.customer_id || "-"}
                </td>
                <td
                  className="font-medium cursor-pointer"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  {customer.name}
                </td>
                <td
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="cursor-pointer"
                >
                  {customer.contact_person}
                </td>
                <td
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="cursor-pointer"
                >
                  {customer.email}
                </td>
                <td
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="cursor-pointer"
                >
                  {customer.phone}
                </td>
                <td
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="cursor-pointer font-semibold"
                  style={{ color: "#033F99" }}
                >
                  {formatCurrency(customer.outstanding_amount)}
                </td>
                <td
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="cursor-pointer font-semibold text-red-600"
                >
                  {formatCurrency(customer.overdue_amount)}
                </td>
                <td
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="cursor-pointer"
                >
                  <span
                    className={`badge ${customer.status === "Active"
                      ? "badge-success"
                      : "badge-danger"
                      }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(customer, e)}
                      data-testid={`edit-customer-${customer.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(customer, e)}
                      data-testid={`delete-customer-${customer.id}`}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {selectedCustomer && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    required
                    value={selectedCustomer.name}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Contact Person *</Label>
                  <Input
                    required
                    value={selectedCustomer.contact_person}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        contact_person: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={selectedCustomer.email}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    required
                    value={selectedCustomer.phone}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>GSTIN</Label>
                  <Input
                    value={selectedCustomer.gstin || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        gstin: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Credit Limit *</Label>
                  <Input
                    type="number"
                    required
                    value={selectedCustomer.credit_limit}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        credit_limit: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={selectedCustomer.address || ""}
                  onChange={(e) =>
                    setSelectedCustomer({
                      ...selectedCustomer,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Update Customer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedCustomer && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <strong>{selectedCustomer.name}</strong>? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedCustomers.length} customer(s)</strong>? This
              action cannot be undone and will permanently remove all selected
              customers.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Warning: This will delete {selectedCustomers.length}{" "}
              customer(s) and all their associated data.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              Delete {selectedCustomers.length} Customer(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
