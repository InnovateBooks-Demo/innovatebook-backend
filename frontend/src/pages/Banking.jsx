import React, { useState, useEffect, useRef } from "react";
import { bankAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";

const Banking = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsRes, transRes] = await Promise.all([
        bankAPI.getAccounts(),
        bankAPI.getTransactions(),
      ]);
      setAccounts(accountsRes.data);
      setTransactions(transRes.data.slice(0, 10)); // Latest 10
    } catch (error) {
      toast.error("Failed to load banking data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await bankAPI.uploadTransactions(file);
      toast.success(
        `Successfully uploaded ${response.data.transactions_added} transactions`,
      );
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} rows had errors`);
      }
      loadData();
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
      const response = await bankAPI.downloadTransactionTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transaction_template.xlsx");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="banking-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "Inter", color: "#033F99" }}
          >
            Banking
          </h1>
          <p className="text-gray-600">Manage bank accounts and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            data-testid="download-transaction-template-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid="upload-transactions-btn"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Transactions"}
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

      {/* Bank Accounts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {accounts.map((account) => (
          <Card
            key={account.id}
            className="stat-card"
            data-testid={`bank-account-${account.id}`}
          >
            <CardHeader>
              <CardTitle
                className="text-lg font-semibold"
                style={{ color: "#033F99" }}
              >
                {account.bank_name}
              </CardTitle>
              <CardDescription>
                {account.account_type} - {account.account_number.slice(-4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance</span>
                  <span
                    className="text-xl font-semibold"
                    style={{ color: "#033F99" }}
                  >
                    {formatCurrency(account.current_balance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IFSC</span>
                  <span className="font-medium">{account.ifsc}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="chart-container" data-testid="recent-transactions-card">
        <CardHeader>
          <CardTitle
            className="text-xl font-semibold"
            style={{ color: "#033F99" }}
          >
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest 10 bank movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bank</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trans) => (
                  <tr
                    key={trans.id}
                    data-testid={`transaction-row-${trans.id}`}
                  >
                    <td>{formatDate(trans.transaction_date)}</td>
                    <td>{trans.bank_name}</td>
                    <td>{trans.description}</td>
                    <td>
                      <span
                        className={`badge ${trans.transaction_type === "Credit"
                            ? "badge-success"
                            : "badge-warning"
                          }`}
                      >
                        {trans.transaction_type}
                      </span>
                    </td>
                    <td
                      className={`font-semibold ${trans.transaction_type === "Credit"
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                    >
                      {formatCurrency(trans.amount)}
                    </td>
                    <td>
                      <span
                        className={`badge ${trans.status === "Matched"
                            ? "badge-success"
                            : "badge-warning"
                          }`}
                      >
                        {trans.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Banking;
