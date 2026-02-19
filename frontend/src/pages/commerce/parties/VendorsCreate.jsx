// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Building2, Save, ArrowLeft, X } from 'lucide-react';
// import { toast } from 'sonner';
// import axios from 'axios';

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const VendorsCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     display_name: '',
//     legal_name: '',
//     vendor_type: 'Material',
//     country_of_registration: '',
//     status: 'active',
//     primary_role: 'Vendor',
//     vendor_status: 'preferred',
//     contacts: [],
//     locations: []
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await axios.post(`${API_URL}/api/commerce/parties/vendors`, formData, { headers: { Authorization: `Bearer ${token}` } });
//       if (response.data.success) {
//         toast.success('Vendor created successfully');
//         navigate('/commerce/parties/vendors');
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Failed to create vendor');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50" data-testid="vendors-create">
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-8 py-6">
//           <div className="flex items-center gap-4">
//             <button onClick={() => navigate('/commerce/parties/vendors')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></button>
//             <div><h1 className="text-2xl font-semibold text-gray-900">Create New Vendor</h1><p className="mt-1 text-sm text-gray-500">Add a new vendor to your organization</p></div>
//           </div>
//         </div>
//       </div>

//       <div className="px-8 py-6 max-w-4xl">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-gray-500" /><h2 className="text-lg font-medium text-gray-900">Vendor Information</h2></div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label><input type="text" required value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent" placeholder="Enter display name" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Legal Name *</label><input type="text" required value={formData.legal_name} onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent" placeholder="Enter legal name" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Vendor Type *</label><select required value={formData.vendor_type} onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"><option value="Material">Material</option><option value="Service">Service</option><option value="Creator">Creator/Influencer</option><option value="SaaS">SaaS</option><option value="Logistics">Logistics</option></select></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Country *</label><input type="text" required value={formData.country_of_registration} onChange={(e) => setFormData({ ...formData, country_of_registration: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent" placeholder="Enter country" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Vendor Status</label><select value={formData.vendor_status} onChange={(e) => setFormData({ ...formData, vendor_status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"><option value="preferred">Preferred</option><option value="approved">Approved</option><option value="provisional">Provisional</option><option value="blacklisted">Blacklisted</option></select></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
//             </div>
//           </div>

//           <div className="flex items-center justify-end gap-3">
//             <button type="button" onClick={() => navigate('/commerce/parties/vendors')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><X className="h-4 w-4" />Cancel</button>
//             <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50"><Save className="h-4 w-4" />{loading ? 'Creating...' : 'Create Vendor'}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default VendorsCreate;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Save, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const VendorsCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    legal_name: "",
    vendor_type: "Material",
    country_of_registration: "",
    status: "active",
    primary_role: "Vendor",
    vendor_status: "preferred",
    contacts: [],
    locations: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_URL}/api/commerce/parties/vendors`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Vendor created successfully");
        navigate("/commerce/parties/vendors");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#f4f6f8]"
      data-testid="vendors-create"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-10 py-7">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/parties/vendors")}
              className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="text-left">
              <h1 className="text-3xl font-semibold text-gray-900">
                Create New Vendor
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Add a new vendor to your organization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Form */}
      <div className="flex-1 flex justify-center px-10 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-5xl bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {/* Card Header */}
          <div className="px-8 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Vendor Information
              </h2>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="Enter display name"
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Used for invoices & UI.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.legal_name}
                onChange={(e) =>
                  setFormData({ ...formData, legal_name: e.target.value })
                }
                placeholder="Enter legal name"
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Used in contracts & compliance.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Vendor Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.vendor_type}
                onChange={(e) =>
                  setFormData({ ...formData, vendor_type: e.target.value })
                }
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
              >
                <option value="Material">Material</option>
                <option value="Service">Service</option>
                <option value="Creator">Creator/Influencer</option>
                <option value="SaaS">SaaS</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.country_of_registration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country_of_registration: e.target.value,
                  })
                }
                placeholder="Enter country"
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Vendor Status
              </label>
              <select
                value={formData.vendor_status}
                onChange={(e) =>
                  setFormData({ ...formData, vendor_status: e.target.value })
                }
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
              >
                <option value="preferred">Preferred</option>
                <option value="approved">Approved</option>
                <option value="provisional">Provisional</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/parties/vendors")}
              className="h-11 px-6 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition bg-[red]"
            >
              <X className="h-4 w-4 inline mr-2 " />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-7 rounded-lg bg-[#033F99] text-white font-semibold hover:bg-[#022d6e] transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 inline mr-2" />
              {loading ? "Creating..." : "Create Vendor"}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-5 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Innovate Books. All rights reserved.
      </footer>
    </div>
  );
};

export default VendorsCreate;
