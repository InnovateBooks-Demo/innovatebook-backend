import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vendorAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  User,
  Download,
  Upload,
  Search,
  TrendingUp,
  DollarSign,
  FileText,
  ChevronRight,
  Trash2,
} from "lucide-react";

const VendorsProfessional = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load vendors");
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(filteredVendors.map((v) => v.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectVendor = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter((id) => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVendors.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedVendors.length} vendor(s)? This action cannot be undone.`,
      )
    )
      return;

    try {
      await Promise.all(selectedVendors.map((id) => vendorAPI.delete(id)));
      toast.success(`${selectedVendors.length} vendor(s) deleted successfully`);
      setSelectedVendors([]);
      setSelectAll(false);
      loadVendors();
    } catch (error) {
      toast.error("Failed to delete vendors");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await vendorAPI.exportToExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vendors.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Vendors exported successfully");
    } catch (error) {
      toast.error("Failed to export vendors");
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      await vendorAPI.upload(formData);
      toast.success("Vendors imported successfully");
      loadVendors();
    } catch (error) {
      toast.error("Failed to import vendors");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await vendorAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vendor_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template downloaded");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendor_id?.toString().includes(searchTerm),
  );

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

  const totalOutstanding = vendors.reduce(
    (sum, c) => sum + (c.outstanding_amount || 0),
    0,
  );
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(
    (c) => (c.outstanding_amount || 0) > 0,
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              Vendors
            </h1>
            <p
              className="text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Manage your vendor relationships
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm text-gray-500 mb-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Total Vendors
                </p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  {totalVendors}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User className="h-7 w-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm text-gray-500 mb-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Active Vendors
                </p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  {activeVendors}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm text-gray-500 mb-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Total Outstanding
                </p>
                <p
                  className="text-3xl font-bold text-red-600"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar and Bulk Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-300 shadow-sm">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-[#033F99] focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Select All ({filteredVendors.length})
            </span>
          </div>
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
          {selectedVendors.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Selected ({selectedVendors.length})
            </Button>
          )}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card
            key={vendor.id}
            className="p-6 bg-white border-0 shadow-md hover:shadow-xl transition-all group relative"
          >
            <div
              className="absolute top-4 right-4"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={selectedVendors.includes(vendor.id)}
                onChange={() => handleSelectVendor(vendor.id)}
                className="w-5 h-5 rounded border-gray-300 text-[#033F99] focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/vendors/${vendor.id}`)}
            >
              <div className="flex items-start justify-between mb-4 pr-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {vendor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="font-bold text-gray-900 text-lg"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {vendor.name}
                    </p>
                    <p
                      className="text-sm text-gray-500 font-mono"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      #{vendor.vendor_id}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#033F99] transition-colors" />
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm text-gray-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Outstanding Amount
                  </span>
                  <span
                    className="font-bold text-lg text-red-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {formatCurrency(vendor.outstanding_amount || 0)}
                  </span>
                </div>

                {vendor.email && (
                  <div
                    className="flex items-center gap-2 text-sm text-gray-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {vendor.email}
                  </div>
                )}

                {vendor.phone && (
                  <div
                    className="flex items-center gap-2 text-sm text-gray-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {vendor.phone}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className="text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Total Invoiced
                  </span>
                  <span
                    className="font-semibold text-gray-900"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {formatCurrency(vendor.total_invoiced || 0)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p
            className="text-gray-500 text-lg"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            No vendors found
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorsProfessional;
