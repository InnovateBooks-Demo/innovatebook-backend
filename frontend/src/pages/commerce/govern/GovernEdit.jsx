import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GovernEdit = () => {
  const { governId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sop_name: "",
    sop_type: "",
    sop_owner: "",
    effective_date: "",
  });

  useEffect(() => {
    fetchGovernDetails();
  }, [governId]);

  const fetchGovernDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/govern/${governId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const gov = response.data;
      setFormData({
        sop_name: gov.sop_name,
        sop_type: gov.sop_type,
        sop_owner: gov.sop_owner,
        effective_date: gov.effective_date,
      });
    } catch (error) {
      console.error("Failed to fetch govern details:", error);
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
      await axios.put(
        `${BACKEND_URL}/api/commerce/govern/${governId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(`/commerce/govern/${governId}`);
    } catch (error) {
      console.error("Failed to update governance:", error);
      alert("Failed to update governance record");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/commerce/govern/${governId}`)}
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
            Edit Governance/SOP
          </h1>
          <p className="text-slate-600 mt-1">Update SOP information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* SOP Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <Label htmlFor="sop_name">SOP Name *</Label>
                <Input
                  id="sop_name"
                  name="sop_name"
                  placeholder="e.g., Bank Reconciliation Process"
                  value={formData.sop_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sop_type">SOP Type *</Label>
                <select
                  id="sop_type"
                  name="sop_type"
                  value={formData.sop_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
                  required
                >
                  <option value="Process">Process</option>
                  <option value="Policy">Policy</option>
                  <option value="Control">Control</option>
                </select>
              </div>

              <div>
                <Label htmlFor="sop_owner">SOP Owner *</Label>
                <Input
                  id="sop_owner"
                  name="sop_owner"
                  placeholder="e.g., Finance Manager"
                  value={formData.sop_owner}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="effective_date">Effective Date *</Label>
                <Input
                  id="effective_date"
                  name="effective_date"
                  type="date"
                  value={formData.effective_date}
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
                onClick={() => navigate(`/commerce/govern/${governId}`)}
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

export default GovernEdit;
