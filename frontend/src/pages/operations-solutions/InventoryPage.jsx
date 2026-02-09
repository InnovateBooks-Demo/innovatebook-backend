import React, { useState } from "react";
import { Link } from "react-router-dom";
import IBOperationsHub from "../IBOperationsHub";
import {
  VideoWalkthrough,
  CaseStudy,
  TestimonialSection,
} from "../../components/marketing";
import {
  Boxes,
  CheckCircle,
  Zap,
  Play,
  MapPin,
  AlertTriangle,
  Package,
  RefreshCw,
} from "lucide-react";

const InventoryPage = () => {
  const [selectedLocation, setSelectedLocation] = useState("all");

  const features = [
    {
      title: "Multi-Location Tracking",
      description: "Track inventory across warehouses, stores, and locations.",
      items: [
        "Location-wise stock",
        "Inter-location transfers",
        "Transit tracking",
        "Min/max levels per location",
      ],
    },
    {
      title: "Batch & Serial Management",
      description: "Track items by batch number or serial number.",
      items: [
        "Batch tracking",
        "Serial number registry",
        "Expiry management",
        "Traceability reports",
      ],
    },
    {
      title: "COGS Calculation",
      description: "Automatic cost of goods sold calculation.",
      items: [
        "FIFO/LIFO/Weighted avg",
        "Real-time COGS",
        "Variance analysis",
        "Standard costing",
      ],
    },
    {
      title: "Stock Analytics",
      description: "Insights into stock movement and optimization.",
      items: [
        "Stock aging",
        "Turnover analysis",
        "Dead stock alerts",
        "Reorder predictions",
      ],
    },
  ];

  const benefits = [
    {
      metric: "99.2%",
      label: "Inventory Accuracy",
      description: "Real-time sync",
    },
    {
      metric: "30%",
      label: "Carrying Cost Reduction",
      description: "Optimized levels",
    },
    { metric: "Zero", label: "Stockouts", description: "Smart reordering" },
  ];

  const inventoryItems = [
    {
      sku: "RAW-001",
      name: "Steel Sheets (2mm)",
      location: "Warehouse A",
      qty: 1250,
      min: 500,
      max: 2000,
      value: 875000,
      status: "Healthy",
    },
    {
      sku: "RAW-002",
      name: "Copper Wire (1.5mm)",
      location: "Warehouse A",
      qty: 180,
      min: 200,
      max: 800,
      value: 324000,
      status: "Low Stock",
    },
    {
      sku: "FIN-001",
      name: "Motor Assembly Unit",
      location: "Warehouse B",
      qty: 450,
      min: 100,
      max: 600,
      value: 2250000,
      status: "Healthy",
    },
    {
      sku: "RAW-003",
      name: "Aluminum Rods",
      location: "Warehouse B",
      qty: 0,
      min: 100,
      max: 500,
      value: 0,
      status: "Out of Stock",
    },
    {
      sku: "PKG-001",
      name: "Packaging Material",
      location: "Warehouse A",
      qty: 5000,
      min: 1000,
      max: 5000,
      value: 150000,
      status: "At Max",
    },
  ];

  const testimonials = [
    {
      quote:
        "We reduced our carrying costs by ₹28L in the first year. The dead stock alerts alone paid for the system.",
      author: "Suresh Kumar",
      role: "Supply Chain Head",
      company: "DistributionKing",
      rating: 5,
    },
    {
      quote:
        "Real-time inventory sync with finance eliminated month-end reconciliation headaches. What took 3 days now takes 10 minutes.",
      author: "Priya Mehta",
      role: "Finance Controller",
      company: "RetailMart India",
      rating: 5,
    },
    {
      quote:
        "Batch tracking and expiry management saved us from ₹15L in expired inventory write-offs annually.",
      author: "Rajesh Gupta",
      role: "Warehouse Manager",
      company: "PharmaDist",
      rating: 5,
    },
    {
      quote:
        "The reorder prediction algorithm eliminated stockouts. Customer satisfaction scores improved by 22%.",
      author: "Anita Desai",
      role: "Operations Director",
      company: "E-CommerceFirst",
      rating: 5,
    },
  ];

  const caseStudyData = {
    company: "DistributionKing",
    industry: "Distribution",
    employees: "1,800+",
    logo: "DK",
    challenge:
      "₹45L in carrying costs with frequent stockouts and overstocking. No visibility across 12 warehouse locations. Manual reconciliation taking 5 days monthly.",
    solution:
      "Implemented IB Operations Inventory with multi-location tracking, automated reorder points, and real-time finance integration.",
    results: [
      {
        metric: "₹28L",
        label: "Annual Savings",
        detail: "Reduced carrying costs",
      },
      { metric: "Zero", label: "Stockouts", detail: "Smart reordering" },
      { metric: "99.2%", label: "Accuracy", detail: "Real-time tracking" },
      {
        metric: "5 Days→10 Min",
        label: "Reconciliation",
        detail: "Automated sync",
      },
    ],
    quote:
      "Inventory management transformed from our biggest headache to a competitive advantage. Real-time visibility changed everything.",
    quotePerson: "Suresh Kumar",
    quoteRole: "Supply Chain Head",
  };

  const locations = ["all", "Warehouse A", "Warehouse B"];
  const filteredItems =
    selectedLocation === "all"
      ? inventoryItems
      : inventoryItems.filter((item) => item.location === selectedLocation);
  const totalValue = filteredItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <IBOperationsHub>
      <div className="max-w-5xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#3A4E63] to-[#3A4E63] rounded-2xl flex items-center justify-center">
              <Boxes className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Inventory</h1>
              <p className="text-lg text-[#3A4E63] font-semibold">
                Stock-to-Finance Sync
              </p>
            </div>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">
            Real-time inventory tracking with automatic COGS calculation and
            working capital impact.
          </p>
        </div>

        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#3A4E63] to-[#3A4E63] p-6 rounded-2xl text-white text-center"
              >
                <p className="text-4xl font-bold mb-2">{b.metric}</p>
                <p className="text-lg font-semibold mb-1">{b.label}</p>
                <p className="text-sm opacity-80">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        <VideoWalkthrough
          title="Inventory Management Demo"
          description="Multi-location tracking with finance integration"
          duration="5 min"
          moduleName="IB Operations"
          subModule="Inventory Module"
          Icon={Boxes}
          category="business"
        />

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-[#3A4E63]" />
            <h2 className="text-3xl font-bold text-slate-900">
              Interactive Demo
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
              Live Stock View
            </span>
          </div>
          <div className="bg-gradient-to-br from-[#EBF3FC] to-white p-6 rounded-3xl border-2 border-[#C4D9F4]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Inventory Dashboard
                </h3>
                <p className="text-slate-600">
                  Total Stock Value:{" "}
                  <span className="font-bold text-[#3A4E63]">
                    ₹{(totalValue / 100000).toFixed(1)}L
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-600" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === "all" ? "All Locations" : loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">
                      SKU
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">
                      Item
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">
                      Location
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      Qty
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">
                      Value
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, i) => (
                    <tr
                      key={i}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4 font-mono text-sm text-slate-600">
                        {item.sku}
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {item.location}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-900">
                        {item.qty.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-900">
                        ₹{(item.value / 1000).toFixed(0)}K
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold ${item.status === "Healthy" ? "bg-green-100 text-green-700" : item.status === "Low Stock" ? "bg-yellow-100 text-yellow-700" : item.status === "Out of Stock" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {item.status === "Out of Stock" && (
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                          )}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700 font-medium">
                  1 item out of stock
                </span>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-center gap-2">
                <Package className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">
                  1 item low stock
                </span>
              </div>
              <div className="bg-[rgba(3,63,153,0.08)] p-3 rounded-lg border border-[rgba(3,63,153,0.25)] flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-[#033F99]" />
                <span className="text-sm text-blue-700 font-medium">
                  2 reorders suggested
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#3A4E63] transition-all hover:shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-600 mb-4">{f.description}</p>
                <div className="space-y-2">
                  {f.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <CaseStudy data={caseStudyData} />
        <TestimonialSection testimonials={testimonials} />

        <section className="bg-gradient-to-r from-[#3A4E63] to-[#3A4E63] p-8 rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ready for Real-Time Inventory?
              </h2>
              <p className="opacity-90">Sync stock with finance instantly</p>
            </div>
            <Link to="/auth/signup">
              <button className="bg-white text-[#3A4E63] font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Free Trial
              </button>
            </Link>
          </div>
        </section>
      </div>
    </IBOperationsHub>
  );
};

export default InventoryPage;
