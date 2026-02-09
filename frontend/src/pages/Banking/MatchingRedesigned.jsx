import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bankAPI, invoiceAPI, billAPI } from "../../utils/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  Loader2,
  Link as LinkIcon,
  FileText,
  Receipt,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const MatchingRedesigned = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transaction");

  const [transaction, setTransaction] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("suggestions");

  useEffect(() => {
    loadData();
  }, [transactionId]);

  // Auto-switch tabs based on transaction type
  useEffect(() => {
    if (transaction) {
      // Credit transactions should match with Invoices
      // Debit transactions should match with Bills
      if (suggestions.length === 0) {
        if (transaction.transaction_type === "Credit") {
          setActiveTab("invoices");
        } else if (transaction.transaction_type === "Debit") {
          setActiveTab("bills");
        }
      }
    }
  }, [transaction, suggestions]);

  const loadData = async () => {
    try {
      const transRes = await bankAPI.getTransactions();

      if (transactionId) {
        const trans = transRes.data.find((t) => t.id === transactionId);
        setTransaction(trans);

        if (trans && !(trans.is_matched || trans.status === "Matched")) {
          // Load suggestions
          try {
            const suggestionsRes =
              await bankAPI.getMatchSuggestions(transactionId);
            setSuggestions(suggestionsRes.data || []);
          } catch (error) {
            console.log("No suggestions available");
          }
        }
      }

      // Load all invoices and bills for manual matching
      const [invoicesRes, billsRes] = await Promise.all([
        invoiceAPI.getAll(),
        billAPI.getAll(),
      ]);

      setInvoices(invoicesRes.data || []);
      setBills(billsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load matching data");
      setLoading(false);
    }
  };

  const handleMatch = async (entityType, entityId) => {
    if (!transaction) return;

    setMatching(true);
    try {
      await bankAPI.matchTransaction(transaction.id, entityType, entityId);
      toast.success("Transaction matched successfully");
      navigate("/banking/transactions");
    } catch (error) {
      toast.error("Failed to match transaction");
      setMatching(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <LinkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Transaction Selected
          </h3>
          <p className="text-gray-600 mb-6">
            Please select a transaction from the transactions page
          </p>
          <Button onClick={() => navigate("/banking/transactions")}>
            Go to Transactions
          </Button>
        </Card>
      </div>
    );
  }

  const filteredInvoices = invoices.filter(
    (inv) =>
      !inv.is_matched &&
      (inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const filteredBills = bills.filter(
    (bill) =>
      !bill.is_matched &&
      (bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/banking/transactions")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1
                  className="text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Match Transaction
                </h1>
                <p
                  className="text-gray-600 mt-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Link transaction to invoices or bills
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transaction Details */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white border-0 shadow-md sticky top-8">
              <h3
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Transaction Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(transaction.transaction_date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.description || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Reference</p>
                  <p className="text-sm font-mono font-medium text-gray-900">
                    {transaction.reference_number || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        transaction.transaction_type === "Credit"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.transaction_type === "Credit" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {transaction.transaction_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {transaction.transaction_type === "Credit"
                      ? "→ Match with Invoices (Customer Payments)"
                      : "→ Match with Bills (Vendor Payments)"}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <p
                    className={`text-2xl font-bold ${transaction.transaction_type === "Credit" ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>

                {(transaction.is_matched ||
                  transaction.status === "Matched") && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Already Matched
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Matching Options */}
          <div className="lg:col-span-2">
            {transaction.is_matched || transaction.status === "Matched" ? (
              <Card className="p-12 text-center bg-white border-0 shadow-md">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Transaction Already Matched
                </h3>
                <p className="text-gray-600 mb-6">
                  This transaction has been linked to a document
                </p>
                <Button onClick={() => navigate("/banking/transactions")}>
                  Back to Transactions
                </Button>
              </Card>
            ) : (
              <>
                {/* Matching Instructions */}
                <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">i</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Matching Guidelines
                      </h4>
                      <p className="text-sm text-blue-800">
                        <strong>
                          {transaction.transaction_type === "Credit"
                            ? "Credit Transaction"
                            : "Debit Transaction"}
                          :
                        </strong>
                        {transaction.transaction_type === "Credit"
                          ? " Match this transaction with an Invoice (customer payment received)"
                          : " Match this transaction with a Bill (vendor payment made)"}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-blue-700">
                        <p>
                          • <strong>AI Powered:</strong> Review smart
                          suggestions with confidence scores
                        </p>
                        <p>
                          • <strong>Manual Matching:</strong> Search and select
                          from all available documents
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={
                      activeTab === "suggestions" ? "default" : "outline"
                    }
                    onClick={() => setActiveTab("suggestions")}
                    style={
                      activeTab === "suggestions"
                        ? { backgroundColor: "#3A4E63" }
                        : {}
                    }
                  >
                    AI Powered Suggestions ({suggestions.length})
                  </Button>
                  {transaction.transaction_type === "Credit" && (
                    <Button
                      variant={activeTab === "invoices" ? "default" : "outline"}
                      onClick={() => setActiveTab("invoices")}
                      style={
                        activeTab === "invoices"
                          ? { backgroundColor: "#3A4E63" }
                          : {}
                      }
                    >
                      Manual - Invoices ({filteredInvoices.length})
                    </Button>
                  )}
                  {transaction.transaction_type === "Debit" && (
                    <Button
                      variant={activeTab === "bills" ? "default" : "outline"}
                      onClick={() => setActiveTab("bills")}
                      style={
                        activeTab === "bills"
                          ? { backgroundColor: "#3A4E63" }
                          : {}
                      }
                    >
                      Manual - Bills ({filteredBills.length})
                    </Button>
                  )}
                </div>

                {/* Suggestions Tab */}
                {activeTab === "suggestions" && (
                  <div className="space-y-4">
                    {suggestions.length === 0 ? (
                      <Card className="p-12 text-center bg-white border-0 shadow-md">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No AI Suggestions Found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Our AI couldn't find confident matches for this
                          transaction
                        </p>
                        <p className="text-sm text-gray-500">
                          Try manually matching from{" "}
                          {transaction.transaction_type === "Credit"
                            ? "Invoices"
                            : "Bills"}{" "}
                          tab
                        </p>
                      </Card>
                    ) : (
                      <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-800 font-medium">
                            ✨ {suggestions.length} AI-powered match
                            {suggestions.length > 1 ? "es" : ""} found based on
                            amount, date, and description
                          </p>
                        </div>
                        {suggestions.map((suggestion) => (
                          <Card
                            key={
                              suggestion.entity_id || suggestion.entity_number
                            }
                            className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {suggestion.entity_number}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {suggestion.entity_name}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-500">
                                      Date: {formatDate(suggestion.date)}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(suggestion.amount)}
                                    </span>
                                    {suggestion.confidence && (
                                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                        {suggestion.confidence}% Match
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  handleMatch(
                                    suggestion.entity_type,
                                    suggestion.entity_id,
                                  )
                                }
                                disabled={matching}
                                style={{ backgroundColor: "#3A4E63" }}
                              >
                                <LinkIcon className="h-4 w-4 mr-2" />
                                {matching ? "Matching..." : "Match"}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* Invoices Tab */}
                {activeTab === "invoices" && (
                  <div className="space-y-4">
                    <Card className="p-4 bg-white border-0 shadow-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search invoices..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </Card>

                    {filteredInvoices.length === 0 ? (
                      <Card className="p-12 text-center bg-white border-0 shadow-md">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No Invoices Available
                        </h3>
                        <p className="text-gray-600">
                          All invoices are already matched
                        </p>
                      </Card>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <Card
                          key={invoice.id}
                          className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {invoice.invoice_number}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {invoice.customer_name}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-sm text-gray-500">
                                    Date: {formatDate(invoice.invoice_date)}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(invoice.total_amount)}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      invoice.status === "Paid"
                                        ? "bg-green-100 text-green-700"
                                        : invoice.status === "Partially Paid"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {invoice.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleMatch("invoice", invoice.id)}
                              disabled={matching}
                              style={{ backgroundColor: "#3A4E63" }}
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              {matching ? "Matching..." : "Match"}
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {/* Bills Tab */}
                {activeTab === "bills" && (
                  <div className="space-y-4">
                    <Card className="p-4 bg-white border-0 shadow-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search bills..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </Card>

                    {filteredBills.length === 0 ? (
                      <Card className="p-12 text-center bg-white border-0 shadow-md">
                        <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No Bills Available
                        </h3>
                        <p className="text-gray-600">
                          All bills are already matched
                        </p>
                      </Card>
                    ) : (
                      filteredBills.map((bill) => (
                        <Card
                          key={bill.id}
                          className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Receipt className="h-6 w-6 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {bill.bill_number}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {bill.vendor_name}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-sm text-gray-500">
                                    Date: {formatDate(bill.bill_date)}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(bill.total_amount)}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      bill.status === "Paid"
                                        ? "bg-green-100 text-green-700"
                                        : bill.status === "Approved"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {bill.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleMatch("bill", bill.id)}
                              disabled={matching}
                              style={{ backgroundColor: "#3A4E63" }}
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              {matching ? "Matching..." : "Match"}
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingRedesigned;
