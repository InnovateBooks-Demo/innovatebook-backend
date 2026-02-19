import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { vendorAPI } from "../utils/api";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, Upload, Download } from "lucide-react";
import { toast } from "sonner";

const Vendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await vendorAPI.upload(file);
      toast.success(
        `Successfully uploaded ${response.data.vendors_added} vendors`,
      );
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} rows had errors`);
      }
      loadVendors();
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

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="vendors-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "Inter", color: "#033F99" }}
          >
            Vendors
          </h1>
          <p className="text-gray-600">Manage your vendor database</p>
        </div>
        <div className="flex gap-3">
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
        </div>
      </div>

      <Card className="chart-container mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vendors..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-vendors-input"
            />
          </div>
        </CardContent>
      </Card>

      <div className="w-full overflow-x-auto"> {/* RESPONSIVE CHANGE */}
        <table className="data-table min-w-[800px]" data-testid="vendors-table"> {/* RESPONSIVE CHANGE */}
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Payable</th>
              <th>Overdue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr
                key={vendor.id}
                data-testid={`vendor-row-${vendor.id}`}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/vendors/${vendor.id}`)}
              >
                <td className="font-medium">{vendor.name}</td>
                <td>{vendor.contact_person}</td>
                <td>{vendor.email}</td>
                <td>{vendor.phone}</td>
                <td className="font-semibold" style={{ color: "#033F99" }}>
                  {formatCurrency(vendor.total_payable)}
                </td>
                <td className="font-semibold text-red-600">
                  {formatCurrency(vendor.overdue_amount)}
                </td>
                <td>
                  <span
                    className={`badge ${vendor.status === "Active"
                      ? "badge-success"
                      : "badge-danger"
                      }`}
                  >
                    {vendor.status}
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

export default Vendors;
