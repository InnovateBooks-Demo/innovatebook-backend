import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../utils/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { User, Download, Upload, Trash2, Search, Plus } from "lucide-react";

const CustomersNewPro = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load customers");
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCustomer = (customerId) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;

    if (!window.confirm(`Delete ${selectedCustomers.length} customer(s)?`))
      return;

    try {
      await Promise.all(selectedCustomers.map((id) => customerAPI.delete(id)));
      toast.success(`${selectedCustomers.length} customer(s) deleted`);
      setSelectedCustomers([]);
      setSelectAll(false);
      loadCustomers();
    } catch (error) {
      toast.error("Failed to delete customers");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await customerAPI.download();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Customers exported successfully");
    } catch (error) {
      toast.error("Failed to export customers");
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await customerAPI.uploadFile(file);
      toast.success("Customers imported successfully");
      loadCustomers();
    } catch (error) {
      toast.error("Failed to import customers");
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

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_id?.toString().includes(searchTerm),
  );

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              Customers
            </h1>
            <p
              className="text-gray-600 mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {filteredCustomers.length} total customers
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <Button
                variant="outline"
                as="span"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <Button
              onClick={() => navigate("/customers/new")}
              style={{
                backgroundColor: "#3A4E63",
                fontFamily: "Inter, sans-serif",
              }}
              className="text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Search Bar and Bulk Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
          {selectedCustomers.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedCustomers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <Card className="bg-white shadow-lg border-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th
                  className="px-6 py-4 text-left"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white"
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Customer ID
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Customer Name
                </th>
                <th
                  className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  Outstanding
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <span
                      className="font-mono font-semibold text-blue-600"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      #{customer.customer_id}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <p
                      className="font-semibold text-gray-900"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {customer.name}
                    </p>
                  </td>
                  <td
                    className="px-6 py-4 text-right cursor-pointer"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <p
                      className="font-bold text-red-600 text-lg"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {formatCurrency(customer.outstanding_amount || 0)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CustomersNewPro;
