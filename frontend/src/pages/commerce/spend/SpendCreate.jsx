import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SpendCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    expense_type: "Travel",
    expense_amount: 0,
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || formData.expense_amount <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/commerce/spend`, formData);
      toast.success("Expense created successfully");
      navigate("/commerce/spend");
    } catch (error) {
      toast.error("Failed to create expense");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/commerce/spend">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              Create Expense
            </h2>
            <p className="text-slate-600 mt-1">Submit new expense claim</p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99]700"
        >
          <Save className="h-4 w-4" />
          {loading ? "Creating..." : "Create Expense"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Expense Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <Input
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="e.g., EMP-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expense Type
              </label>
              <select
                name="expense_type"
                value={formData.expense_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
              >
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Software">Software</option>
                <option value="Training">Training</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="expense_amount"
                value={formData.expense_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expense Date
              </label>
              <Input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99]"
                rows="3"
                placeholder="Expense details..."
              ></textarea>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default SpendCreate;
