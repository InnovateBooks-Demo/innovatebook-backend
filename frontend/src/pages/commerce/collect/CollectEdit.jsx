import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Save, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CollectEdit = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    invoice_id: "",
    customer_id: "",
    amount_due: 0,
  });

  useEffect(() => {
    fetchCollectionDetails();
  }, [collectionId]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/commerce/collect/${collectionId}`,
      );
      const coll = response.data;

      setFormData({
        invoice_id: coll.invoice_id || "",
        customer_id: coll.customer_id || "",
        amount_due: coll.amount_due || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch collection details:", error);
      toast.error("Failed to load collection details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await axios.put(
        `${BACKEND_URL}/api/commerce/collect/${collectionId}`,
        formData,
      );
      toast.success("Collection updated successfully");
      navigate(`/commerce/collect/${collectionId}`);
    } catch (error) {
      console.error("Failed to update collection:", error);
      toast.error(
        error.response?.data?.detail || "Failed to update collection",
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[#033F99]">
          <Loader className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">
            Loading collection details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/commerce/collect/${collectionId}`}>
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
              Edit Collection {collectionId}
            </h2>
            <p className="text-slate-600 mt-1">Update collection information</p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99]"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Editable Collection Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invoice ID
              </label>
              <Input
                name="invoice_id"
                value={formData.invoice_id}
                onChange={handleChange}
                placeholder="Invoice ID"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer ID
              </label>
              <Input
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                placeholder="Customer ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount Due (₹)
              </label>
              <Input
                type="number"
                name="amount_due"
                value={formData.amount_due}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Payment status and amount tracking are
              managed through the payment recording feature on the detail page.
            </p>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CollectEdit;
