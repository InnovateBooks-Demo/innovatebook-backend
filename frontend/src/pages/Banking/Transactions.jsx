import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bankAPI } from "../../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const BankingTransactions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [bank, setBank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [showDeleteTransDialog, setShowDeleteTransDialog] = useState(false);
  const [showReconcileDialog, setShowReconcileDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [banksRes, transRes] = await Promise.all([
        bankAPI.getAccounts(),
        bankAPI.getTransactions(),
      ]);

      const currentBank = banksRes.data.find((b) => b.id === id);
      setBank(currentBank);

      const bankTransactions = transRes.data.filter(
        (t) => t.bank_account_id === id,
      );
      setTransactions(bankTransactions);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load data");
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
      toast.success("Downloading updated template...");
      const response = await bankAPI.downloadTransactionTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transaction_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    if (selectedTransaction.is_reconciled) {
      toast.error(
        "Cannot delete reconciled transaction. Please de-reconcile first.",
      );
      return;
    }

    try {
      await bankAPI.deleteTransaction(selectedTransaction.id);
      toast.success("Transaction deleted successfully");
      setShowDeleteTransDialog(false);
      setSelectedTransaction(null);
      loadData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const handleDematchTransaction = async (transaction) => {
    if (!transaction) return;

    if (transaction.is_reconciled) {
      toast.error(
        "Cannot dematch reconciled transaction. Please de-reconcile first.",
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to dematch this transaction? This will reverse the payment recorded for ${transaction.linked_entity}.`,
      )
    ) {
      return;
    }

    try {
      await bankAPI.dematchTransaction(transaction.id);
      toast.success("Transaction dematched successfully");
      loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to dematch transaction",
      );
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const categorizedTransactions = transactions.filter(
    (t) => t.status === "Matched",
  );
  const uncategorizedTransactions = transactions.filter(
    (t) => t.status !== "Matched",
  );

  let filteredTransactions = transactions;

  // Apply type filter
  if (filterType === "categorized") {
    filteredTransactions = categorizedTransactions;
  } else if (filterType === "uncategorized") {
    filteredTransactions = uncategorizedTransactions;
  } else if (filterType === "credit") {
    filteredTransactions = transactions.filter(
      (t) => t.transaction_type === "Credit",
    );
  } else if (filterType === "debit") {
    filteredTransactions = transactions.filter(
      (t) => t.transaction_type === "Debit",
    );
  }

  // Apply date filter
  if (dateFilter.start && dateFilter.end) {
    filteredTransactions = filteredTransactions.filter((t) => {
      const transDate = new Date(t.transaction_date);
      const startDate = new Date(dateFilter.start);
      const endDate = new Date(dateFilter.end);
      return transDate >= startDate && transDate <= endDate;
    });
  }

  return (
    <div className="p-8" data-testid="banking-transactions-page">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/banking")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Inter", color: "#033F99" }}
            >
              {bank?.bank_name} Transactions
            </h1>
            <p className="text-gray-600">
              {bank?.account_type} - {bank?.account_number}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
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

      {/* KPI Cards - Clickable */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold" style={{ color: "#033F99" }}>
              {formatCurrency(bank?.current_balance)}
            </p>
          </CardContent>
        </Card>

        <Card
          className="stat-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setFilterType("all")}
          style={{
            borderColor: filterType === "all" ? "#033F99" : "transparent",
            borderWidth: "2px",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold" style={{ color: "#033F99" }}>
              {transactions.length}
            </p>
          </CardContent>
        </Card>

        <Card
          className="stat-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setFilterType("categorized")}
          style={{
            borderColor:
              filterType === "categorized" ? "#10b981" : "transparent",
            borderWidth: "2px",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Categorized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {categorizedTransactions.length}
            </p>
          </CardContent>
        </Card>

        <Card
          className="stat-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setFilterType("uncategorized")}
          style={{
            borderColor:
              filterType === "uncategorized" ? "#f97316" : "transparent",
            borderWidth: "2px",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Uncategorized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-orange-600">
              {uncategorizedTransactions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="chart-container mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-3">
              <div>
                <Label className="text-sm mb-1 block">Start Date</Label>
                <Input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, start: e.target.value })
                  }
                  className="w-40"
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">End Date</Label>
                <Input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, end: e.target.value })
                  }
                  className="w-40"
                />
              </div>
              {(dateFilter.start || dateFilter.end) && (
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setDateFilter({ start: "", end: "" })}
                >
                  Clear Filter
                </Button>
              )}
            </div>
            <Button onClick={() => setShowReconcileDialog(true)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Reconcile Transactions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="chart-container">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle style={{ color: "#033F99" }}>
              Transaction History
              {filterType !== "all" &&
                ` - ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button
                variant={filterType === "credit" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("credit")}
              >
                Credits
              </Button>
              <Button
                variant={filterType === "debit" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("debit")}
              >
                Debits
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((trans) => (
                  <tr
                    key={trans.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/banking/transaction/${trans.id}`)}
                  >
                    <td>{formatDate(trans.transaction_date)}</td>
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
                    <td>{trans.reference_no}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge ${trans.status === "Matched"
                              ? "badge-success"
                              : trans.status === "Partially Matched"
                                ? "badge-warning"
                                : "badge-secondary"
                            }`}
                        >
                          {trans.status || "Uncategorized"}
                        </span>
                        {trans.is_reconciled && (
                          <CheckCircle2
                            className="h-4 w-4 text-green-600"
                            title="Reconciled"
                          />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {(trans.status === "Matched" ||
                          trans.status === "Partially Matched") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDematchTransaction(trans);
                              }}
                              disabled={trans.is_reconciled}
                              className="text-orange-600 hover:text-orange-700"
                              title="Dematch Transaction"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(trans);
                            setShowDeleteTransDialog(true);
                          }}
                          disabled={trans.is_reconciled}
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
        </CardContent>
      </Card>

      {/* Delete Transaction Dialog */}
      <Dialog
        open={showDeleteTransDialog}
        onOpenChange={setShowDeleteTransDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteTransDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTransaction}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reconcile Dialog - Redesigned */}
      <Dialog open={showReconcileDialog} onOpenChange={setShowReconcileDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: "#033F99" }}>
              Reconcile Transactions
            </DialogTitle>
            <DialogDescription className="text-base">
              Review and reconcile selected transactions for the specified
              period
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Period Summary */}
            <Card
              style={{ background: "#EEF4FF", border: "2px solid #033F99" }}
            >
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Period</p>
                    <p className="font-semibold text-lg">
                      {dateFilter.start && dateFilter.end
                        ? `${formatDate(dateFilter.start)} - ${formatDate(dateFilter.end)}`
                        : "All Transactions"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Transactions
                    </p>
                    <p
                      className="font-bold text-2xl"
                      style={{ color: "#033F99" }}
                    >
                      {filteredTransactions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-bold text-2xl text-green-600">
                      {formatCurrency(
                        filteredTransactions.reduce(
                          (sum, t) =>
                            sum +
                            (t.transaction_type === "Credit"
                              ? t.amount
                              : -t.amount),
                          0,
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Breakdown */}
            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#033F99" }}>
                Transaction Breakdown
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Credits</span>
                      <span className="font-semibold text-green-600">
                        {
                          filteredTransactions.filter(
                            (t) => t.transaction_type === "Credit",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(
                          filteredTransactions
                            .filter((t) => t.transaction_type === "Credit")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Debits</span>
                      <span className="font-semibold text-red-600">
                        {
                          filteredTransactions.filter(
                            (t) => t.transaction_type === "Debit",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(
                          filteredTransactions
                            .filter((t) => t.transaction_type === "Debit")
                            .reduce((sum, t) => sum + t.amount, 0),
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">
                    Important Notice
                  </p>
                  <p className="text-sm text-yellow-700">
                    Once reconciled, these transactions will be locked and
                    cannot be edited or deleted. You can de-reconcile them later
                    if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowReconcileDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const transIds = filteredTransactions.map((t) => t.id);
                  await bankAPI.reconcileTransactions(transIds, dateFilter);
                  toast.success(
                    `Successfully reconciled ${transIds.length} transaction(s)`,
                  );
                  setShowReconcileDialog(false);
                  loadData();
                } catch (error) {
                  toast.error("Failed to reconcile transactions");
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Reconciliation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankingTransactions;
