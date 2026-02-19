import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  AlertCircle,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BankingTransactionsElite = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/finance/banking/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setTransactions(response.data.transactions || []);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = txn.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || txn.type?.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCredits = filteredTransactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalDebits = filteredTransactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Bank Transactions
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              View and manage bank transactions
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
            <Download className="h-6 w-6" />
            <span className="text-lg">Export</span>
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#033F99]" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            >
              <option value="all">All Types</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-500/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg inline-block mb-3">
            <ArrowUpCircle className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-1">
            Total Credits
          </p>
          <p className="text-3xl font-black text-emerald-900">
            ₹{(totalCredits / 100000).toFixed(2)}L
          </p>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-red-500/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg inline-block mb-3">
            <ArrowDownCircle className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">
            Total Debits
          </p>
          <p className="text-3xl font-black text-red-900">
            ₹{(totalDebits / 100000).toFixed(2)}L
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#033F99] mb-6">
          Transaction History
        </h2>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-[#033F99]/30 mx-auto mb-4" />
            <p className="text-[#033F99] text-lg">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#033F99] to-[#022E75] text-white">
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#033F99]/20">
                {filteredTransactions.map((txn) => (
                  <tr
                    key={
                      txn.id ||
                      txn.transaction_id ||
                      `${txn.date}-${txn.description}-${txn.amount}`
                    }
                    className="hover:bg-[#C4D9F4]/30 transition-all"
                  >
                    <td className="px-6 py-4 text-sm text-[#033F99]">
                      {txn.date ? new Date(txn.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99] font-medium">
                      {txn.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${txn.type === "credit"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-bold ${txn.type === "credit"
                          ? "text-emerald-600"
                          : "text-red-600"
                        }`}
                    >
                      {txn.type === "credit" ? "+" : "-"}₹
                      {txn.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#033F99]">
                      ₹{txn.balance?.toLocaleString() || "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankingTransactionsElite;
