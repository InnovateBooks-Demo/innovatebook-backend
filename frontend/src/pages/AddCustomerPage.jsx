import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingGST, setFetchingGST] = useState(false);
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

  const fetchGSTDetails = async () => {
    if (!formData.gstin || formData.gstin.length !== 15) {
      toast.error("Please enter a valid 15-digit GSTIN");
      return;
    }

    setFetchingGST(true);
    try {
      const gstin = formData.gstin;

      // Validate GSTIN format
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin)) {
        toast.error("Invalid GSTIN format");
        setFetchingGST(false);
        return;
      }

      // Extract PAN from GSTIN (characters 3-12)
      const pan = gstin.substring(2, 12);

      // Real API call using gstincheck.co.in
      const apiKey = "ed6633bd1e80af3c6c4b24c446b346df";
      const apiUrl = `https://sheet.gstincheck.co.in/check/${apiKey}/${gstin}`;

      toast.info("Fetching GST data from government records...");

      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log("GST API Response:", data);

      if (data.flag) {
        // API returned valid data
        const gstData = data.data;

        // Extract address details
        const address = gstData.pradr?.addr;
        const fullAddress = [
          address?.bno,
          address?.bnm,
          address?.st,
          address?.loc,
        ]
          .filter(Boolean)
          .join(", ");

        // Update form with real GST data
        setFormData((prev) => ({
          ...prev,
          customer_name: gstData.tradeNam || gstData.lgnm || prev.customer_name,
          pan: pan,
          address: fullAddress || address?.st || "",
          city: address?.dst || "",
          state: address?.stcd || "",
          pincode: address?.pncd || "",
        }));

        toast.success("✓ Real GST data fetched successfully!");
      } else {
        // API returned error or invalid GSTIN
        throw new Error(data.message || "Invalid GSTIN or data not found");
      }
    } catch (error) {
      console.error("GST fetch error:", error);

      // Show appropriate error message
      if (error.message.includes("Invalid GSTIN")) {
        toast.error("Invalid GSTIN. Please check and try again.");
      } else if (error.message.includes("not found")) {
        toast.error("GSTIN not found in GST records");
      } else {
        toast.error("Failed to fetch GST details. Please enter manually.");
      }

      // Extract and set PAN at minimum
      const pan = formData.gstin.substring(2, 12);
      setFormData((prev) => ({
        ...prev,
        pan: pan,
      }));
    } finally {
      setFetchingGST(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await customerAPI.create(formData);
      toast.success("Customer added successfully");
      navigate("/customers");
    } catch (error) {
      toast.error("Failed to add customer");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/customers")}
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
                Add New Customer
              </h1>
              <p
                className="text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Enter customer details to create a new record
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Card className="p-8 bg-white border-0 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GST Auto-fetch Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  Auto-fetch from GSTIN
                </h3>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter 15-digit GSTIN (e.g., 29ABCDE1234F1Z5)"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gstin: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={15}
                  />
                </div>
                <Button
                  type="button"
                  onClick={fetchGSTDetails}
                  disabled={fetchingGST || formData.gstin.length !== 15}
                  style={{ backgroundColor: "#3A4E63" }}
                >
                  {fetchingGST ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Details"
                  )}
                </Button>
              </div>
            </div>

            {/* Customer Details */}
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

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customers")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#3A4E63" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Customer"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddCustomerPage;
