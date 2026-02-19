import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  AlertCircle,
  FileText,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BillsElite = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/finance/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(response.data.bills || []);
    } catch (error) {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || bill.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredBills.reduce(
    (sum, bill) => sum + (bill.total_amount || 0),
    0,
  );
  const paidAmount = filteredBills
    .filter((b) => b.status === "Paid")
    .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading bills...
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
              Vendor Bills
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Manage vendor bills and payables
            </p>
          </div>
          <button
            onClick={() => navigate("/finance/bills/create")}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            <span className="text-lg">Create Bill</span>
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#033F99]" />
              <input
                type="text"
                placeholder="Search bills by number or vendor..."
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#022E75] rounded-2xl shadow-lg inline-block mb-3">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
            Total Bills
          </p>
          <p className="text-3xl font-black text-[#033F99]">
            {filteredBills.length}
          </p>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-500/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg inline-block mb-3">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-1">
            Paid Amount
          </p>
          <p className="text-3xl font-black text-emerald-900">
            ₹{(paidAmount / 100000).toFixed(2)}L
          </p>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-red-500/50 shadow-xl">
          <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg inline-block mb-3">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">
            Pending Amount
          </p>
          <p className="text-3xl font-black text-red-900">
            ₹{(pendingAmount / 100000).toFixed(2)}L
          </p>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#033F99] mb-6">Bill List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#033F99] to-[#022E75] text-white">
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Bill #
                </th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-right font-bold text-sm uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left font-bold text-sm uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-center font-bold text-sm uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#033F99]/20">
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="hover:bg-[#C4D9F4]/30 transition-all"
                >
                  <td className="px-6 py-4 text-sm font-bold text-[#033F99]">
                    {bill.bill_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#033F99] font-medium">
                    {bill.vendor_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#033F99]">
                    {new Date(bill.bill_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-[#033F99]">
                    ₹{bill.total_amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${bill.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : bill.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : bill.status === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/finance/bills/${bill.id}`)}
                        className="p-2 hover:bg-[#033F99]/10 rounded-lg transition-all"
                      >
                        <Eye className="h-4 w-4 text-[#033F99]" />
                      </button>
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit className="h-4 w-4 text-blue-500" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillsElite;
