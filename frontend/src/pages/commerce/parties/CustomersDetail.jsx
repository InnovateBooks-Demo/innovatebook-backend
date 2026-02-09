// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, Edit, Users, Mail, Phone, MapPin, Building2, Globe, Shield, Tag, FileText, Activity, Trash2 } from 'lucide-react';
// import axios from 'axios';

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// const CustomersDetail = () => {
//   const { customer_id } = useParams();
//   const navigate = useNavigate();
//   const [customer, setCustomer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');

//   useEffect(() => {
//     fetchCustomerDetails();
//   }, [customer_id]);

//   const fetchCustomerDetails = async () => {
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await axios.get(`${API_URL}/api/commerce/parties/customers/${customer_id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setCustomer(response.data.customer);
//       }
//     } catch (error) {
//       console.error('Error fetching customer:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (window.confirm('Are you sure you want to delete this customer?')) {
//       try {
//         const token = localStorage.getItem('access_token');
//         await axios.delete(`${API_URL}/api/commerce/parties/customers/${customer_id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         navigate('/commerce/parties/customers');
//       } catch (error) {
//         console.error('Error deleting customer:', error);
//         alert('Failed to delete customer');
//       }
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       active: 'bg-green-100 text-green-800 border-green-300',
//       on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       dormant: 'bg-gray-100 text-gray-800 border-gray-300',
//       blocked: 'bg-red-100 text-red-800 border-red-300'
//     };
//     return colors[status] || colors.active;
//   };

//   const getRiskColor = (risk) => {
//     const colors = {
//       low: 'bg-green-100 text-green-800',
//       medium: 'bg-yellow-100 text-yellow-800',
//       high: 'bg-red-100 text-red-800'
//     };
//     return colors[risk] || colors.low;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
//           <p className="mt-4 text-[#033F99] font-semibold text-lg">Loading customer details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!customer) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
//           <button onClick={() => navigate('/commerce/parties/customers')} className="px-6 py-3 text-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
//             Back to Customers
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const tabs = [
//     { key: 'overview', label: 'Overview', icon: FileText },
//     { key: 'contacts', label: 'Contacts', icon: Mail },
//     { key: 'locations', label: 'Locations', icon: MapPin },
//     { key: 'activity', label: 'Activity', icon: Activity }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50" style={{ fontFamily: 'Poppins' }}>
//       <div className="max-w-[1600px] mx-auto px-6 py-8">
//         <button onClick={() => navigate('/commerce/parties/customers')} className="flex items-center gap-2 text-[#033F99] hover:text-blue-700 font-semibold mb-6 transition-all">
//           <ArrowLeft className="h-5 w-5" />
//           Back to Customers
//         </button>

//         {/* Header Card */}
//         <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[rgba(3,63,153,0.25)] mb-6">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
//                   <Users className="h-8 w-8 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900">{customer.display_name || customer.name}</h1>
//                   <p className="text-sm text-gray-600 font-medium">{customer.customer_id}</p>
//                 </div>
//                 <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(customer.status)}`}>
//                   {customer.status}
//                 </span>
//                 {customer.customer_type && (
//                   <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 text-blue-800">
//                     {customer.customer_type}
//                   </span>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 mt-6">
//                 {customer.legal_name && (
//                   <div>
//                     <p className="text-sm font-semibold text-gray-500">Legal Name</p>
//                     <p className="text-base font-bold">{customer.legal_name}</p>
//                   </div>
//                 )}
//                 {customer.segment && (
//                   <div>
//                     <p className="text-sm font-semibold text-gray-500">Segment</p>
//                     <p className="text-base font-bold">{customer.segment}</p>
//                   </div>
//                 )}
//                 {customer.country_of_registration && (
//                   <div>
//                     <p className="text-sm font-semibold text-gray-500">Country</p>
//                     <p className="text-base font-bold">{customer.country_of_registration}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button onClick={() => navigate(`/commerce/parties/customers/${customer_id}/edit`)} className="flex items-center gap-2 px-6 py-3 text-blue-700 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
//                 <Edit className="h-5 w-5" />
//                 Edit
//               </button>
//               <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all">
//                 <Trash2 className="h-5 w-5" />
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-3xl shadow-2xl border-2 border-[rgba(3,63,153,0.25)] overflow-hidden">
//           <div className="flex overflow-x-auto border-b-2 border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)]">
//             {tabs.map(tab => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.key}
//                   onClick={() => setActiveTab(tab.key)}
//                   className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
//                     activeTab === tab.key
//                       ? 'text-blue-700 text-white border-b-4 border-blue-800'
//                       : 'text-gray-600 hover:bg-blue-100'
//                   }`}
//                 >
//                   <Icon className="h-5 w-5" />
//                   {tab.label}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="p-8">
//             {activeTab === 'overview' && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
//                     {customer.primary_role && (
//                       <div>
//                         <label className="text-sm font-semibold text-gray-500">Primary Role</label>
//                         <p className="text-base text-gray-900">{customer.primary_role}</p>
//                       </div>
//                     )}
//                     {customer.industry_classification && (
//                       <div>
//                         <label className="text-sm font-semibold text-gray-500">Industry</label>
//                         <p className="text-base text-gray-900">{customer.industry_classification}</p>
//                       </div>
//                     )}
//                     {customer.risk_level && (
//                       <div>
//                         <label className="text-sm font-semibold text-gray-500">Risk Level</label>
//                         <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getRiskColor(customer.risk_level)}`}>
//                           {customer.risk_level.toUpperCase()}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-4">
//                     <h3 className="text-xl font-bold text-gray-900 mb-4">Commercial Details</h3>
//                     {customer.commercial_owner && (
//                       <div>
//                         <label className="text-sm font-semibold text-gray-500">Commercial Owner</label>
//                         <p className="text-base text-gray-900">{customer.commercial_owner}</p>
//                       </div>
//                     )}
//                     {customer.business_unit && (
//                       <div>
//                         <label className="text-sm font-semibold text-gray-500">Business Unit</label>
//                         <p className="text-base text-gray-900">{customer.business_unit}</p>
//                       </div>
//                     )}
//                     {customer.region && (
//                       <div>
//                         <label className="text-sm font-semibold text-gray-500">Region</label>
//                         <p className="text-base text-gray-900">{customer.region}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {customer.tags && customer.tags.length > 0 && (
//                   <div>
//                     <label className="text-sm font-semibold text-gray-500 mb-2 block">Tags</label>
//                     <div className="flex flex-wrap gap-2">
//                       {customer.tags.map((tag, index) => (
//                         <span key={`item-${index}`} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//                           <Tag className="h-3 w-3 inline mr-1" />
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'contacts' && (
//               <div className="space-y-4">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Persons</h3>
//                 {customer.contacts && customer.contacts.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {customer.contacts.map((contact, index) => (
//                       <div key={`item-${index}`} className="bg-[rgba(3,63,153,0.08)] rounded-2xl p-6 border-2 border-[rgba(3,63,153,0.25)]">
//                         <div className="flex items-center gap-3 mb-3">
//                           <div className="w-10 h-10 text-blue-700 rounded-full flex items-center justify-center">
//                             <Users className="h-5 w-5 text-white" />
//                           </div>
//                           <div>
//                             <h4 className="font-bold text-gray-900">{contact.name}</h4>
//                             {contact.role && <p className="text-sm text-gray-600">{contact.role}</p>}
//                           </div>
//                           {contact.is_primary && (
//                             <span className="ml-auto px-2 py-1 text-blue-700 text-white rounded-lg text-xs font-semibold">Primary</span>
//                           )}
//                         </div>
//                         <div className="space-y-2">
//                           {contact.email && (
//                             <div className="flex items-center gap-2 text-sm text-gray-700">
//                               <Mail className="h-4 w-4" />
//                               <span>{contact.email}</span>
//                             </div>
//                           )}
//                           {contact.phone && (
//                             <div className="flex items-center gap-2 text-sm text-gray-700">
//                               <Phone className="h-4 w-4" />
//                               <span>{contact.phone}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-600">No contacts added</p>
//                 )}
//               </div>
//             )}

//             {activeTab === 'locations' && (
//               <div className="space-y-4">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Locations</h3>
//                 {customer.locations && customer.locations.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {customer.locations.map((location, index) => (
//                       <div key={`item-${index}`} className="bg-[rgba(3,63,153,0.08)] rounded-2xl p-6 border-2 border-[rgba(3,63,153,0.25)]">
//                         <div className="flex items-center gap-2 mb-3">
//                           <MapPin className="h-5 w-5 text-[#033F99]" />
//                           <span className="px-3 py-1 text-blue-700 text-white rounded-lg text-xs font-semibold">
//                             {location.address_type}
//                           </span>
//                         </div>
//                         <div className="space-y-1 text-sm text-gray-700">
//                           <p className="font-semibold">{location.address_line1}</p>
//                           {location.address_line2 && <p>{location.address_line2}</p>}
//                           <p>{location.city}, {location.state}</p>
//                           <p>{location.country} - {location.postal_code}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-600">No locations added</p>
//                 )}
//               </div>
//             )}

//             {activeTab === 'activity' && (
//               <div className="space-y-4">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Log</h3>
//                 <div className="space-y-3">
//                   {customer.created_at && (
//                     <div className="flex items-start gap-3 p-4 bg-[rgba(3,63,153,0.08)] rounded-xl">
//                       <Activity className="h-5 w-5 text-[#033F99] mt-1" />
//                       <div>
//                         <p className="font-semibold text-gray-900">Customer Created</p>
//                         <p className="text-sm text-gray-600">
//                           {new Date(customer.created_at).toLocaleString()}
//                         </p>
//                         {customer.created_by && (
//                           <p className="text-sm text-gray-500">by {customer.created_by}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                   {customer.last_modified_at && (
//                     <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
//                       <Edit className="h-5 w-5 text-yellow-600 mt-1" />
//                       <div>
//                         <p className="font-semibold text-gray-900">Last Modified</p>
//                         <p className="text-sm text-gray-600">
//                           {new Date(customer.last_modified_at).toLocaleString()}
//                         </p>
//                         {customer.last_modified_by && (
//                           <p className="text-sm text-gray-500">by {customer.last_modified_by}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomersDetail;

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Users,
  Mail,
  Phone,
  MapPin,
  Tag,
  FileText,
  Activity,
  Trash2,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CustomersDetail = () => {
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // useEffect(() => {
  //   fetchCustomerDetails();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [customer_id]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customer_id]);

  const fetchCustomerDetails = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_URL}/api/commerce/parties/customers/${customer_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data?.success) setCustomer(response.data.customer);
      else setCustomer(null);
    } catch (error) {
      console.error("Error fetching customer:", error);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(
          `${API_URL}/api/commerce/parties/customers/${customer_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        navigate("/commerce/parties/customers");
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Failed to delete customer");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-300",
      on_hold: "bg-yellow-100 text-yellow-800 border-yellow-300",
      dormant: "bg-gray-100 text-gray-800 border-gray-300",
      blocked: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[(status || "").toLowerCase()] || colors.active;
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return colors[(risk || "").toLowerCase()] || colors.low;
  };

  const view = useMemo(() => {
    const c = customer || {};
    return {
      // Header
      title: c.display_name || c.name || c.company_name || "Customer",
      subtitleId: c.customer_id || c.party_id || customer_id,

      status: (c.status || "active").toLowerCase(),
      customerType: c.customer_type || c.party_sub_type,

      // top summary row
      legalName: c.legal_name || c.company_name || c.name,
      segment: c.segment,
      country:
        c.country_of_registration ||
        c.country ||
        (Array.isArray(c.operating_countries)
          ? c.operating_countries?.[0]
          : undefined),

      // Overview left
      primaryRole:
        c.primary_role ||
        (c.party_category ? String(c.party_category) : undefined) ||
        "Customer",
      industry: c.industry_classification || c.industry,
      risk: c.risk_level,

      // Overview right commercial
      commercialOwner: c.commercial_owner,
      businessUnit: c.business_unit,
      region: c.region,

      // Extra commercial fields from your Mongo doc
      creditLimit: c.credit_limit,
      paymentTerms: c.payment_terms,
      tier: c.tier,

      // Compliance fields
      gstin: c.gstin,
      pan: c.pan,

      // Contact basics (if you store flat fields)
      email: c.email,
      phone: c.phone,
      address: c.address,

      tags: Array.isArray(c.tags) ? c.tags : [],
      contacts: Array.isArray(c.contacts) ? c.contacts : [],
      locations: Array.isArray(c.locations) ? c.locations : [],

      createdAt: c.created_at,
      createdBy: c.created_by,
      lastModifiedAt: c.last_modified_at,
      lastModifiedBy: c.last_modified_by,
    };
  }, [customer, customer_id]);

  const tabs = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "contacts", label: "Contacts", icon: Mail },
    { key: "locations", label: "Locations", icon: MapPin },
    { key: "activity", label: "Activity", icon: Activity },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Customer Not Found
          </h2>
          <button
            onClick={() => navigate("/commerce/parties/customers")}
            className="px-6 py-3 text-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const Field = ({ label, value }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-base font-bold text-gray-900 break-words">
          {String(value)}
        </p>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50"
      style={{ fontFamily: "Poppins" }}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/commerce/parties/customers")}
          className="flex items-center gap-2 text-[#033F99] hover:text-blue-700 font-semibold mb-6 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Customers
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[rgba(3,63,153,0.25)] mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {view.title}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {view.subtitleId}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(view.status)}`}
                >
                  {view.status}
                </span>

                {view.customerType && (
                  <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 text-blue-800">
                    {view.customerType}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700 mt-6">
                <Field label="Legal Name" value={view.legalName} />
                <Field label="Segment" value={view.segment} />
                <Field label="Country" value={view.country} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate(`/commerce/parties/customers/${customer_id}/edit`)
                }
                className="flex items-center gap-2 px-6 py-3 text-blue-700 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
              >
                <Edit className="h-5 w-5" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-[rgba(3,63,153,0.25)] overflow-hidden">
          <div className="flex overflow-x-auto border-b-2 border-[rgba(3,63,153,0.25)] bg-[rgba(3,63,153,0.08)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "text-blue-700 text-white border-b-4 border-blue-800"
                      : "text-gray-600 hover:bg-blue-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Basic Information
                    </h3>

                    <Field label="Primary Role" value={view.primaryRole} />
                    <Field label="Industry" value={view.industry} />

                    {view.risk && (
                      <div>
                        <label className="text-sm font-semibold text-gray-500">
                          Risk Level
                        </label>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getRiskColor(view.risk)}`}
                          >
                            {String(view.risk).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}

                    <Field label="Tier" value={view.tier} />
                  </div>

                  {/* Commercial Details */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Commercial Details
                    </h3>

                    <Field
                      label="Commercial Owner"
                      value={view.commercialOwner}
                    />
                    <Field label="Business Unit" value={view.businessUnit} />
                    <Field label="Region" value={view.region} />

                    <Field label="Credit Limit" value={view.creditLimit} />
                    <Field label="Payment Terms" value={view.paymentTerms} />

                    <Field label="GSTIN" value={view.gstin} />
                    <Field label="PAN" value={view.pan} />
                  </div>
                </div>

                {/* Contact Snapshot */}
                {(view.email || view.phone || view.address) && (
                  <div className="bg-[rgba(3,63,153,0.08)] rounded-2xl p-6 border-2 border-[rgba(3,63,153,0.25)]">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Field label="Email" value={view.email} />
                      <Field label="Phone" value={view.phone} />
                      <Field label="Address" value={view.address} />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {view.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 mb-2 block">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {view.tags.map((tag, index) => (
                        <span
                          key={`tag-${index}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          <Tag className="h-3 w-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contacts */}
            {activeTab === "contacts" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Persons
                </h3>
                {view.contacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {view.contacts.map((contact, index) => (
                      <div
                        key={`contact-${index}`}
                        className="bg-[rgba(3,63,153,0.08)] rounded-2xl p-6 border-2 border-[rgba(3,63,153,0.25)]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 text-blue-700 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {contact.name || "N/A"}
                            </h4>
                            {contact.role && (
                              <p className="text-sm text-gray-600">
                                {contact.role}
                              </p>
                            )}
                          </div>
                          {contact.is_primary && (
                            <span className="ml-auto px-2 py-1 text-blue-700 text-white rounded-lg text-xs font-semibold">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail className="h-4 w-4" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="h-4 w-4" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No contacts added</p>
                )}
              </div>
            )}

            {/* Locations */}
            {activeTab === "locations" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Locations
                </h3>
                {view.locations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {view.locations.map((location, index) => (
                      <div
                        key={`loc-${index}`}
                        className="bg-[rgba(3,63,153,0.08)] rounded-2xl p-6 border-2 border-[rgba(3,63,153,0.25)]"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-[#033F99]" />
                          <span className="px-3 py-1 text-blue-700 text-white rounded-lg text-xs font-semibold">
                            {location.address_type || "N/A"}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="font-semibold">
                            {location.address_line1}
                          </p>
                          {location.address_line2 && (
                            <p>{location.address_line2}</p>
                          )}
                          <p>
                            {location.city}, {location.state}
                          </p>
                          <p>
                            {location.country}
                            {location.postal_code
                              ? ` - ${location.postal_code}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No locations added</p>
                )}
              </div>
            )}

            {/* Activity */}
            {activeTab === "activity" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Activity Log
                </h3>
                <div className="space-y-3">
                  {view.createdAt && (
                    <div className="flex items-start gap-3 p-4 bg-[rgba(3,63,153,0.08)] rounded-xl">
                      <Activity className="h-5 w-5 text-[#033F99] mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Customer Created
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(view.createdAt).toLocaleString()}
                        </p>
                        {view.createdBy && (
                          <p className="text-sm text-gray-500">
                            by {view.createdBy}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {view.lastModifiedAt && (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
                      <Edit className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Last Modified
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(view.lastModifiedAt).toLocaleString()}
                        </p>
                        {view.lastModifiedBy && (
                          <p className="text-sm text-gray-500">
                            by {view.lastModifiedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {!view.createdAt && !view.lastModifiedAt && (
                    <p className="text-gray-600">No activity available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersDetail;
