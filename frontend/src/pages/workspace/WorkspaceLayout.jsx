import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  MessageSquare,
  LayoutGrid,
  BarChart3,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  CheckCircle,
  ListTodo,
  Filter,
  Activity,
  UserPlus,
  FileText,
  DollarSign,
  ShoppingCart,
  Wallet,
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  PieChart,
  FileCheck,
  Package,
  Receipt,
  CreditCard,
  Calculator,
  Shield,
  ClipboardCheck,
} from "lucide-react";
import { authService } from "../../utils/auth";
import { toast } from "sonner";

const WorkspaceLayout = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leftNavCollapsed, setLeftNavCollapsed] = useState(true);
  const [activeLeftNav, setActiveLeftNav] = useState("workspace");
  const [selectedSolution, setSelectedSolution] = useState("commerce");
  const [solutionDropdownOpen, setSolutionDropdownOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const user = authService.getUser();

  // Determine active section from URL
  useEffect(() => {
    if (location.pathname.includes("/commerce")) {
      setActiveLeftNav("solutions");
      setSelectedSolution("commerce");
    } else if (location.pathname.includes("/reports")) {
      setActiveLeftNav("reports");
    } else if (location.pathname.includes("/workspace")) {
      setActiveLeftNav("workspace");
    }
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveModuleDropdown(null);
        setSolutionDropdownOpen(false);
        setCreateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  const solutions = [
    {
      id: "commerce",
      name: "IB Commerce",
      color: "#06B6D4",
      colorDark: "#0891B2",
      icon: ShoppingCart,
      path: "/commerce",
    }, // Cyan
    {
      id: "workforce",
      name: "IB Workforce",
      color: "#F97316",
      colorDark: "#EA580C",
      icon: Users,
      path: "/workforce",
    }, // Orange
    {
      id: "operations",
      name: "IB Operations",
      color: "#6366F1",
      colorDark: "#4F46E5",
      icon: Briefcase,
      path: "/operations",
    }, // Indigo
    {
      id: "capital",
      name: "IB Capital",
      color: "#14B8A6",
      colorDark: "#0D9488",
      icon: Building2,
      path: "/capital",
    }, // Teal
    {
      id: "finance",
      name: "IB Finance",
      color: "#10B981",
      colorDark: "#059669",
      icon: TrendingUp,
      path: "/finance",
    }, // Green
  ];

  // Get current theme color based on selected solution
  const currentSolution = solutions.find((s) => s.id === selectedSolution);
  const themeColor = currentSolution?.color || "#06B6D4";
  const themeColorDark = currentSolution?.colorDark || "#0891B2";

  const moduleGroups = [
    {
      label: "Revenue",
      color: "from-[#033F99] to-[#033F99]",
      items: [
        {
          name: "Lead",
          path: "/commerce/lead",
          description: "Lead & Opportunity Management",
          icon: UserPlus,
        },
        {
          name: "Evaluate",
          path: "/commerce/evaluate",
          description: "Proposal & Quote Generation",
          icon: FileText,
        },
        {
          name: "Commit",
          path: "/commerce/commit",
          description: "Contract & Order Management",
          icon: FileCheck,
        },
        {
          name: "Execute",
          path: "/commerce/execute",
          description: "Fulfillment & Delivery",
          icon: Package,
        },
        {
          name: "Bill",
          path: "/commerce/bill",
          description: "Customer Billing & Invoicing",
          icon: Receipt,
        },
        {
          name: "Collect",
          path: "/commerce/collect",
          description: "Collection & Receivables",
          icon: DollarSign,
        },
      ],
    },
    {
      label: "Procurement",
      color: "from-purple-600 to-purple-700",
      items: [
        {
          name: "Procure",
          path: "/commerce/procure",
          description: "Procurement & Purchase Orders",
          icon: ShoppingCart,
        },
        {
          name: "Pay",
          path: "/commerce/pay",
          description: "Vendor Payment Management",
          icon: CreditCard,
        },
        {
          name: "Spend",
          path: "/commerce/spend",
          description: "Expense Management",
          icon: Wallet,
        },
      ],
    },
    {
      label: "Governance",
      color: "from-amber-600 to-amber-700",
      items: [
        {
          name: "Tax",
          path: "/commerce/tax",
          description: "Tax Compliance & Filing",
          icon: Calculator,
        },
        {
          name: "Reconcile",
          path: "/commerce/reconcile",
          description: "Reconciliation & Matching",
          icon: ClipboardCheck,
        },
        {
          name: "Govern",
          path: "/commerce/govern",
          description: "Governance & SOP Management",
          icon: Shield,
        },
      ],
    },
  ];

  const [activeModuleDropdown, setActiveModuleDropdown] = useState(null);

  const isActive = (path) => {
    if (path === "/commerce") {
      return location.pathname === "/commerce";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex overflow-hidden"
      style={{ fontFamily: "Poppins" }}
    >
      {/* LEFT NAVIGATION - Fixed, No Scroll */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white/70 backdrop-blur-xl border-r-2 border-[#033F99]/30 flex flex-col transition-all duration-300 shadow-2xl z-40 ${leftNavCollapsed ? "w-20" : "w-64"}`}
        onMouseEnter={() => setLeftNavCollapsed(false)}
        onMouseLeave={() => setLeftNavCollapsed(true)}
      >
        {/* Logo / Brand - Company name only when expanded */}
        <div className="h-20 flex items-center justify-center px-4 border-b-2 border-[#033F99]/30">
          <Link to="/workspace" className="flex items-center gap-3">
            <img
              src="/innovate-books-logo-new.png"
              alt="Innovate Books"
              className="h-10 w-10 flex-shrink-0"
            />
            {!leftNavCollapsed && (
              <span className="font-black text-xl bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent whitespace-nowrap">
                Innovate Books
              </span>
            )}
          </Link>
        </div>

        {/* Primary Navigation Items */}
        <nav className="flex-1 py-8 px-4 space-y-3">
          {/* Workspace */}
          <div className="relative group">
            <button
              onClick={() => {
                setActiveLeftNav("workspace");
                navigate("/workspace");
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${activeLeftNav === "workspace"
                  ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-2xl shadow-[#033F99]/50"
                  : "text-[#033F99] hover:bg-white/50 hover:shadow-xl backdrop-blur-sm border-2 border-transparent hover:border-[#033F99]/30"
                }`}
            >
              <MessageSquare className="h-6 w-6 flex-shrink-0" />
              {!leftNavCollapsed && (
                <span className="text-base">Workspace</span>
              )}
            </button>
            {leftNavCollapsed && (
              <div className="absolute left-full ml-3 px-4 py-2 bg-[#033F99] text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                Workspace
              </div>
            )}
          </div>

          {/* Solutions */}
          <div className="relative group">
            <button
              onClick={() => {
                setActiveLeftNav("solutions");
                navigate("/commerce");
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${activeLeftNav === "solutions"
                  ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-2xl shadow-[#033F99]/50"
                  : "text-[#033F99] hover:bg-white/50 hover:shadow-xl backdrop-blur-sm border-2 border-transparent hover:border-[#033F99]/30"
                }`}
            >
              <LayoutGrid className="h-6 w-6 flex-shrink-0" />
              {!leftNavCollapsed && (
                <span className="text-base">Solutions</span>
              )}
            </button>
            {leftNavCollapsed && (
              <div className="absolute left-full ml-3 px-4 py-2 bg-[#033F99] text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                Solutions
              </div>
            )}
          </div>

          {/* Reports */}
          <div className="relative group">
            <button
              onClick={() => {
                setActiveLeftNav("reports");
                navigate("/reports");
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${activeLeftNav === "reports"
                  ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-2xl shadow-[#033F99]/50"
                  : "text-[#033F99] hover:bg-white/50 hover:shadow-xl backdrop-blur-sm border-2 border-transparent hover:border-[#033F99]/30"
                }`}
            >
              <BarChart3 className="h-6 w-6 flex-shrink-0" />
              {!leftNavCollapsed && <span className="text-base">Reports</span>}
            </button>
            {leftNavCollapsed && (
              <div className="absolute left-full ml-3 px-4 py-2 bg-[#033F99] text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                Reports
              </div>
            )}
          </div>
        </nav>

        {/* Utility Section (Bottom) */}
        <div className="border-t border-slate-200 p-3 space-y-2">
          <div className="relative group">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-all ${leftNavCollapsed ? "justify-center" : ""}`}
            >
              <Search className="h-5 w-5 flex-shrink-0" />
              {!leftNavCollapsed && <span className="text-sm">Search</span>}
            </button>
            {leftNavCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 bottom-0">
                Search
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-all relative ${leftNavCollapsed ? "justify-center" : ""}`}
            >
              <Bell className="h-5 w-5 flex-shrink-0" />
              {!leftNavCollapsed && (
                <span className="text-sm">Notifications</span>
              )}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {leftNavCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 bottom-0">
                Notifications
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all ${leftNavCollapsed ? "justify-center" : ""}`}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              {!leftNavCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.role || "Admin"}
                  </p>
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div
                className={`absolute ${leftNavCollapsed ? "left-full ml-2 bottom-0" : "bottom-full left-0 mb-2"} w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50`}
              >
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-900">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email || ""}</p>
                </div>
                <Link
                  to="/workspace/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <User className="h-4 w-4 text-[#033F99]" />
                  <span className="text-sm font-medium">Profile</span>
                </Link>
                <Link
                  to="/workspace/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <Settings className="h-4 w-4 text-[#033F99]" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
                <hr className="my-2 border-slate-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-bold">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE: TOP NAV + MAIN CONTENT */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${leftNavCollapsed ? "ml-20" : "ml-64"}`}
      >
        {/* TOP NAVIGATION - Fixed, No Scroll */}
        <header
          className="fixed top-0 right-0 h-20 bg-white/70 backdrop-blur-xl border-b-2 border-[#033F99]/30 flex items-center px-8 justify-between shadow-2xl z-30"
          style={{
            left: leftNavCollapsed ? "80px" : "256px",
            transition: "left 300ms",
          }}
        >
          {/* WORKSPACE MODE */}
          {activeLeftNav === "workspace" && (
            <>
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-black bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                  Workspace
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/workspace/chat")}
                    className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm"
                  >
                    IB Chat
                  </button>
                  <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm">
                    Approvals
                  </button>
                  <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm">
                    Tasks
                  </button>
                  <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm">
                    Notifications
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </button>
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-2xl shadow-2xl shadow-[#033F99]/50 hover:shadow-[#033F99]/60 transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create</span>
                  </button>
                  {createDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#033F99]/30 py-3 z-[9999]">
                      <button className="w-full text-left px-5 py-3 hover:bg-[#C4D9F4]/50 text-[#033F99] text-sm font-bold transition-all">
                        Create Task
                      </button>
                      <button className="w-full text-left px-5 py-3 hover:bg-[#C4D9F4]/50 text-[#033F99] text-sm font-bold transition-all">
                        Create Announcement
                      </button>
                      <button className="w-full text-left px-5 py-3 hover:bg-[#C4D9F4]/50 text-[#033F99] text-sm font-bold transition-all">
                        Create SOP Trigger
                      </button>
                      <button className="w-full text-left px-5 py-3 hover:bg-[#C4D9F4]/50 text-[#033F99] text-sm font-bold transition-all">
                        Create Note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SOLUTIONS MODE */}
          {activeLeftNav === "solutions" && (
            <>
              <div className="flex items-center gap-6">
                {/* Solution Selector Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() =>
                      setSolutionDropdownOpen(!solutionDropdownOpen)
                    }
                    className="flex items-center gap-3 px-6 py-3 text-white rounded-2xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: `linear-gradient(to right, ${themeColor}, ${themeColorDark})`,
                      boxShadow: `0 20px 25px -5px ${themeColor}50, 0 8px 10px -6px ${themeColor}50`,
                    }}
                  >
                    <span className="text-base">
                      {solutions.find((s) => s.id === selectedSolution)?.name ||
                        "IB Commerce"}
                    </span>
                    <ChevronDown className="h-5 w-5" />
                  </button>

                  {solutionDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{ borderColor: `${themeColor}80` }}
                    >
                      {/* Compact Header */}
                      <div
                        className="px-5 py-3 border-b"
                        style={{
                          background: `linear-gradient(to right, ${themeColor}, ${themeColorDark})`,
                          borderColor: `${themeColor}40`,
                        }}
                      >
                        <p className="text-base font-bold text-white">
                          Select Solution
                        </p>
                      </div>

                      {/* Compact Solutions List */}
                      <div className="py-2">
                        {solutions.map((solution) => {
                          const Icon = solution.icon;
                          return (
                            <Link
                              key={solution.id}
                              to={solution.path}
                              onClick={() => {
                                setSelectedSolution(solution.id);
                                setSolutionDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-all duration-200 group ${selectedSolution === solution.id
                                  ? "bg-gradient-to-r from-[#C4D9F4]/70 to-[#C4D9F4]/50 border border-[#033F99] shadow-md"
                                  : "hover:bg-[#C4D9F4]/40 border border-transparent hover:border-[#033F99]/30"
                                }`}
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200"
                                style={{
                                  background: `linear-gradient(135deg, ${solution.color}, ${solution.color}dd)`,
                                }}
                              >
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900">
                                  {solution.name}
                                </p>
                              </div>
                              {selectedSolution === solution.id && (
                                <div className="w-2 h-2 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full"></div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Module Groups (Revenue, Procurement, Governance) */}
                {selectedSolution === "commerce" && (
                  <div className="flex items-center gap-2">
                    {moduleGroups.map((group) => (
                      <div
                        key={group.label}
                        className="relative dropdown-container"
                      >
                        <button
                          onClick={() =>
                            setActiveModuleDropdown(
                              activeModuleDropdown === group.label
                                ? null
                                : group.label,
                            )
                          }
                          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${group.items.some((item) => isActive(item.path))
                              ? "text-white shadow-xl"
                              : "hover:bg-white/70 hover:shadow-lg border-2 border-transparent backdrop-blur-sm"
                            }`}
                          style={
                            group.items.some((item) => isActive(item.path))
                              ? {
                                background: `linear-gradient(to right, ${themeColor}, ${themeColorDark})`,
                                boxShadow: `0 20px 25px -5px ${themeColor}40, 0 8px 10px -6px ${themeColor}40`,
                              }
                              : {
                                color: themeColor,
                                borderColor: `${themeColor}30`,
                              }
                          }
                        >
                          <span>{group.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${activeModuleDropdown === group.label ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Module Dropdown - Compact */}
                        {activeModuleDropdown === group.label && (
                          <div
                            className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
                            style={{ borderColor: `${themeColor}80` }}
                          >
                            {/* Compact Header */}
                            <div
                              className="px-4 py-3 border-b"
                              style={{
                                background: `linear-gradient(to right, ${themeColor}, ${themeColorDark})`,
                                borderColor: `${themeColor}40`,
                              }}
                            >
                              <p className="text-base font-bold text-white">
                                {group.label} Cycle
                              </p>
                            </div>

                            {/* Compact Module Items */}
                            <div className="py-2 max-h-[360px] overflow-y-auto">
                              {group.items.map((item) => {
                                const ItemIcon = item.icon;
                                return (
                                  <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() =>
                                      setActiveModuleDropdown(null)
                                    }
                                    className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-all duration-200 group shadow-md border`}
                                    style={
                                      isActive(item.path)
                                        ? {
                                          background: `linear-gradient(to right, ${themeColor}10, ${themeColor}30)`,
                                          borderColor: themeColor,
                                        }
                                        : {
                                          background: "transparent",
                                          borderColor: "transparent",
                                        }
                                    }
                                  >
                                    <div
                                      className={`p-2.5 rounded-xl shadow-lg transition-all duration-200 group-hover:scale-105`}
                                      style={{
                                        background: `linear-gradient(to bottom right, ${themeColor}, ${themeColorDark})`,
                                        transform: isActive(item.path)
                                          ? "scale(1.05)"
                                          : "scale(1)",
                                      }}
                                    >
                                      <ItemIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`font-bold text-sm transition-colors`}
                                        style={{
                                          color: isActive(item.path)
                                            ? themeColor
                                            : "#0F172A",
                                        }}
                                      >
                                        {item.name}
                                      </p>
                                      <p className="text-[11px] text-slate-600 leading-snug font-medium truncate">
                                        {item.description}
                                      </p>
                                    </div>
                                    {isActive(item.path) && (
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                          background: `linear-gradient(to bottom right, ${themeColor}, ${themeColorDark})`,
                                        }}
                                      ></div>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </button>
                <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-2xl shadow-2xl shadow-[#033F99]/50 hover:shadow-[#033F99]/60 transition-all duration-300 transform hover:scale-105">
                  <Plus className="h-5 w-5" />
                  <span>Add</span>
                </button>
              </div>
            </>
          )}

          {/* REPORTS MODE */}
          {activeLeftNav === "reports" && (
            <>
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-black bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent">
                  Reports
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm">
                    Favorites
                  </button>
                  <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm">
                    Builder
                  </button>
                  <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm">
                    Schedule
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 text-sm font-bold text-[#033F99] hover:bg-white/70 hover:shadow-lg rounded-xl border-2 border-transparent hover:border-[#033F99]/30 transition-all backdrop-blur-sm">
                  Date Range
                </button>
                <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] hover:from-[#033F99] hover:to-[#033F99] text-white font-bold rounded-2xl shadow-2xl shadow-[#033F99]/50 hover:shadow-[#033F99]/60 transition-all duration-300 transform hover:scale-105">
                  Export
                </button>
              </div>
            </>
          )}
        </header>

        {/* MAIN CONTENT AREA - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white mt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
