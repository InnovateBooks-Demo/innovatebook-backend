import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
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
  Target,
  Handshake,
  Share2,
  FileUser,
  LayoutDashboard,
  CheckCircle,
  Hash,
  ListTodo,
  FolderKanban,
  BookOpen,
  Lock,
  Server,
  Lightbulb,
  Brain,
  Activity,
} from "lucide-react";
import { authService } from "../../utils/auth";
import { toast } from "sonner";
import GlobalSearch from "../../components/GlobalSearch";
import NotificationCenter, {
  NotificationBell,
} from "../../components/NotificationCenter";

const WorkspaceLayout = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leftNavCollapsed, setLeftNavCollapsed] = useState(true);
  const [activeLeftNav, setActiveLeftNav] = useState("workspace");
  const [solutionsExpanded, setSolutionsExpanded] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const user = authService.getUser();

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Workspace modules for top navigation - Chat, Channels, Tasks, Approvals
  const workspaceModules = [
    {
      id: "chats",
      name: "Chat",
      path: "/workspace/chats",
      icon: MessageSquare,
    },
    {
      id: "channels",
      name: "Channels",
      path: "/workspace/channels",
      icon: Hash,
    },
    { id: "tasks", name: "Tasks", path: "/workspace/tasks", icon: ListTodo },
    {
      id: "approvals",
      name: "Approvals",
      path: "/workspace/approvals",
      icon: CheckCircle,
    },
  ];

  // Intelligence modules for top navigation - NEW SPEC
  const intelligenceModules = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/intelligence",
      icon: LayoutDashboard,
    },
    {
      id: "signals",
      name: "Signals",
      path: "/intelligence/signals",
      icon: Lightbulb,
    },
    {
      id: "metrics",
      name: "Metrics",
      path: "/intelligence/metrics",
      icon: BarChart3,
    },
    { id: "risk", name: "Risk", path: "/intelligence/risk", icon: Shield },
    {
      id: "forecast",
      name: "Forecast",
      path: "/intelligence/forecast",
      icon: TrendingUp,
    },
    {
      id: "recommendations",
      name: "Recommendations",
      path: "/intelligence/recommendations",
      icon: Target,
    },
    {
      id: "learning",
      name: "Learning",
      path: "/intelligence/learning",
      icon: BookOpen,
    },
  ];

  // Solutions configuration
  const solutions = [
    {
      id: "commerce",
      name: "IB Commerce",
      icon: ShoppingCart,
      color: "bg-[rgba(3,63,153,0.08)]0",
    },
    {
      id: "workforce",
      name: "IB Workforce",
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: "operations",
      name: "IB Operations",
      icon: Briefcase,
      color: "bg-purple-500",
    },
    {
      id: "capital",
      name: "IB Capital",
      icon: Building2,
      color: "bg-amber-500",
    },
    {
      id: "finance",
      name: "IB Finance",
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
  ];

  // Modules for each solution
  const solutionModules = {
    commerce: [
      {
        id: "parties",
        name: "Parties",
        icon: Users,
        submodules: [
          {
            name: "Customers",
            path: "/commerce/parties/customers",
            icon: Users,
          },
          {
            name: "Vendors",
            path: "/commerce/parties/vendors",
            icon: Building2,
          },
          {
            name: "Partners",
            path: "/commerce/parties/partners",
            icon: Handshake,
          },
          {
            name: "Channels",
            path: "/commerce/parties/channels",
            icon: Share2,
          },
        ],
      },
      {
        id: "catalog",
        name: "Catalog",
        icon: Package,
        submodules: [
          { name: "Items", path: "/commerce/catalog/items", icon: Package },
          {
            name: "Pricing",
            path: "/commerce/catalog/pricing",
            icon: DollarSign,
          },
          {
            name: "Costing",
            path: "/commerce/catalog/costing",
            icon: Calculator,
          },
          { name: "Rules", path: "/commerce/catalog/rules", icon: Shield },
          {
            name: "Packages",
            path: "/commerce/catalog/packages",
            icon: Package,
          },
        ],
      },
      {
        id: "revenue",
        name: "Revenue",
        icon: TrendingUp,
        submodules: [
          {
            name: "Leads",
            path: "/commerce/revenue-workflow/leads",
            icon: UserPlus,
          },
          {
            name: "Evaluate",
            path: "/commerce/revenue-workflow/evaluations",
            icon: FileText,
          },
          {
            name: "Commit",
            path: "/commerce/revenue-workflow/commits",
            icon: FileCheck,
          },
          {
            name: "Contract",
            path: "/commerce/revenue-workflow/contracts",
            icon: ClipboardCheck,
          },
          {
            name: "Handoff",
            path: "/commerce/revenue-workflow/handoffs",
            icon: Target,
          },
        ],
      },
      {
        id: "procurement",
        name: "Procurement",
        icon: ShoppingCart,
        submodules: [
          {
            name: "Requests",
            path: "/commerce/procure-workflow/requests",
            icon: ShoppingCart,
          },
          {
            name: "Evaluate",
            path: "/commerce/procure-workflow/evaluations",
            icon: FileText,
          },
          {
            name: "Commit",
            path: "/commerce/procure-workflow/commits",
            icon: FileCheck,
          },
          {
            name: "Contract",
            path: "/commerce/procure-workflow/contracts",
            icon: ClipboardCheck,
          },
          {
            name: "Handoff",
            path: "/commerce/procure-workflow/handoffs",
            icon: Target,
          },
        ],
      },
      {
        id: "governance",
        name: "Governance",
        icon: Shield,
        submodules: [
          {
            name: "Governance Engine",
            path: "/commerce/governance-engine",
            icon: Shield,
          },
          {
            name: "Policies",
            path: "/commerce/governance-engine/policies",
            icon: FileText,
          },
          {
            name: "Limits",
            path: "/commerce/governance-engine/limits",
            icon: Target,
          },
          {
            name: "Authority",
            path: "/commerce/govern/authority",
            icon: Users,
          },
          { name: "Risk", path: "/commerce/govern/risk", icon: AlertTriangle },
          {
            name: "Audit",
            path: "/commerce/govern/audit",
            icon: ClipboardCheck,
          },
        ],
      },
    ],
    finance: [
      {
        id: "billing",
        name: "Billing",
        icon: Receipt,
        submodules: [
          { name: "Billing Queue", path: "/ib-finance/billing", icon: Receipt },
        ],
      },
      {
        id: "receivables",
        name: "Receivables",
        icon: DollarSign,
        submodules: [
          {
            name: "AR Dashboard",
            path: "/ib-finance/receivables",
            icon: DollarSign,
          },
        ],
      },
      {
        id: "payables",
        name: "Payables",
        icon: CreditCard,
        submodules: [
          {
            name: "AP Dashboard",
            path: "/ib-finance/payables",
            icon: CreditCard,
          },
        ],
      },
      {
        id: "ledger",
        name: "Ledger",
        icon: BookOpen,
        submodules: [
          {
            name: "Chart of Accounts",
            path: "/ib-finance/ledger",
            icon: BookOpen,
          },
        ],
      },
      {
        id: "assets",
        name: "Assets",
        icon: Server,
        submodules: [
          { name: "Asset Register", path: "/ib-finance/assets", icon: Server },
        ],
      },
      {
        id: "tax",
        name: "Tax",
        icon: Calculator,
        submodules: [
          { name: "Tax Dashboard", path: "/ib-finance/tax", icon: Calculator },
        ],
      },
      {
        id: "close",
        name: "Close",
        icon: Lock,
        submodules: [
          { name: "Period Close", path: "/ib-finance/close", icon: Lock },
        ],
      },
    ],
    workforce: [
      {
        id: "people",
        name: "People",
        icon: Users,
        submodules: [
          {
            name: "People Directory",
            path: "/ib-workforce/people",
            icon: Users,
          },
        ],
      },
      {
        id: "roles",
        name: "Roles",
        icon: Shield,
        submodules: [
          {
            name: "Roles Directory",
            path: "/ib-workforce/roles",
            icon: Shield,
          },
        ],
      },
      {
        id: "capacity",
        name: "Capacity",
        icon: TrendingUp,
        submodules: [
          {
            name: "Capacity Overview",
            path: "/ib-workforce/capacity",
            icon: TrendingUp,
          },
        ],
      },
      {
        id: "time",
        name: "Time",
        icon: Clock,
        submodules: [
          { name: "Time Tracking", path: "/ib-workforce/time", icon: Clock },
        ],
      },
      {
        id: "payroll",
        name: "Payroll",
        icon: Wallet,
        submodules: [
          {
            name: "Payroll Dashboard",
            path: "/ib-workforce/payroll",
            icon: Wallet,
          },
        ],
      },
      {
        id: "compliance",
        name: "Compliance",
        icon: FileCheck,
        submodules: [
          {
            name: "Compliance Dashboard",
            path: "/ib-workforce/compliance",
            icon: FileCheck,
          },
        ],
      },
    ],
    operations: [
      {
        id: "intake",
        name: "Intake",
        icon: ClipboardCheck,
        submodules: [
          {
            name: "Intake Queue",
            path: "/operations/intake",
            icon: ClipboardCheck,
          },
        ],
      },
      {
        id: "projects",
        name: "Projects",
        icon: FolderKanban,
        submodules: [
          {
            name: "All Projects",
            path: "/operations/projects",
            icon: FolderKanban,
          },
        ],
      },
      {
        id: "tasks",
        name: "Tasks",
        icon: CheckCircle,
        submodules: [
          { name: "All Tasks", path: "/operations/tasks", icon: CheckCircle },
        ],
      },
      {
        id: "resources",
        name: "Resources",
        icon: Package,
        submodules: [
          { name: "Inventory", path: "/operations/inventory", icon: Package },
        ],
      },
      {
        id: "services",
        name: "Services",
        icon: Briefcase,
        submodules: [
          {
            name: "Active Services",
            path: "/operations/services",
            icon: Briefcase,
          },
        ],
      },
      {
        id: "governance",
        name: "Governance",
        icon: Shield,
        submodules: [
          {
            name: "Governance Dashboard",
            path: "/operations/governance",
            icon: Shield,
          },
        ],
      },
    ],
    capital: [
      {
        id: "ownership",
        name: "Ownership",
        icon: PieChart,
        submodules: [
          { name: "Cap Table", path: "/ib-capital/ownership", icon: PieChart },
        ],
      },
      {
        id: "equity",
        name: "Equity",
        icon: TrendingUp,
        submodules: [
          {
            name: "Funding Rounds",
            path: "/ib-capital/equity",
            icon: TrendingUp,
          },
        ],
      },
      {
        id: "debt",
        name: "Debt",
        icon: Building2,
        submodules: [
          {
            name: "Debt Instruments",
            path: "/ib-capital/debt",
            icon: Building2,
          },
        ],
      },
      {
        id: "treasury",
        name: "Treasury",
        icon: Wallet,
        submodules: [
          {
            name: "Cash Management",
            path: "/ib-capital/treasury",
            icon: Wallet,
          },
        ],
      },
      {
        id: "returns",
        name: "Returns",
        icon: DollarSign,
        submodules: [
          {
            name: "Dividends & Interest",
            path: "/ib-capital/returns",
            icon: DollarSign,
          },
        ],
      },
      {
        id: "governance",
        name: "Governance",
        icon: Shield,
        submodules: [
          {
            name: "Approvals & Rules",
            path: "/ib-capital/governance",
            icon: Shield,
          },
        ],
      },
    ],
  };

  useEffect(() => {
    // Set active nav based on current path
    if (location.pathname.startsWith("/workspace")) {
      setActiveLeftNav("workspace");
      setSolutionsExpanded(false);
    } else if (
      location.pathname.startsWith("/commerce") ||
      location.pathname.startsWith("/catalog") ||
      location.pathname.startsWith("/parties")
    ) {
      setActiveLeftNav("solutions");
      setSolutionsExpanded(true);
      setSelectedSolution("commerce");
    } else if (location.pathname.startsWith("/ib-capital")) {
      setActiveLeftNav("solutions");
      setSolutionsExpanded(true);
      setSelectedSolution("capital");
    } else if (location.pathname.startsWith("/ib-workforce")) {
      setActiveLeftNav("solutions");
      setSolutionsExpanded(true);
      setSelectedSolution("workforce");
    } else if (location.pathname.startsWith("/ib-finance")) {
      setActiveLeftNav("solutions");
      setSolutionsExpanded(true);
      setSelectedSolution("finance");
    } else if (location.pathname.startsWith("/operations")) {
      setActiveLeftNav("solutions");
      setSolutionsExpanded(true);
      setSelectedSolution("operations");
    } else if (location.pathname.startsWith("/reports")) {
      setActiveLeftNav("reports");
      setSolutionsExpanded(false);
    } else if (location.pathname.startsWith("/intelligence")) {
      setActiveLeftNav("intelligence");
      setSolutionsExpanded(false);
    }
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  const handleSolutionSelect = (solutionId) => {
    setSelectedSolution(solutionId);
    setActiveLeftNav("solutions");
    const modules = solutionModules[solutionId];
    if (modules && modules.length > 0) {
      navigate(modules[0].submodules[0].path);
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");
  const isWorkspaceModuleActive = (path) => {
    if (path === "/workspace") return location.pathname === "/workspace";
    return location.pathname.startsWith(path);
  };
  const isIntelligenceModuleActive = (path) => {
    if (path === "/intelligence") return location.pathname === "/intelligence";
    return location.pathname.startsWith(path);
  };

  const currentModules = solutionModules[selectedSolution] || [];
  const primaryNavWidth = leftNavCollapsed ? 72 : 280;

  return (
    <div
      className="h-screen bg-[#F8FAFC] flex overflow-hidden relative"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* LEFT NAVIGATION */}
      <aside
        className="fixed top-0 left-0 h-screen flex flex-col z-50 transition-all duration-300 ease-out bg-gradient-to-b from-[#3A4E63] to-[#022B6B]"
        style={{
          width: primaryNavWidth,
          boxShadow: "2px 0 20px rgba(3, 63, 153, 0.3)",
        }}
        onMouseEnter={() => setLeftNavCollapsed(false)}
        onMouseLeave={() => setLeftNavCollapsed(true)}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center border-b border-white/10 ${leftNavCollapsed ? "justify-center px-2" : "px-4"}`}
        >
          <Link to="/workspace" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0">
              <img
                src="https://customer-assets.emergentagent.com/job_finiq-chat/artifacts/znk1vaou_Innovate%20Books-3.png"
                alt="IB"
                className="w-7 h-7 object-contain"
              />
            </div>
            {!leftNavCollapsed && (
              <div className="overflow-hidden">
                <span className="font-bold text-white text-sm block whitespace-nowrap">
                  Innovate Books
                </span>
                <span className="text-xs text-white/60 font-medium">
                  Enterprise Suite
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Primary Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {/* Workspace */}
          <button
            onClick={() => {
              setActiveLeftNav("workspace");
              setSelectedSolution(null);
              setSolutionsExpanded(false);
              navigate("/workspace");
            }}
            className={`w-full flex items-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              leftNavCollapsed ? "justify-center p-3" : "px-4 py-3"
            } ${
              activeLeftNav === "workspace"
                ? "bg-white text-[#3A4E63] shadow-lg"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <MessageSquare className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
            {!leftNavCollapsed && <span>Workspace</span>}
          </button>

          {/* Solutions with Dropdown */}
          <div>
            <button
              onClick={() => {
                setSolutionsExpanded(!solutionsExpanded);
                if (!solutionsExpanded && !selectedSolution) {
                  setSelectedSolution("commerce");
                }
              }}
              className={`w-full flex items-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                leftNavCollapsed ? "justify-center p-3" : "px-4 py-3"
              } ${
                activeLeftNav === "solutions"
                  ? "bg-white text-[#3A4E63] shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <LayoutGrid className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              {!leftNavCollapsed && (
                <>
                  <span className="flex-1 text-left">Solutions</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${solutionsExpanded ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            {/* Solutions Dropdown */}
            {!leftNavCollapsed && solutionsExpanded && (
              <div className="mt-1 ml-2 space-y-0.5">
                {solutions.map((solution) => {
                  const Icon = solution.icon;
                  const isSelected = selectedSolution === solution.id;
                  return (
                    <button
                      key={solution.id}
                      onClick={() => handleSolutionSelect(solution.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isSelected
                          ? "bg-white/20 text-white font-semibold"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? "bg-white/30" : "bg-white/10"}`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span>{solution.name}</span>
                      {isSelected && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Intelligence */}
          <button
            onClick={() => {
              setActiveLeftNav("intelligence");
              setSelectedSolution(null);
              setSolutionsExpanded(false);
              navigate("/intelligence");
            }}
            className={`w-full flex items-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              leftNavCollapsed ? "justify-center p-3" : "px-4 py-3"
            } ${
              activeLeftNav === "intelligence"
                ? "bg-white text-[#3A4E63] shadow-lg"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Brain className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
            {!leftNavCollapsed && <span>Intelligence</span>}
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/10 p-2 space-y-1">
          <button
            className={`w-full flex items-center gap-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all ${leftNavCollapsed ? "justify-center p-3" : "px-4 py-3"}`}
          >
            <Search className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
            {!leftNavCollapsed && (
              <span className="text-sm font-medium">Search</span>
            )}
          </button>

          <button
            onClick={() => navigate("/workspace/notifications")}
            className={`w-full flex items-center gap-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all relative ${leftNavCollapsed ? "justify-center p-3" : "px-4 py-3"}`}
          >
            <Bell className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
            {!leftNavCollapsed && (
              <span className="text-sm font-medium">Notifications</span>
            )}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              onMouseEnter={() => setProfileDropdownOpen(true)}
              className={`w-full flex items-center gap-3 rounded-xl hover:bg-white/10 transition-all ${leftNavCollapsed ? "justify-center p-2" : "px-3 py-2"}`}
            >
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#3A4E63] font-bold text-sm flex-shrink-0">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              {!leftNavCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-white/60 text-xs truncate">
                    {user?.role || "Member"}
                  </p>
                </div>
              )}
            </button>

            {profileDropdownOpen && !leftNavCollapsed && (
              <div
                className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <Link
                  to="/admin"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                >
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    Organization Admin
                  </span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 ease-out"
        style={{ marginLeft: primaryNavWidth }}
      >
        {/* TOP NAVIGATION */}
        <header
          className="h-16 bg-gradient-to-r from-[#3A4E63] via-[#0449B8] to-[#3A4E63] flex items-center px-6 justify-between sticky top-0 z-30"
          style={{ boxShadow: "0 4px 20px rgba(3, 63, 153, 0.3)" }}
        >
          <div className="flex items-center gap-3">
            {/* WORKSPACE MODE - Show Workspace Modules */}
            {activeLeftNav === "workspace" && (
              <div className="flex items-center gap-1">
                {workspaceModules.map((module) => {
                  const ModuleIcon = module.icon;
                  const isModuleActive = isWorkspaceModuleActive(module.path);

                  return (
                    <Link
                      key={module.id}
                      to={module.path}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isModuleActive
                          ? "bg-white text-[#3A4E63] shadow-lg"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <ModuleIcon className="h-4 w-4" strokeWidth={2} />
                      <span>{module.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* SOLUTIONS MODE - Show Module Tabs for selected solution */}
            {activeLeftNav === "solutions" && selectedSolution && (
              <div className="flex items-center gap-1">
                {/* Solution Name Badge */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/20 rounded-xl mr-2">
                  {solutions.find((s) => s.id === selectedSolution)?.icon && (
                    <span className="text-white">
                      {React.createElement(
                        solutions.find((s) => s.id === selectedSolution).icon,
                        { className: "h-4 w-4" },
                      )}
                    </span>
                  )}
                  <span className="text-white font-bold text-sm">
                    {solutions.find((s) => s.id === selectedSolution)?.name}
                  </span>
                </div>

                {/* Module Tabs */}
                {currentModules.map((module) => {
                  const ModuleIcon = module.icon;
                  const isModuleActive = module.submodules.some((sub) =>
                    isActive(sub.path),
                  );
                  const isExpanded = expandedModule === module.id;

                  return (
                    <div
                      key={module.id}
                      className="relative dropdown-container"
                    >
                      <button
                        onClick={() =>
                          setExpandedModule(isExpanded ? null : module.id)
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                          isModuleActive
                            ? "bg-white text-[#3A4E63] shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <ModuleIcon className="h-4 w-4" strokeWidth={2} />
                        <span>{module.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Module Dropdown */}
                      {isExpanded && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              {module.name}
                            </p>
                          </div>
                          {module.submodules.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = isActive(sub.path);
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setExpandedModule(null)}
                                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                                  isSubActive
                                    ? "bg-[#3A4E63] text-white font-semibold"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <SubIcon
                                  className={`h-4 w-4 ${isSubActive ? "text-white" : "text-gray-500"}`}
                                />
                                <span className="text-sm">{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* INTELLIGENCE MODE */}
            {activeLeftNav === "intelligence" && (
              <div className="flex items-center gap-1">
                {intelligenceModules.map((module) => {
                  const ModuleIcon = module.icon;
                  const isModuleActive = isIntelligenceModuleActive(
                    module.path,
                  );

                  return (
                    <Link
                      key={module.id}
                      to={module.path}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isModuleActive
                          ? "bg-white text-[#3A4E63] shadow-lg"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <ModuleIcon className="h-4 w-4" strokeWidth={2} />
                      <span>{module.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side - Search & Notifications */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Search</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 bg-white/10 text-white/50 text-xs rounded font-mono ml-2">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <div className="relative">
              <NotificationBell
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                count={notificationCount}
              />
              <NotificationCenter
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onNotificationCountChange={setNotificationCount}
              />
            </div>
          </div>
        </header>

        {/* Global Search Modal */}
        <GlobalSearch
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
