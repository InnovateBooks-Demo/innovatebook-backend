import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TaxEdit = () => {
  const { taxId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tax_period: "",
    tax_type: "",
    filing_due_date: "",
  });

  useEffect(() => {
    fetchTaxDetails();
  }, [taxId]);

  const fetchTaxDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/tax/${taxId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const tax = response.data;
      setFormData({
        tax_period: tax.tax_period,
        tax_type: tax.tax_type,
        filing_due_date: tax.filing_due_date,
      });
    } catch (error) {
      console.error("Failed to fetch tax details:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BACKEND_URL}/api/commerce/tax/${taxId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/commerce/tax/${taxId}`);
    } catch (error) {
      console.error("Failed to update tax record:", error);
      alert("Failed to update tax record");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/commerce/tax/${taxId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1
            className="text-3xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            Edit Tax Record
          </h1>
          <p className="text-slate-600 mt-1">Update tax record information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Tax Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="tax_period">Tax Period *</Label>
                <Input
                  id="tax_period"
                  name="tax_period"
                  placeholder="e.g., 2025-01 or 2025-Q1"
                  value={formData.tax_period}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tax_type">Tax Type *</Label>
                <select
                  id="tax_type"
                  name="tax_type"
                  value={formData.tax_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                  required
                >
                  <option value="GST">GST</option>
                  <option value="TDS">TDS</option>
                  <option value="VAT">VAT</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="Professional Tax">Professional Tax</option>
                </select>
              </div>

              <div>
                <Label htmlFor="filing_due_date">Filing Due Date *</Label>
                <Input
                  id="filing_due_date"
                  name="filing_due_date"
                  type="date"
                  value={formData.filing_due_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/commerce/tax/${taxId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default TaxEdit;
