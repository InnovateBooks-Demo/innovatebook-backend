// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Share2, Save, ArrowLeft, X } from 'lucide-react';
// import { toast } from 'sonner';
// import axios from 'axios';

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const ChannelsCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     display_name: '',
//     legal_name: '',
//     channel_type: 'Distributor',
//     country_of_registration: '',
//     status: 'active',
//     primary_role: 'Channel',
//     territory: '',
//     contacts: [],
//     locations: []
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await axios.post(`${API_URL}/api/commerce/parties/channels`, formData, { headers: { Authorization: `Bearer ${token}` } });
//       if (response.data.success) {
//         toast.success('Channel created successfully');
//         navigate('/commerce/parties/channels');
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Failed to create channel');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50" data-testid="channels-create">
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-8 py-6">
//           <div className="flex items-center gap-4">
//             <button onClick={() => navigate('/commerce/parties/channels')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></button>
//             <div><h1 className="text-2xl font-semibold text-gray-900">Create New Channel</h1><p className="mt-1 text-sm text-gray-500">Add a new distribution channel</p></div>
//           </div>
//         </div>
//       </div>

//       <div className="px-8 py-6 max-w-4xl">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//               <div className="flex items-center gap-2"><Share2 className="h-5 w-5 text-gray-500" /><h2 className="text-lg font-medium text-gray-900">Channel Information</h2></div>
//             </div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label><input type="text" required value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent" placeholder="Enter display name" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Legal Name *</label><input type="text" required value={formData.legal_name} onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent" placeholder="Enter legal name" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Channel Type *</label><select required value={formData.channel_type} onChange={(e) => setFormData({ ...formData, channel_type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"><option value="Distributor">Distributor</option><option value="Retailer">Retailer</option><option value="Franchise">Franchise</option><option value="Online">Online</option><option value="Agent">Agent</option></select></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Country *</label><input type="text" required value={formData.country_of_registration} onChange={(e) => setFormData({ ...formData, country_of_registration: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent" placeholder="Enter country" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Territory</label><input type="text" value={formData.territory} onChange={(e) => setFormData({ ...formData, territory: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent" placeholder="Enter territory" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#033F99] bg-white"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
//             </div>
//           </div>

//           <div className="flex items-center justify-end gap-3">
//             <button type="button" onClick={() => navigate('/commerce/parties/channels')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><X className="h-4 w-4" />Cancel</button>
//             <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#033F99] rounded-lg hover:bg-[#022d6e] transition-colors shadow-sm disabled:opacity-50"><Save className="h-4 w-4" />{loading ? 'Creating...' : 'Create Channel'}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChannelsCreate;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Save, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CustomersCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    legal_name: "",
    customer_type: "B2B",
    segment: "SMB",
    country_of_registration: "",
    industry_classification: "",
    status: "active",
    primary_role: "Customer",
    contacts: [],
    locations: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_URL}/api/commerce/parties/customers`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Customer created successfully");
        navigate("/commerce/parties/customers");
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-10 py-7">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/parties/customers")}
              className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Create New Customer
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Add a new customer to your organization
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
          <div className="px-8 py-5 border-b border-gray-200 ">
            <div className="flex items-center gap-3 bg-[fefefa]">
              <Users className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
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
                required
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="Enter display name"
                className="w-full h-11 px-4 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-[#033F99] focus:outline-none"
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
                required
                value={formData.legal_name}
                onChange={(e) =>
                  setFormData({ ...formData, legal_name: e.target.value })
                }
                placeholder="Enter legal name"
                className="w-full h-11 px-4 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-[#033F99] focus:outline-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                Used in contracts & compliance.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customer_type}
                onChange={(e) =>
                  setFormData({ ...formData, customer_type: e.target.value })
                }
                className="w-full h-11 px-4 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-[#033F99] focus:outline-none"
              >
                <option>B2B</option>
                <option>B2C</option>
                <option>B2G</option>
                <option>Export</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Segment
              </label>
              <select
                value={formData.segment}
                onChange={(e) =>
                  setFormData({ ...formData, segment: e.target.value })
                }
                className="w-full h-11 px-4 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-[#033F99] focus:outline-none"
              >
                <option>Enterprise</option>
                <option>SMB</option>
                <option>Individual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Country of Registration <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={formData.country_of_registration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country_of_registration: e.target.value,
                  })
                }
                placeholder="Enter country"
                className="w-full h-11 px-4 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-[#033F99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Industry
              </label>
              <input
                value={formData.industry_classification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    industry_classification: e.target.value,
                  })
                }
                placeholder="Enter industry"
                className="w-full h-11 px-4 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-[#033F99] focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/commerce/parties/customers")}
              className="h-11 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 inline mr-2" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-7 rounded-lg bg-[#033F99] text-white font-semibold
                         hover:bg-[#022d6e] disabled:opacity-50"
            >
              <Save className="h-4 w-4 inline mr-2" />
              {loading ? "Creating..." : "Create Customer"}
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

export default CustomersCreate;
