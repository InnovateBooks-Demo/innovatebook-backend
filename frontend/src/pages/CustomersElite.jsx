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
  Users,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CustomersElite = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/finance/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data.customers || []);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#3A4E63] border-r-transparent"></div>
          <p className="mt-4 text-[#3A4E63] font-semibold text-lg">
            Loading customers...
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
              className="text-4xl font-bold bg-gradient-to-r from-[#3A4E63] via-[#3A4E63] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Customers
            </h1>
            <p className="text-[#3A4E63] mt-2 font-medium text-lg">
              Manage your customer database
            </p>
          </div>
          <button
            onClick={() => navigate("/finance/customers/create")}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#3A4E63] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            <span className="text-lg">Add Customer</span>
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#3A4E63]/50 shadow-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#3A4E63]" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#3A4E63] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3A4E63]/50 text-[#3A4E63] font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#3A4E63]/50 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3A4E63]/10 to-transparent rounded-full -mr-32 -mt-32"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#3A4E63] uppercase tracking-wider mb-2">
              Total Customers
            </p>
            <p className="text-5xl font-black text-[#3A4E63]">
              {filteredCustomers.length}
            </p>
            <p className="text-sm text-emerald-700 mt-2">
              Active customer base
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#3A4E63] to-[#022E75] rounded-3xl shadow-2xl">
            <Users className="h-16 w-16 text-white" />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#3A4E63]/50 shadow-xl hover:shadow-2xl hover:border-[#3A4E63] transition-all cursor-pointer"
            onClick={() => navigate(`/finance/customers/${customer.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-[#3A4E63] to-[#022E75] rounded-2xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/finance/customers/${customer.id}/edit`);
                  }}
                  className="p-2 hover:bg-[rgba(3,63,153,0.08)] rounded-lg transition-all"
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#3A4E63] mb-2">
              {customer.customer_name}
            </h3>
            <div className="space-y-2">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-[#3A4E63]/70">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-[#3A4E63]/70">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[#3A4E63]/20">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#3A4E63]/70">Outstanding</span>
                <span className="text-sm font-bold text-[#3A4E63]">
                  ₹{(customer.outstanding || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersElite;
