import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";

const EditCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone: "",
    gstin: "",
    pan: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getById(id);
      const customer = response.data;
      setFormData({
        customer_name: customer.name || customer.customer_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        gstin: customer.gstin || "",
        pan: customer.pan || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
        country: customer.country || "India",
      });
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load customer details");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await customerAPI.update(id, formData);
      toast.success("Customer updated successfully");
      navigate(`/customers/${id}`);
    } catch (error) {
      toast.error("Failed to update customer");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/customers/${id}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Edit Customer
              </h1>
              <p
                className="text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Update customer information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <Card className="p-8 bg-white border-0 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  required
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  placeholder="ABC Private Limited"
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <Label>Phone *</Label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <Label>GSTIN</Label>
                <Input
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gstin: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="29ABCDE1234F1Z5"
                  maxLength={15}
                />
              </div>

              <div>
                <Label>PAN</Label>
                <Input
                  value={formData.pan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pan: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street address"
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <Label>Pincode</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  placeholder="400001"
                  maxLength={6}
                />
              </div>

              <div>
                <Label>Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="India"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/customers/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                style={{ backgroundColor: "#033F99" }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditCustomerPage;
