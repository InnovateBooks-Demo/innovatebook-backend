import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Search, Upload, Download, Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "../components/ui/label";

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoices(response.data);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await invoiceAPI.upload(file);
      toast.success(
        `Successfully uploaded ${response.data.invoices_added} invoices`,
      );
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} rows had errors`);
      }
      loadInvoices();
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
      const response = await invoiceAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "invoice_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template downloaded");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
      setSelectAll(false);
    } else {
      setSelectedInvoices(filteredInvoices.map((inv) => inv.id));
      setSelectAll(true);
    }
  };

  const handleSelectInvoice = (invoiceId) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(selectedInvoices.filter((id) => id !== invoiceId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedInvoices, invoiceId];
      setSelectedInvoices(newSelected);
      if (newSelected.length === filteredInvoices.length) {
        setSelectAll(true);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedInvoices.length === 0) {
      toast.error("Please select at least one invoice");
      return;
    }
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedInvoices.map((id) => invoiceAPI.delete(id)));
      toast.success(
        `Successfully deleted ${selectedInvoices.length} invoice(s)`,
      );
      setShowBulkDeleteDialog(false);
      setSelectedInvoices([]);
      setSelectAll(false);
      loadInvoices();
    } catch (error) {
      toast.error("Failed to delete invoices");
    }
  };

  const handleEdit = (invoice, e) => {
    e.stopPropagation();
    setCurrentInvoice(invoice);
    setEditForm({
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customer_name,
      invoice_date: invoice.invoice_date.split("T")[0],
      due_date: invoice.due_date.split("T")[0],
      total_amount: invoice.total_amount,
      amount_received: invoice.amount_received || 0,
      status: invoice.status,
    });
    setShowEditDialog(true);
  };

  const handleDelete = (invoice, e) => {
    e.stopPropagation();
    setCurrentInvoice(invoice);
    setShowDeleteDialog(true);
  };

  const confirmEdit = async () => {
    try {
      await invoiceAPI.update(currentInvoice.id, {
        ...editForm,
        amount_outstanding: editForm.total_amount - editForm.amount_received,
      });
      toast.success("Invoice updated successfully");
      setShowEditDialog(false);
      setCurrentInvoice(null);
      loadInvoices();
    } catch (error) {
      toast.error("Failed to update invoice");
    }
  };

  const confirmDelete = async () => {
    try {
      await invoiceAPI.delete(currentInvoice.id);
      toast.success("Invoice deleted successfully");
      setShowDeleteDialog(false);
      setCurrentInvoice(null);
      loadInvoices();
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="invoices-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "Inter", color: "#3A4E63" }}
          >
            Invoices
          </h1>
          <p className="text-gray-600">Track all customer invoices</p>
        </div>
        <div className="flex gap-3">
          {selectedInvoices.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedInvoices.length})
            </Button>
          )}
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
          <Button data-testid="add-invoice-btn">
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
        </div>
      </div>

      <Card className="chart-container mb-6">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-invoices-input"
            />
          </div>
        </div>
      </Card>

      <div className="table-wrapper">
        <table className="data-table" data-testid="invoices-table">
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Received</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                data-testid={`invoice-row-${invoice.id}`}
                className="hover:bg-gray-50"
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedInvoices.includes(invoice.id)}
                    onChange={() => handleSelectInvoice(invoice.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td
                  className="font-medium cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {invoice.invoice_number}
                </td>
                <td
                  className="cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {invoice.customer_name}
                </td>
                <td
                  className="cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {formatDate(invoice.invoice_date)}
                </td>
                <td
                  className="cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {formatDate(invoice.due_date)}
                </td>
                <td
                  className="font-semibold cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {formatCurrency(invoice.total_amount)}
                </td>
                <td
                  className="font-semibold text-green-600 cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {formatCurrency(invoice.amount_received)}
                </td>
                <td
                  className="font-semibold text-red-600 cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {formatCurrency(invoice.amount_outstanding)}
                </td>
                <td
                  className="cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <span
                    className={`badge ${
                      invoice.status === "Paid"
                        ? "badge-success"
                        : invoice.status === "Partially Paid"
                          ? "badge-warning"
                          : "badge-danger"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(invoice, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(invoice, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              <strong>{selectedInvoices.length} invoice(s)</strong>? This action
              cannot be undone and will permanently remove all selected
              invoices.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Warning: This will delete {selectedInvoices.length} invoice(s)
              and all their associated data.
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
              Delete {selectedInvoices.length} Invoice(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: "#3A4E63" }}>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the invoice information below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={editForm.invoice_number || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, invoice_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={editForm.customer_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, customer_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={editForm.invoice_date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, invoice_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={editForm.due_date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount (₹)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  value={editForm.total_amount || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      total_amount: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_received">Amount Received (₹)</Label>
                <Input
                  id="amount_received"
                  type="number"
                  value={editForm.amount_received || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      amount_received: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editForm.status || "Unpaid"}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              style={{ backgroundColor: "#3A4E63" }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              <strong>{currentInvoice?.invoice_number}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Warning: This will permanently delete this invoice and all
              associated data.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
