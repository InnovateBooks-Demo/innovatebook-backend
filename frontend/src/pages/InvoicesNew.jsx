import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  Search,
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  FileText,
  User,
  Calendar,
  ChevronRight,
} from "lucide-react";

const InvoicesNew = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load invoices");
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId, invoiceNumber, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`,
      )
    )
      return;
    try {
      await invoiceAPI.delete(invoiceId);
      toast.success("Invoice deleted successfully");
      loadInvoices();
    } catch (error) {
      toast.error("Failed to delete invoice");
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

  const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0) {
      toast.error("Please select invoices to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedInvoices.length} invoice(s)? This action cannot be undone.`,
      )
    )
      return;

    try {
      await Promise.all(selectedInvoices.map((id) => invoiceAPI.delete(id)));
      toast.success(
        `Successfully deleted ${selectedInvoices.length} invoice(s)`,
      );
      setSelectedInvoices([]);
      setSelectAll(false);
      loadInvoices();
    } catch (error) {
      toast.error("Failed to delete invoices");
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
      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await invoiceAPI.uploadFile(formData);
      toast.success(
        `Successfully uploaded ${response.data.invoices_added} invoices`,
      );
      if (response.data.errors && response.data.errors.length > 0) {
        toast.warning(
          `${response.data.errors.length} errors occurred during upload`,
        );
      }
      loadInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600 text-sm">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                Invoices
              </h1>
              <p
                className="text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {filteredInvoices.length} total invoices
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedInvoices.length > 0 && (
                <Button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedInvoices.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
              />
              <Button
                onClick={() => navigate("/invoices/create")}
                style={{
                  backgroundColor: "#3A4E63",
                  fontFamily: "Inter, sans-serif",
                }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-8 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            className="pl-10 py-3 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-8 pb-8">
        <div className="bg-white shadow-lg border-0 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer rounded border-gray-300"
                    style={{ accentColor: "#3A4E63" }}
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Invoice
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Customer
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Date
                </th>
                <th
                  className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Net Receivable
                </th>
                <th
                  className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Balance Due
                </th>
                <th
                  className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice, index) => (
                <tr
                  key={invoice.id}
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td
                    className="px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleSelectInvoice(invoice.id)}
                      className="w-4 h-4 cursor-pointer rounded border-gray-300"
                      style={{ accentColor: "#3A4E63" }}
                    />
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#EEF4FF" }}
                      >
                        <FileText
                          className="h-5 w-5"
                          style={{ color: "#3A4E63" }}
                        />
                      </div>
                      <div>
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {invoice.invoice_number}
                        </p>
                        {invoice.owner && (
                          <p
                            className="text-sm text-gray-500"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            Owner: {invoice.owner}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span
                        className="text-sm text-gray-900"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {invoice.customer_name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div className="space-y-1">
                      <div
                        className="flex items-center gap-2 text-sm text-gray-900"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formatDate(invoice.invoice_date)}</span>
                      </div>
                      <p
                        className="text-xs text-gray-500"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Due: {formatDate(invoice.due_date)}
                      </p>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <p
                      className="font-semibold text-gray-900"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {formatCurrency(
                        invoice.net_receivable ||
                          invoice.total_amount - (invoice.tds_amount || 0),
                      )}
                    </p>
                    <p
                      className="text-xs text-gray-500"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Total - TDS
                    </p>
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <p
                      className="font-semibold text-red-600"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {formatCurrency(
                        invoice.balance_due ||
                          Math.max(
                            0,
                            invoice.total_amount -
                              (invoice.tds_amount || 0) -
                              (invoice.amount_received || 0),
                          ),
                      )}
                    </p>
                    <p
                      className="text-xs text-gray-500"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Net - Paid
                    </p>
                  </td>
                  <td
                    className="px-6 py-4 text-center"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : invoice.status === "Partially Paid"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : invoice.status === "Overdue"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${invoice.id}`);
                        }}
                        className="h-8 text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) =>
                          handleDelete(invoice.id, invoice.invoice_number, e)
                        }
                        className="h-8 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No invoices found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Get started by adding your first invoice"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesNew;
