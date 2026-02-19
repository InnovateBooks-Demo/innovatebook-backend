import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { billAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, Upload, Download, Plus } from "lucide-react";
import { toast } from "sonner";

const Bills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await billAPI.getAll();
      setBills(response.data);
    } catch (error) {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await billAPI.upload(file);
      toast.success(`Successfully uploaded ${response.data.bills_added} bills`);
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} rows had errors`);
      }
      loadBills();
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
      const response = await billAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bill_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template downloaded");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  const filteredBills = bills.filter(
    (bill) =>
      bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="bills-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "Inter", color: "#033F99" }}
          >
            Bills
          </h1>
          <p className="text-gray-600">Track all vendor bills</p>
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
          <Button data-testid="add-bill-btn">
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </div>
      </div>

      <Card className="chart-container mb-6">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bills..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-bills-input"
            />
          </div>
        </div>
      </Card>

      <div className="table-wrapper">
        <table className="data-table" data-testid="bills-table">
          <thead>
            <tr>
              <th>Bill #</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Outstanding</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr
                key={bill.id}
                data-testid={`bill-row-${bill.id}`}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/bills/${bill.id}`)}
              >
                <td className="font-medium">{bill.bill_number}</td>
                <td>{bill.vendor_name}</td>
                <td>{formatDate(bill.bill_date)}</td>
                <td>{formatDate(bill.due_date)}</td>
                <td className="font-semibold">
                  {formatCurrency(bill.total_amount)}
                </td>
                <td className="font-semibold text-green-600">
                  {formatCurrency(bill.amount_paid)}
                </td>
                <td className="font-semibold text-red-600">
                  {formatCurrency(bill.amount_outstanding)}
                </td>
                <td>
                  <span className="badge badge-info">
                    {bill.expense_category}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${bill.status === "Paid"
                        ? "badge-success"
                        : bill.status === "Partially Paid"
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                  >
                    {bill.status}
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

export default Bills;
