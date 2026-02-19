import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Calendar,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CollectionsElite = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/finance/collections`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCollections(response.data.collections || []);
    } catch (error) {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter((coll) => {
    const matchesSearch =
      coll.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coll.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || coll.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReceivable = filteredCollections.reduce(
    (sum, c) => sum + (c.amount_due || 0),
    0,
  );
  const collected = filteredCollections
    .filter((c) => c.status === "Collected")
    .reduce((sum, c) => sum + (c.amount_collected || 0), 0);
  const pending = totalReceivable - collected;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading collections...
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
              Collections
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Track and manage receivables collection
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
            <Download className="h-6 w-6" />
            <span className="text-lg">Export Report</span>
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#033F99]" />
              <input
                type="text"
                placeholder="Search by invoice or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="collected">Collected</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#022E75] rounded-2xl shadow-lg inline-block mb-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
            Total Receivable
          </p>
          <p className="text-3xl font-black text-[#033F99]">
            ₹{(totalReceivable / 100000).toFixed(2)}L
          </p>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-500/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg inline-block mb-3">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-1">
            Collected
          </p>
          <p className="text-3xl font-black text-emerald-900">
            ₹{(collected / 100000).toFixed(2)}L
          </p>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-amber-500/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl shadow-lg inline-block mb-3">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-1">
            Pending
          </p>
          <p className="text-3xl font-black text-amber-900">
            ₹{(pending / 100000).toFixed(2)}L
          </p>
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#033F99] mb-6">
          Collection Tracker
        </h2>
        {filteredCollections.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-[#033F99]/30 mx-auto mb-4" />
            <p className="text-[#033F99] text-lg">No collections found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#033F99] to-[#022E75] text-white">
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                    Amount Due
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                    Collected
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#033F99]/20">
                {filteredCollections.map((coll, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#C4D9F4]/30 transition-all"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-[#033F99]">
                      {coll.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99] font-medium">
                      {coll.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#033F99]">
                      {coll.due_date
                        ? new Date(coll.due_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#033F99]">
                      ₹{coll.amount_due?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                      ₹{coll.amount_collected?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${coll.status === "Collected"
                            ? "bg-emerald-100 text-emerald-700"
                            : coll.status === "Partial"
                              ? "bg-blue-100 text-blue-700"
                              : coll.status === "Overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {coll.status}
                      </span>
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

export default CollectionsElite;
