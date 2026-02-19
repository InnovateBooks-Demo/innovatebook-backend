import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Edit, Download, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InvoiceDetailElite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/finance/invoices/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInvoice(response.data.invoice);
    } catch (error) {
      toast.error("Failed to load invoice");
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
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#033F99] text-xl font-bold">Invoice not found</p>
          <button
            onClick={() => navigate("/finance/invoices")}
            className="mt-4 px-6 py-3 bg-[#033F99] text-white rounded-2xl"
          >
            Back to Invoices
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
            onClick={() => navigate("/finance/invoices")}
            className="flex items-center gap-2 text-[#033F99] hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Invoices
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/finance/invoices/${id}/edit`)}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#033F99] text-[#033F99] font-bold rounded-2xl hover:bg-[#C4D9F4] transition-all"
            >
              <Edit className="h-5 w-5" />
              Edit
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl">
              <Download className="h-5 w-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              className="text-4xl font-bold text-[#033F99]"
              style={{ fontFamily: "Poppins" }}
            >
              {invoice.invoice_number}
            </h1>
            <p className="text-[#033F99] mt-2">
              Invoice Date:{" "}
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
            <p className="text-[#033F99]">
              Due Date: {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-6 py-3 rounded-full text-sm font-bold ${invoice.status === "Paid" ? "bg-emerald-100 text-emerald-700" : invoice.status === "Sent" ? "bg-blue-100 text-blue-700" : invoice.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
          >
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#033F99] mb-2">Bill To:</h3>
            <p className="text-[#033F99] font-medium">
              {invoice.customer_name}
            </p>
          </div>
        </div>

        <div className="border-t-2 border-[#033F99] pt-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#033F99] to-[#022E75] text-white">
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items &&
                invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#033F99]/20">
                    <td className="px-4 py-3 text-[#033F99]">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-center text-[#033F99]">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-[#033F99]">
                      ₹{item.rate?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-[#033F99] font-bold">
                      ₹{item.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border-t-2 border-[#033F99] pt-6">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-[#033F99] font-bold">Subtotal:</span>
              <span className="text-[#033F99] font-bold">
                ₹{invoice.subtotal?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#033F99] font-bold">Tax:</span>
              <span className="text-[#033F99] font-bold">
                ₹{invoice.tax?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-[#033F99]">
              <span className="text-[#033F99] font-bold text-xl">Total:</span>
              <span className="text-[#033F99] font-black text-2xl">
                ₹{invoice.total_amount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailElite;
