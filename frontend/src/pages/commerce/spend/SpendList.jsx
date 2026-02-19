import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SpendList = () => {
  const [spends, setSpends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchSpends();
  }, [statusFilter]);

  const fetchSpends = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/spend${params}`,
      );
      setSpends(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch spends:", error);
      toast.error("Failed to load expenses");
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;
    try {
      await axios.delete(`${BACKEND_URL}/api/commerce/spend/${expenseId}`);
      toast.success("Expense deleted successfully");
      fetchSpends();
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
      Submitted: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      Approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
      },
      Paid: { bg: "bg-purple-100", text: "text-purple-700", icon: DollarSign },
      Rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const badgeConfig = config[status] || config["Draft"];
    const Icon = badgeConfig.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badgeConfig.bg} ${badgeConfig.text}`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const filteredSpends = spends.filter(
    (spend) =>
      spend.expense_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spend.expense_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpends = filteredSpends.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSpends.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Expense Management
          </h2>
          <p className="text-slate-600 mt-1">
            Track and manage employee expenses
          </p>
        </div>
        <Link to="/commerce/spend/new">
          <Button className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99]700 hover:from-[#033F99]700 hover:to-[#033F99]800">
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#033F99]"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total",
            value: spends.length,
            color: "text-slate-900",
            icon: Wallet,
          },
          {
            label: "Draft",
            value: spends.filter((s) => s.expense_status === "Draft").length,
            color: "text-slate-600",
            icon: Clock,
          },
          {
            label: "Submitted",
            value: spends.filter((s) => s.expense_status === "Submitted")
              .length,
            color: "text-[#0147CC]",
            icon: AlertCircle,
          },
          {
            label: "Approved",
            value: spends.filter((s) => s.expense_status === "Approved").length,
            color: "text-emerald-600",
            icon: CheckCircle,
          },
          {
            label: "Paid",
            value: spends.filter((s) => s.expense_status === "Paid").length,
            color: "text-purple-600",
            icon: DollarSign,
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-4 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Expense ID <ArrowUpDown className="h-3 w-3 inline" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-5 h-5 border-2 border-[#033F99] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : currentSpends.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No expenses found
                  </td>
                </tr>
              ) : (
                currentSpends.map((spend) => (
                  <tr
                    key={spend.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/commerce/spend/${spend.expense_id}`}
                        className="text-sm font-medium text-[#033F99] hover:text-[#033F99]700"
                      >
                        {spend.expense_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {spend.expense_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        ₹{(spend.net_expense / 1000).toFixed(1)}K
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(spend.expense_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/commerce/spend/${spend.expense_id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/commerce/spend/${spend.expense_id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(spend.expense_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SpendList;
