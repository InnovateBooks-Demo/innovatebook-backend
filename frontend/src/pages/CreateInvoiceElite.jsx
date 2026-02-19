import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreateInvoiceElite = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    notes: "",
  });

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
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find((c) => c.id === customerId);
    setFormData({
      ...formData,
      customer_id: customerId,
      customer_name: customer ? customer.customer_name : "",
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = value;
    if (field === "quantity" || field === "rate") {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    setFormData({ ...formData, items });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      toast.error("Please select a customer");
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].description) {
      toast.error("Please add at least one item");
      return;
    }

    setLoading(true);
    try {
      const { subtotal, tax, total } = calculateTotals();
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/api/finance/invoices`,
        {
          ...formData,
          subtotal,
          tax,
          total_amount: total,
          amount_paid: 0,
          status: "Draft",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Invoice created successfully!");
        navigate(`/finance/invoices/${response.data.invoice.id}`);
      }
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Create Invoice
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Generate a new customer invoice
            </p>
          </div>
          <button
            onClick={() => navigate("/finance/invoices")}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#033F99] text-[#033F99] font-bold rounded-2xl hover:bg-[#C4D9F4] transition-all"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-[#033F99] mb-6">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#033F99] mb-2">
                Customer *
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={handleCustomerChange}
                className="w-full px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#033F99] mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_date: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#033F99] mb-2">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#033F99]">Line Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              Add Item
            </button>
          </div>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div
                key={`item-${index}`}
                className="grid grid-cols-12 gap-4 items-end"
              >
                <div className="col-span-5">
                  <label className="block text-sm font-bold text-[#033F99] mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#033F99] mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#033F99] mb-2">
                    Rate
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "rate",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#033F99] mb-2">
                    Amount
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`₹${item.amount.toLocaleString()}`}
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-[#033F99] rounded-2xl text-[#033F99] font-bold"
                  />
                </div>
                <div className="col-span-1">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-8 border-t-2 border-[#033F99] pt-6">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#033F99] font-bold">Subtotal:</span>
                <span className="text-[#033F99] font-bold text-xl">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#033F99] font-bold">Tax (18%):</span>
                <span className="text-[#033F99] font-bold text-xl">
                  ₹{tax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-[#033F99]">
                <span className="text-[#033F99] font-bold text-lg">Total:</span>
                <span className="text-[#033F99] font-black text-2xl">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-[#033F99] mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 bg-white border-2 border-[#033F99] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#033F99]/50 text-[#033F99] font-medium"
            placeholder="Additional notes..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/finance/invoices")}
            className="px-8 py-4 bg-white border-2 border-[#033F99] text-[#033F99] font-bold rounded-2xl hover:bg-[#C4D9F4] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 disabled:opacity-50"
          >
            <Save className="h-6 w-6" />
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoiceElite;
