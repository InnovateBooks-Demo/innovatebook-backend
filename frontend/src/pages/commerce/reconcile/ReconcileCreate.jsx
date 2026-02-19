import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReconcileCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reconcile_type: "Bank",
    period_start: "",
    period_end: "",
  });

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
      await axios.post(`${BACKEND_URL}/api/commerce/reconcile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/commerce/reconcile");
    } catch (error) {
      console.error("Failed to create reconciliation:", error);
      alert("Failed to create reconciliation");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/commerce/reconcile")}
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
            Create Reconciliation
          </h1>
          <p className="text-slate-600 mt-1">
            Start a new reconciliation process
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Reconciliation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="reconcile_type">Reconciliation Type *</Label>
                <select
                  id="reconcile_type"
                  name="reconcile_type"
                  value={formData.reconcile_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                  required
                >
                  <option value="Bank">Bank Reconciliation</option>
                  <option value="Vendor">Vendor Reconciliation</option>
                  <option value="Customer">Customer Reconciliation</option>
                  <option value="Tax">Tax Reconciliation</option>
                  <option value="Internal">Internal Reconciliation</option>
                </select>
              </div>

              <div>
                <Label htmlFor="period_start">Period Start *</Label>
                <Input
                  id="period_start"
                  name="period_start"
                  type="date"
                  value={formData.period_start}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="period_end">Period End *</Label>
                <Input
                  id="period_end"
                  name="period_end"
                  type="date"
                  value={formData.period_end}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#EBF3FC] border border-[#6B9FE6] rounded-lg p-4">
              <p className="text-sm text-white">
                <strong>Note:</strong> Additional reconciliation details
                (amounts, matching data, exceptions) can be updated after
                creation. The reconciliation will be created in Open status.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/commerce/reconcile")}
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
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Reconciliation
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

export default ReconcileCreate;
