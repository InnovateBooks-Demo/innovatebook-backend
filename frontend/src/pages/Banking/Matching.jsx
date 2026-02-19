import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  bankAPI,
  customerAPI,
  vendorAPI,
  invoiceAPI,
  billAPI,
} from "../../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";

const BankingMatching = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [transactionId]);

  const loadData = async () => {
    try {
      const [transRes, transDetailsRes, customersRes, vendorsRes] =
        await Promise.all([
          bankAPI.getTransactions(),
          bankAPI.getTransactionDetails(transactionId),
          customerAPI.getAll(),
          vendorAPI.getAll(),
        ]);

      const trans = transRes.data.find((t) => t.id === transactionId);
      setTransaction(trans || transDetailsRes.data);
      setTransactionDetails(transDetailsRes.data);
      setCustomers(customersRes.data);
      setVendors(vendorsRes.data);

      // Only load AI suggestions if not fully matched
      if (
        !trans?.status ||
        trans.status === "Uncategorized" ||
        trans.status === "Partially Matched"
      ) {
        const aiSuggestionsRes =
          await bankAPI.getMatchSuggestions(transactionId);
        setAiSuggestions(aiSuggestionsRes.data);
      }

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  const handleEntitySelect = async (entityId, entityType) => {
    setSelectedEntity({ id: entityId, type: entityType });
    setSelectedMatches([]);

    try {
      if (entityType === "customer") {
        const response = await invoiceAPI.getAll();
        const customerInvoices = response.data.filter(
          (inv) =>
            inv.customer_id === entityId &&
            inv.status !== "Paid" &&
            inv.amount_outstanding > 0,
        );
        setPendingInvoices(customerInvoices);
      } else if (entityType === "vendor") {
        const response = await billAPI.getAll();
        const vendorBills = response.data.filter(
          (bill) =>
            bill.vendor_id === entityId &&
            bill.status !== "Paid" &&
            bill.amount_outstanding > 0,
        );
        setPendingBills(vendorBills);
      }
    } catch (error) {
      toast.error("Failed to load pending items");
    }
  };

  const handleMatchAmountChange = (itemId, amount, itemType) => {
    const numAmount = parseFloat(amount) || 0;
    const existingIndex = selectedMatches.findIndex(
      (m) => m.entity_id === itemId,
    );

    // Get remaining transaction amount
    const totalAlreadyMatched = selectedMatches
      .filter((m) => m.entity_id !== itemId)
      .reduce((sum, m) => sum + m.amount, 0);
    const remainingAmount = transaction.amount - totalAlreadyMatched;

    // Enforce: amount cannot exceed transaction remaining amount
    if (numAmount > remainingAmount) {
      toast.error(
        `Amount cannot exceed remaining transaction amount (₹${remainingAmount.toLocaleString("en-IN")})`,
      );
      return;
    }

    // Get the invoice/bill to check outstanding amount
    const items = itemType === "invoice" ? pendingInvoices : pendingBills;
    const item = items.find((i) => i.id === itemId);

    if (item && numAmount > item.amount_outstanding) {
      toast.error(
        `Amount cannot exceed invoice/bill outstanding amount (₹${item.amount_outstanding.toLocaleString("en-IN")})`,
      );
      return;
    }

    if (numAmount > 0) {
      const newMatch = {
        entity_type: itemType === "invoice" ? "invoice" : "bill",
        entity_id: itemId,
        amount: numAmount,
      };

      if (existingIndex >= 0) {
        const updated = [...selectedMatches];
        updated[existingIndex] = newMatch;
        setSelectedMatches(updated);
      } else {
        setSelectedMatches([...selectedMatches, newMatch]);
      }
    } else {
      if (existingIndex >= 0) {
        setSelectedMatches(
          selectedMatches.filter((_, i) => i !== existingIndex),
        );
      }
    }
  };

  const handleAISuggestionClick = async (suggestion) => {
    // Validate amount doesn't exceed transaction amount
    const matchAmount = Math.min(suggestion.pending_amount, transaction.amount);

    if (matchAmount > transaction.amount) {
      toast.error("Invoice amount exceeds transaction amount");
      return;
    }

    const match = {
      entity_type: suggestion.type,
      entity_id: suggestion.id,
      amount: matchAmount,
    };

    // Immediately match if user confirms
    try {
      await bankAPI.matchTransactionManual(transactionId, [match]);
      toast.success("Transaction matched successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to match transaction",
      );
    }
  };

  const handleConfirmMatch = async () => {
    if (selectedMatches.length === 0) {
      toast.error("Please select at least one item to match");
      return;
    }

    const totalMatched = selectedMatches.reduce((sum, m) => sum + m.amount, 0);

    if (totalMatched > transaction.amount) {
      toast.error(
        `Total matched amount (₹${totalMatched.toLocaleString("en-IN")}) exceeds transaction amount (₹${transaction.amount.toLocaleString("en-IN")})`,
      );
      return;
    }

    try {
      await bankAPI.matchTransactionManual(transactionId, selectedMatches);
      toast.success("Transaction matched successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to match transaction",
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

  const isFullyMatched = transaction?.status === "Matched";
  const totalMatched = selectedMatches.reduce((sum, m) => sum + m.amount, 0);
  const remainingAmount = transaction?.amount - totalMatched;

  // Filter customers/vendors based on search
  const filteredEntities = (
    transaction?.transaction_type === "Credit" ? customers : vendors
  ).filter((entity) =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8" data-testid="banking-matching-page">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Inter", color: "#033F99" }}
            >
              {isFullyMatched ? "Matched Transaction" : "Match Transaction"}
            </h1>
            <p className="text-gray-600">
              {isFullyMatched
                ? "View matched transaction details"
                : "Link transaction to invoices or bills"}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <Card className="chart-container mb-8">
        <CardHeader>
          <CardTitle style={{ color: "#033F99" }}>
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-semibold text-lg">
                {formatDate(transaction?.transaction_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="font-semibold text-lg">
                {transaction?.description}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <span
                className={`badge ${transaction?.transaction_type === "Credit"
                    ? "badge-success"
                    : "badge-warning"
                  }`}
              >
                {transaction?.transaction_type}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p
                className={`font-semibold text-2xl ${transaction?.transaction_type === "Credit"
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {formatCurrency(transaction?.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="font-medium">{transaction?.reference_no || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span
                className={`badge ${transaction?.status === "Matched"
                    ? "badge-success"
                    : transaction?.status === "Partially Matched"
                      ? "badge-warning"
                      : "badge-secondary"
                  }`}
              >
                {transaction?.status || "Uncategorized"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show Matched Details if Fully Matched */}
      {isFullyMatched && transactionDetails?.matched_details && (
        <Card
          className="chart-container mb-8"
          style={{
            background: "linear-gradient(135deg, #EEF4FF 0%, #FFFFFF 100%)",
          }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2"
              style={{ color: "#033F99" }}
            >
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Matched Invoice/Bill Details
            </CardTitle>
            <CardDescription>
              This transaction has been fully matched
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionDetails.matched_details.map((detail) => (
                <Card
                  key={detail.reference || detail.amount}
                  className="border-2 border-green-200"
                >
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Reference</p>
                        <p className="font-semibold text-lg">
                          {detail.reference}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Matched Amount
                        </p>
                        <p className="font-semibold text-lg text-green-600">
                          {formatCurrency(detail.amount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show AI Suggestions and Manual Matching ONLY if not fully matched */}
      {!isFullyMatched && (
        <>
          {/* Matching Progress */}
          {selectedMatches.length > 0 && (
            <Card
              className="chart-container mb-8"
              style={{
                background: "linear-gradient(135deg, #EEF4FF 0%, #FFFFFF 100%)",
              }}
            >
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Transaction Amount
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#033F99" }}
                    >
                      {formatCurrency(transaction?.amount)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Matched Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalMatched)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Remaining</p>
                    <p
                      className={`text-2xl font-bold ${remainingAmount === 0 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {formatCurrency(remainingAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${(totalMatched / transaction?.amount) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          <Card className="chart-container mb-8">
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2"
                style={{ color: "#033F99" }}
              >
                <Sparkles className="h-5 w-5" />
                AI-Powered Matching Suggestions
              </CardTitle>
              <CardDescription>
                Click on any suggestion to match instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiSuggestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No AI suggestions found</p>
                  <p className="text-sm mt-2">Try manual matching below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion) => (
                    <div
                      key={
                        suggestion.id ||
                        `${suggestion.type}-${suggestion.reference}-${suggestion.amount}`
                      }
                      className="p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                      onClick={() => handleAISuggestionClick(suggestion)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`badge ${suggestion.type === "invoice"
                                  ? "badge-success"
                                  : "badge-warning"
                                }`}
                            >
                              {suggestion.type === "invoice"
                                ? "Invoice"
                                : "Bill"}
                            </span>
                            <p className="font-semibold text-lg">
                              {suggestion.reference}
                            </p>
                          </div>
                          <p className="text-gray-700 font-medium mb-2">
                            {suggestion.party}
                          </p>
                          {suggestion.match_reason && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                {suggestion.match_reason}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Date: {formatDate(suggestion.date)}</span>
                            <span>
                              Total: {formatCurrency(suggestion.amount)}
                            </span>
                            <span className="font-semibold text-orange-600">
                              Pending:{" "}
                              {formatCurrency(suggestion.pending_amount)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden"
                                title={`Overall ${Math.round(suggestion.match_score)}% match`}
                              >
                                <div
                                  className={`h-full ${suggestion.match_score >= 90
                                      ? "bg-green-500"
                                      : suggestion.match_score >= 70
                                        ? "bg-blue-500"
                                        : suggestion.match_score >= 50
                                          ? "bg-yellow-500"
                                          : "bg-orange-500"
                                    }`}
                                  style={{
                                    width: `${suggestion.match_score}%`,
                                  }}
                                ></div>
                              </div>
                              <span
                                className={`text-sm font-bold ${suggestion.match_score >= 90
                                    ? "text-green-600"
                                    : suggestion.match_score >= 70
                                      ? "text-blue-600"
                                      : suggestion.match_score >= 50
                                        ? "text-yellow-600"
                                        : "text-orange-600"
                                  }`}
                              >
                                {Math.round(suggestion.match_score)}%
                              </span>
                            </div>
                            {(suggestion.name_match !== undefined ||
                              suggestion.amount_match !== undefined) && (
                                <div className="text-xs text-gray-600 space-y-0.5">
                                  {suggestion.name_match !== undefined && (
                                    <div className="flex justify-between gap-2">
                                      <span>Name:</span>
                                      <span className="font-semibold">
                                        {Math.round(suggestion.name_match)}%
                                      </span>
                                    </div>
                                  )}
                                  {suggestion.amount_match !== undefined && (
                                    <div className="flex justify-between gap-2">
                                      <span>Amount:</span>
                                      <span className="font-semibold">
                                        {Math.round(suggestion.amount_match)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                          <Button size="sm" variant="outline">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Match Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Matching */}
          <Card className="chart-container">
            <CardHeader>
              <CardTitle style={{ color: "#033F99" }}>
                Manual Matching
              </CardTitle>
              <CardDescription>
                Search and select{" "}
                {transaction?.transaction_type === "Credit"
                  ? "customer"
                  : "vendor"}{" "}
                to view pending items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Searchable Customer/Vendor Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {transaction?.transaction_type === "Credit"
                      ? "Search Customer"
                      : "Search Vendor"}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={`Type to search ${transaction?.transaction_type === "Credit" ? "customer" : "vendor"}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {searchTerm && filteredEntities.length > 0 && (
                    <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                      {filteredEntities.map((entity) => (
                        <div
                          key={entity.id}
                          className={`p-3 cursor-pointer hover:bg-blue-50 ${selectedEntity?.id === entity.id
                              ? "bg-blue-100 border-l-4 border-blue-500"
                              : ""
                            }`}
                          onClick={() => {
                            handleEntitySelect(
                              entity.id,
                              transaction?.transaction_type === "Credit"
                                ? "customer"
                                : "vendor",
                            );
                            setSearchTerm(entity.name);
                          }}
                        >
                          <p className="font-medium">{entity.name}</p>
                          <p className="text-sm text-gray-600">
                            {entity.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending Invoices/Bills */}
                {selectedEntity && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Pending{" "}
                      {transaction?.transaction_type === "Credit"
                        ? "Invoices"
                        : "Bills"}
                    </Label>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      {(transaction?.transaction_type === "Credit"
                        ? pendingInvoices
                        : pendingBills
                      ).length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No pending{" "}
                          {transaction?.transaction_type === "Credit"
                            ? "invoices"
                            : "bills"}{" "}
                          found
                        </div>
                      ) : (
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Reference</th>
                              <th>Total Amount</th>
                              <th>Pending Amount</th>
                              <th>Amount to Match</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(transaction?.transaction_type === "Credit"
                              ? pendingInvoices
                              : pendingBills
                            ).map((item) => {
                              const matchedItem = selectedMatches.find(
                                (m) => m.entity_id === item.id,
                              );
                              const maxAllowed = Math.min(
                                item.amount_outstanding,
                                remainingAmount + (matchedItem?.amount || 0),
                              );

                              return (
                                <tr key={item.id}>
                                  <td>
                                    {formatDate(
                                      transaction?.transaction_type === "Credit"
                                        ? item.invoice_date
                                        : item.bill_date,
                                    )}
                                  </td>
                                  <td className="font-medium">
                                    {transaction?.transaction_type === "Credit"
                                      ? item.invoice_number
                                      : item.bill_number}
                                  </td>
                                  <td>{formatCurrency(item.total_amount)}</td>
                                  <td className="font-semibold text-orange-600">
                                    {formatCurrency(item.amount_outstanding)}
                                  </td>
                                  <td>
                                    <Input
                                      type="number"
                                      placeholder="Enter amount"
                                      max={maxAllowed}
                                      value={matchedItem?.amount || ""}
                                      onChange={(e) =>
                                        handleMatchAmountChange(
                                          item.id,
                                          e.target.value,
                                          transaction?.transaction_type ===
                                            "Credit"
                                            ? "invoice"
                                            : "bill",
                                        )
                                      }
                                      className="w-40"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Max: {formatCurrency(maxAllowed)}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMatches([]);
                      setSelectedEntity(null);
                      setSearchTerm("");
                      setPendingInvoices([]);
                      setPendingBills([]);
                    }}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={handleConfirmMatch}
                    disabled={selectedMatches.length === 0}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Confirm Match ({selectedMatches.length}{" "}
                    {selectedMatches.length === 1 ? "item" : "items"})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BankingMatching;
