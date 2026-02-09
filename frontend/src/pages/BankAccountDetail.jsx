import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bankAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Upload, Download, Link as LinkIcon } from "lucide-react";

const BankAccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [bank, setBank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [matchSuggestions, setMatchSuggestions] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [matchAmount, setMatchAmount] = useState("");

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

  const handleMatchTransaction = async (transaction) => {
    setSelectedTransaction(transaction);
    try {
      const response = await bankAPI.getMatchSuggestions(transaction.id);
      setMatchSuggestions(response.data);
      setShowMatchDialog(true);
    } catch (error) {
      toast.error("Failed to load suggestions");
    }
  };

  const handleConfirmMatch = async () => {
    if (!selectedEntity || !matchAmount) {
      toast.error("Please select entity and enter amount");
      return;
    }

    try {
      await bankAPI.matchTransaction(
        selectedTransaction.id,
        selectedEntity.type,
        selectedEntity.id,
      );
      toast.success("Transaction matched successfully");
      setShowMatchDialog(false);
      setSelectedEntity(null);
      setMatchAmount("");
      loadData();
    } catch (error) {
      toast.error("Failed to match transaction");
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

  const categorizedTransactions = transactions.filter(
    (t) => t.status === "Matched",
  );
  const uncategorizedTransactions = transactions.filter(
    (t) => t.status !== "Matched",
  );

  return (
    <div className="p-8" data-testid="bank-detail-page">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/banking")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Inter", color: "#3A4E63" }}
            >
              {bank?.bank_name}
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold" style={{ color: "#3A4E63" }}>
              {formatCurrency(bank?.current_balance)}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Categorized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {categorizedTransactions.length}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
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

      <Card className="chart-container">
        <Tabs defaultValue="uncategorized">
          <CardHeader>
            <TabsList>
              <TabsTrigger value="uncategorized">
                Uncategorized ({uncategorizedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="categorized">
                Categorized ({categorizedTransactions.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="uncategorized">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Reference</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uncategorizedTransactions.map((trans) => (
                      <tr key={trans.id}>
                        <td>{formatDate(trans.transaction_date)}</td>
                        <td>{trans.description}</td>
                        <td>
                          <span
                            className={`badge ${
                              trans.transaction_type === "Credit"
                                ? "badge-success"
                                : "badge-warning"
                            }`}
                          >
                            {trans.transaction_type}
                          </span>
                        </td>
                        <td
                          className={`font-semibold ${
                            trans.transaction_type === "Credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(trans.amount)}
                        </td>
                        <td>{trans.reference_no}</td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMatchTransaction(trans)}
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            Match
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="categorized">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Matched With</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorizedTransactions.map((trans) => (
                      <tr key={trans.id}>
                        <td>{formatDate(trans.transaction_date)}</td>
                        <td>{trans.description}</td>
                        <td>
                          <span
                            className={`badge ${
                              trans.transaction_type === "Credit"
                                ? "badge-success"
                                : "badge-warning"
                            }`}
                          >
                            {trans.transaction_type}
                          </span>
                        </td>
                        <td
                          className={`font-semibold ${
                            trans.transaction_type === "Credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(trans.amount)}
                        </td>
                        <td>{trans.linked_entity || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Match Transaction</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.description} -{" "}
              {formatCurrency(selectedTransaction?.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Match With</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto mt-2">
                {matchSuggestions.map((suggestion, index) => (
                  <div
                    key={`item-${index}`}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedEntity?.id === suggestion.id
                        ? "bg-[rgba(3,63,153,0.08)]"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedEntity(suggestion);
                      setMatchAmount(suggestion.amount.toString());
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{suggestion.reference}</p>
                        <p className="text-sm text-gray-600">
                          {suggestion.party}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold"
                          style={{ color: "#3A4E63" }}
                        >
                          {formatCurrency(suggestion.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.round(suggestion.match_score)}% match
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedEntity && (
              <div>
                <Label>Amount to Match</Label>
                <Input
                  type="number"
                  value={matchAmount}
                  onChange={(e) => setMatchAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleConfirmMatch}
              disabled={!selectedEntity}
            >
              Confirm Match
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankAccountDetail;
