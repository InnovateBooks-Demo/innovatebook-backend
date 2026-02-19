import React from "react";
import { useNavigate } from "react-router-dom";

const MasterDashboard = () => {
  const navigate = useNavigate();

  const masterCategories = [
    {
      category: "Customer Masters",
      icon: "🏢",
      masters: [
        { type: "customer-groups", title: "Customer Groups", icon: "👥" },
        {
          type: "customer-categories",
          title: "Customer Categories",
          icon: "📊",
        },
        { type: "customer-regions", title: "Customer Regions", icon: "🌍" },
      ],
    },
    {
      category: "Engineering Masters",
      icon: "⚙️",
      masters: [
        { type: "tooling", title: "Tooling & Molds", icon: "🔧" },
        { type: "work-centers", title: "Work Centers", icon: "🏭" },
        { type: "surface-finishes", title: "Surface Finishes", icon: "✨" },
        { type: "heat-treatments", title: "Heat Treatments", icon: "🔥" },
      ],
    },
    {
      category: "Procurement Masters",
      icon: "🛒",
      masters: [{ type: "vendors", title: "Vendors", icon: "🤝" }],
    },
    {
      category: "Operations Masters",
      icon: "🏭",
      masters: [
        { type: "shifts", title: "Shifts", icon: "🕐" },
        { type: "scrap-codes", title: "Scrap Codes", icon: "♻️" },
      ],
    },
    {
      category: "Quality Masters",
      icon: "✅",
      masters: [
        { type: "iso-certificates", title: "ISO Certificates", icon: "📜" },
        { type: "rejection-codes", title: "Rejection Codes", icon: "❌" },
      ],
    },
    {
      category: "Logistics Masters",
      icon: "🚚",
      masters: [
        { type: "transporters", title: "Transporters", icon: "🚛" },
        { type: "vehicle-types", title: "Vehicle Types", icon: "🚗" },
      ],
    },
    {
      category: "Governance Masters",
      icon: "📋",
      masters: [
        { type: "loss-reasons", title: "Loss Reasons", icon: "📉" },
        { type: "risk-codes", title: "Risk Codes", icon: "⚠️" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F5FF] via-white to-[#F0F5FF]/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#033F99] mb-2">
            Master Data Management
          </h1>
          <p className="text-slate-600 text-lg">
            Manage all manufacturing master data from one place
          </p>
        </div>

        {/* Master Categories */}
        <div className="space-y-6">
          {masterCategories.map((category, index) => (
            <div
              key={`item-${index}`}
              className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#033F99]/20"
            >
              <h2 className="text-2xl font-bold text-[#033F99] mb-4 flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                {category.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.masters.map((master, idx) => (
                  <button
                    key={`item-${idx}`}
                    onClick={() =>
                      navigate(`/commerce/manufacturing/masters/${master.type}`)
                    }
                    className="p-6 bg-gradient-to-br from-[#C4D9F4] to-[#F0F5FF] rounded-xl hover:from-[#033F99] hover:to-[#0147CC] hover:text-white transition-all duration-300 text-left group border-2 border-[#033F99]/20 hover:border-[#033F99]"
                  >
                    <div className="text-4xl mb-2">{master.icon}</div>
                    <div className="font-bold text-[#033F99] group-hover:text-white">
                      {master.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
