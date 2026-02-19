import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Activity,
  TrendingUp,
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  CreditCard,
  Wallet,
  Receipt,
  Scale,
  Shield,
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Bell,
  HelpCircle,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { authService } from "../../utils/auth";
import { toast } from "sonner";

const FinanceLayout = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const user = authService.getUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const moduleGroups = [
    {
      label: "Cash Flow",
      color: "from-[#033F99] to-[#033F99]",
      items: [
        {
          name: "Actuals",
          icon: DollarSign,
          path: "/finance/cashflow/actuals",
          description: "Real-time cash position & actuals",
        },
        {
          name: "Budgeting",
          icon: Calendar,
          path: "/finance/cashflow/budgeting",
          description: "Cash flow budget planning",
        },
        {
          name: "Forecasting",
          icon: TrendingUp,
          path: "/finance/cashflow/forecasting",
          description: "AI-powered cash forecasts",
        },
        {
          name: "Variance",
          icon: BarChart3,
          path: "/finance/cashflow/variance",
          description: "Actual vs Budget analysis",
        },
      ],
    },
    {
      label: "Financial Reporting",
      color: "from-purple-600 to-purple-700",
      items: [
        {
          name: "P&L",
          icon: FileText,
          path: "/finance/financial-reporting/profit-loss",
          description: "Profit & Loss Statement",
        },
        {
          name: "Balance Sheet",
          icon: Scale,
          path: "/finance/financial-reporting/balance-sheet",
          description: "Assets, Liabilities & Equity",
        },
        {
          name: "Cash Flow",
          icon: Wallet,
          path: "/finance/financial-reporting/cashflow",
          description: "Cash Flow Statement",
        },
        {
          name: "Trial Balance",
          icon: Receipt,
          path: "/finance/financial-reporting/trial-balance",
          description: "Trial Balance Report",
        },
        {
          name: "General Ledger",
          icon: FileText,
          path: "/finance/financial-reporting/general-ledger",
          description: "Complete ledger view",
        },
      ],
    },
    {
      label: "Accounting",
      color: "from-amber-600 to-amber-700",
      items: [
        {
          name: "Invoices",
          icon: Receipt,
          path: "/finance/invoices",
          description: "Customer invoicing",
        },
        {
          name: "Bills",
          icon: CreditCard,
          path: "/finance/bills",
          description: "Vendor bill management",
        },
        {
          name: "Collections",
          icon: DollarSign,
          path: "/finance/collections",
          description: "Receivables tracking",
        },
        {
          name: "Customers",
          icon: User,
          path: "/finance/customers",
          description: "Customer management",
        },
        {
          name: "Vendors",
          icon: User,
          path: "/finance/vendors",
          description: "Vendor management",
        },
      ],
    },
  ];

  const isActive = (path) => {
    if (path === "/finance") {
      return location.pathname === "/finance";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50"
      style={{ fontFamily: "Poppins" }}
    >
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] shadow-lg sticky top-0 z-50">
        <div className="max-w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link to="/finance" className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-all duration-300 group-hover:scale-105 border border-white/20">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">IB Finance</h1>
                  <p className="text-xs font-semibold text-white/70">
                    Financial Intelligence OS
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Dashboard */}
                <Link
                  to="/finance"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${location.pathname === "/finance"
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="text-sm">Dashboard</span>
                </Link>

                {/* Module Dropdowns */}
                {moduleGroups.map((group) => (
                  <div
                    key={group.label}
                    className="relative dropdown-container"
                  >
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === group.label ? null : group.label,
                        )
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${group.items.some((item) => isActive(item.path))
                          ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      <span className="text-sm">{group.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === group.label ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Premium Dropdown Menu */}
                    {activeDropdown === group.label && (
                      <div className="absolute top-full left-0 mt-3 w-[420px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-[#033F99]/50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Premium Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-[#033F99] to-[#033F99]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                              <div className="w-1.5 h-6 rounded-full bg-white"></div>
                            </div>
                            <div>
                              <p className="text-base font-bold text-white">
                                {group.label}
                              </p>
                              <p className="text-xs text-white/70 font-medium">
                                {group.items.length} modules
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-3">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setActiveDropdown(null)}
                                className={`flex items-start gap-4 mx-3 px-4 py-4 rounded-2xl transition-all duration-200 group ${isActive(item.path)
                                    ? "bg-gradient-to-r from-[#033F99] to-[#C4D9F4] shadow-md border-2 border-[#033F99]"
                                    : "hover:bg-[#C4D9F4] border-2 border-transparent hover:border-[#033F99] hover:shadow-sm"
                                  }`}
                              >
                                <div
                                  className={`p-3 rounded-xl transition-all duration-200 shadow-lg ${isActive(item.path)
                                      ? "bg-gradient-to-br from-[#033F99] to-[#033F99]"
                                      : "bg-gradient-to-br from-[#033F99] to-[#033F99] group-hover:from-[#033F99] group-hover:to-[#033F99]"
                                    }`}
                                >
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-base mb-1 text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    {item.description}
                                  </p>
                                </div>
                                {isActive(item.path) && (
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 bg-gradient-to-r from-[#033F99] to-[#033F99] rounded-full"></div>
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>

                        {/* Premium Footer */}
                        <div className="px-6 py-3 bg-[#C4D9F4]/50 border-t-2 border-[#033F99]">
                          <p className="text-xs text-[#033F99] font-semibold text-center">
                            AI-Powered {group.label} Management
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button className="relative p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full ring-2 ring-[#033F99]"></span>
              </button>

              {/* Settings */}
              <Link to="/finance/settings">
                <button className="hidden md:block p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                  <Settings className="h-5 w-5" />
                </button>
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="hidden md:flex items-center gap-3 pl-3 border-l border-white/20 ml-2"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                    <span className="text-white text-sm font-bold">
                      {user?.full_name?.charAt(0) ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-bold text-white">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs text-white/70 font-medium">
                      {user?.role || "Finance Manager"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/80" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#033F99] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-[#033F99]">
                      <p className="text-sm font-bold text-slate-900">
                        {user?.full_name || "User"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/finance/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#C4D9F4] transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 text-[#033F99]" />
                      <span className="text-sm font-medium text-slate-700">
                        My Profile
                      </span>
                    </Link>

                    <Link
                      to="/finance/settings"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#C4D9F4] transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-[#033F99]" />
                      <span className="text-sm font-medium text-slate-700">
                        Settings
                      </span>
                    </Link>

                    <div className="border-t border-[#033F99] my-2"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-bold text-red-600">
                        Log Out
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#033F99] bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Dashboard */}
              <Link
                to="/finance"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 ${location.pathname === "/finance"
                    ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white"
                    : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-semibold text-sm">Dashboard</span>
              </Link>

              {/* Module Groups */}
              {moduleGroups.map((group) => (
                <div key={group.label} className="mb-4">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div
                      className={`w-1 h-4 rounded-full bg-gradient-to-b ${group.color}`}
                    ></div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {group.label}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive(item.path)
                              ? `bg-gradient-to-r ${group.color} text-white`
                              : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs opacity-80">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <Link
                  to="/finance/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-semibold text-sm">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-full px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#033F99]/50 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default FinanceLayout;
