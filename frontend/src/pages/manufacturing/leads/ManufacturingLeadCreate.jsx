import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaIndustry,
  FaSave,
  FaTimes,
  FaUser,
  FaBox,
  FaCog,
  FaDollarSign,
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManufacturingLeadCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [productFamilies, setProductFamilies] = useState([]);
  const [skus, setSkus] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    product_family_id: "",
    sku_id: "",
    product_description: "",
    quantity: "",
    uom: "PC",
    delivery_date_required: "",
    application: "",
    material_grade: "",
    tolerances: "",
    surface_finish: "",
    coating: "",
    certifications_required: [],
    expected_price_per_unit: "",
    currency: "INR",
    payment_terms: "Net 30",
    sample_required: false,
    sample_quantity: "",
    priority: "Medium",
    rfq_number: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch customers
      const customersRes = await fetch(
        `${API_URL}/api/manufacturing/masters/customers`,
        { headers },
      );
      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers || []);
      }

      // Fetch product families
      const familiesRes = await fetch(
        `${API_URL}/api/manufacturing/masters/product-families`,
        { headers },
      );
      if (familiesRes.ok) {
        const data = await familiesRes.json();
        setProductFamilies(data.product_families || []);
      }

      // Fetch SKUs
      const skusRes = await fetch(`${API_URL}/api/manufacturing/masters/skus`, {
        headers,
      });
      if (skusRes.ok) {
        const data = await skusRes.json();
        setSkus(data.skus || []);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.customer_id) newErrors.customer_id = "Customer is required";
    if (!formData.contact_person)
      newErrors.contact_person = "Contact person is required";
    if (!formData.contact_email)
      newErrors.contact_email = "Contact email is required";
    if (!formData.contact_phone)
      newErrors.contact_phone = "Contact phone is required";
    if (!formData.product_description)
      newErrors.product_description = "Product description is required";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (!formData.delivery_date_required)
      newErrors.delivery_date_required = "Delivery date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // Convert quantity to number
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        sample_quantity: formData.sample_quantity
          ? parseInt(formData.sample_quantity)
          : null,
        expected_price_per_unit: formData.expected_price_per_unit
          ? parseFloat(formData.expected_price_per_unit)
          : null,
      };

      const response = await fetch(`${API_URL}/api/manufacturing/leads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Lead ${data.lead.lead_id} created successfully!`);
        navigate("/commerce/manufacturing-leads");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || "Failed to create lead"}`);
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Error creating lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaIndustry className="text-[#033F99]" />
            Create Manufacturing Lead
          </h1>
          <p className="text-gray-600 mt-1">
            Add a new manufacturing lead to the pipeline
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customer Information Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-[#033F99]" />
              Customer Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.customer_id ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_name} ({customer.industry})
                    </option>
                  ))}
                </select>
                {errors.customer_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customer_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFQ Number
                </label>
                <input
                  type="text"
                  name="rfq_number"
                  value={formData.rfq_number}
                  onChange={handleChange}
                  placeholder="Customer's RFQ/Inquiry number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.contact_person ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.contact_person && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contact_person}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.contact_email ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.contact_email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contact_email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.contact_phone ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.contact_phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contact_phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Requirements Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBox className="text-[#033F99]" />
              Product Requirements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Family
                </label>
                <select
                  name="product_family_id"
                  value={formData.product_family_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Product Family</option>
                  {productFamilies.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.family_name} ({family.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (if existing)
                </label>
                <select
                  name="sku_id"
                  value={formData.sku_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select SKU or leave blank for new</option>
                  {skus.map((sku) => (
                    <option key={sku.id} value={sku.id}>
                      {sku.sku_code} - {sku.sku_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="product_description"
                  value={formData.product_description}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.product_description ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Detailed product description..."
                />
                {errors.product_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.product_description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="any"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.quantity ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UOM
                </label>
                <select
                  name="uom"
                  value={formData.uom}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PC">PC (Piece)</option>
                  <option value="KG">KG (Kilogram)</option>
                  <option value="MT">MT (Metric Ton)</option>
                  <option value="SET">SET</option>
                  <option value="M">M (Meter)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="delivery_date_required"
                  value={formData.delivery_date_required}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.delivery_date_required ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.delivery_date_required && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.delivery_date_required}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application / End Use
                </label>
                <input
                  type="text"
                  name="application"
                  value={formData.application}
                  onChange={handleChange}
                  placeholder="e.g., Automotive engine assembly"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCog className="text-[#033F99]" />
              Technical Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Grade
                </label>
                <input
                  type="text"
                  name="material_grade"
                  value={formData.material_grade}
                  onChange={handleChange}
                  placeholder="e.g., SS316, AlSi9Cu3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tolerances
                </label>
                <input
                  type="text"
                  name="tolerances"
                  value={formData.tolerances}
                  onChange={handleChange}
                  placeholder="e.g., ±0.05mm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface Finish
                </label>
                <input
                  type="text"
                  name="surface_finish"
                  value={formData.surface_finish}
                  onChange={handleChange}
                  placeholder="e.g., Ra 1.6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coating
                </label>
                <input
                  type="text"
                  name="coating"
                  value={formData.coating}
                  onChange={handleChange}
                  placeholder="e.g., Zinc plating, Anodized"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Commercial Data Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaDollarSign className="text-[#033F99]" />
              Commercial Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Price Per Unit
                </label>
                <input
                  type="number"
                  name="expected_price_per_unit"
                  value={formData.expected_price_per_unit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <select
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sample Requirements Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Sample Requirements
            </h2>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="sample_required"
                checked={formData.sample_required}
                onChange={handleChange}
                className="w-4 h-4 text-[#033F99] rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Sample/Prototype Required
              </label>
            </div>

            {formData.sample_required && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Quantity
                  </label>
                  <input
                    type="number"
                    name="sample_quantity"
                    value={formData.sample_quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaSave /> Create Lead
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/commerce/manufacturing-leads")}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManufacturingLeadCreate;
