import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Edit, Mail, Phone, MapPin } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CustomerDetailElite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/finance/customers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCustomer(response.data.customer);
    } catch (error) {
      toast.error("Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading customer...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#033F99] text-xl font-bold">Customer not found</p>
          <button
            onClick={() => navigate("/finance/customers")}
            className="mt-4 px-6 py-3 bg-[#033F99] text-white rounded-2xl"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/finance/customers")}
            className="flex items-center gap-2 text-[#033F99] hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Customers
          </button>
          <button
            onClick={() => navigate(`/finance/customers/${id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#033F99] text-[#033F99] font-bold rounded-2xl hover:bg-[#C4D9F4] transition-all"
          >
            <Edit className="h-5 w-5" />
            Edit Customer
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl mb-6">
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-[#033F99] mb-2"
            style={{ fontFamily: "Poppins" }}
          >
            {customer.customer_name}
          </h1>
          <p className="text-[#033F99]">Customer ID: {customer.id}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#033F99]" />
              <div>
                <p className="text-sm text-[#033F99]/70">Email</p>
                <p className="text-[#033F99] font-medium">
                  {customer.email || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#033F99]" />
              <div>
                <p className="text-sm text-[#033F99]/70">Phone</p>
                <p className="text-[#033F99] font-medium">
                  {customer.phone || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#033F99] mt-1" />
              <div>
                <p className="text-sm text-[#033F99]/70">Address</p>
                <p className="text-[#033F99] font-medium">
                  {customer.address || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#033F99]/70">GSTIN</p>
              <p className="text-[#033F99] font-medium">
                {customer.gstin || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#033F99]/70">Outstanding</p>
              <p className="text-2xl font-black text-[#033F99]">
                ₹{customer.outstanding?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#033F99]/70">Credit Limit</p>
              <p className="text-[#033F99] font-medium">
                ₹{customer.credit_limit?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailElite;
