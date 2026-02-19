import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  Shield,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
  Home,
  Book,
  Building2,
  Briefcase,
  Network,
  FileText,
  DollarSign,
  BarChart3,
  Target,
  CheckSquare,
  Settings,
  Database,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const IBCommerceHub = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const modules = [
    {
      id: "overview",
      name: "Overview",
      icon: Home,
      path: "/solutions/commerce/overview",
      description: "Introduction to IB Commerce",
    },
    {
      id: "parties",
      name: "Parties",
      icon: Users,
      path: "/solutions/commerce/parties",
      description: "Who You Do Business With",
      badge: "FIRST",
      subItems: [
        {
          name: "Customers",
          path: "/solutions/commerce/parties/customers",
          icon: Users,
        },
        {
          name: "Vendors",
          path: "/solutions/commerce/parties/vendors",
          icon: Building2,
        },
        {
          name: "Partners",
          path: "/solutions/commerce/parties/partners",
          icon: Briefcase,
        },
        {
          name: "Channels",
          path: "/solutions/commerce/parties/channels",
          icon: Network,
        },
        {
          name: "Profiles",
          path: "/solutions/commerce/parties/profiles",
          icon: FileText,
        },
      ],
    },
    {
      id: "catalog",
      name: "Catalog",
      icon: Package,
      path: "/solutions/commerce/catalog",
      description: "What You Can Trade",
      subItems: [
        {
          name: "Items",
          path: "/solutions/commerce/catalog/items",
          icon: Package,
        },
        {
          name: "Pricing",
          path: "/solutions/commerce/catalog/pricing",
          icon: DollarSign,
        },
        {
          name: "Costing",
          path: "/solutions/commerce/catalog/costing",
          icon: BarChart3,
        },
        {
          name: "Rules",
          path: "/solutions/commerce/catalog/rules",
          icon: Shield,
        },
        {
          name: "Packages",
          path: "/solutions/commerce/catalog/packages",
          icon: Database,
        },
      ],
    },
    {
      id: "revenue",
      name: "Revenue",
      icon: TrendingUp,
      path: "/solutions/commerce/revenue",
      description: "What You Plan to Sell",
      subItems: [
        {
          name: "Lead",
          path: "/solutions/commerce/revenue/lead",
          icon: Target,
        },
        {
          name: "Evaluate",
          path: "/solutions/commerce/revenue/evaluate",
          icon: BarChart3,
        },
        {
          name: "Commit",
          path: "/solutions/commerce/revenue/commit",
          icon: CheckSquare,
        },
        {
          name: "Contract",
          path: "/solutions/commerce/revenue/contract",
          icon: FileText,
        },
      ],
    },
    {
      id: "procurement",
      name: "Procurement",
      icon: ShoppingCart,
      path: "/solutions/commerce/procurement",
      description: "What You Plan to Buy",
      subItems: [
        {
          name: "Procure",
          path: "/solutions/commerce/procurement/procure",
          icon: ShoppingCart,
        },
        {
          name: "Evaluate",
          path: "/solutions/commerce/procurement/evaluate",
          icon: BarChart3,
        },
        {
          name: "Commit",
          path: "/solutions/commerce/procurement/commit",
          icon: CheckSquare,
        },
        {
          name: "Contract",
          path: "/solutions/commerce/procurement/contract",
          icon: FileText,
        },
      ],
    },
    {
      id: "governance",
      name: "Governance",
      icon: Shield,
      path: "/solutions/commerce/governance",
      description: "Commercial Constitution",
      subItems: [
        {
          name: "Policies",
          path: "/solutions/commerce/governance/policies",
          icon: FileText,
        },
        {
          name: "Limits",
          path: "/solutions/commerce/governance/limits",
          icon: Settings,
        },
        {
          name: "Authority",
          path: "/solutions/commerce/governance/authority",
          icon: Shield,
        },
        {
          name: "Risk Engine",
          path: "/solutions/commerce/governance/risk",
          icon: BarChart3,
        },
        {
          name: "Audit Trail",
          path: "/solutions/commerce/governance/audit",
          icon: Book,
        },
      ],
    },
  ];

  // Auto-expand the module based on current path
  const getActiveModule = () => {
    const path = location.pathname;
    if (path.includes("/parties")) return "parties";
    if (path.includes("/catalog")) return "catalog";
    if (path.includes("/revenue")) return "revenue";
    if (path.includes("/procurement")) return "procurement";
    if (path.includes("/governance")) return "governance";
    return "overview";
  };

  const [expandedModule, setExpandedModule] = useState(getActiveModule());

  // Update expanded module when location changes
  React.useEffect(() => {
    setExpandedModule(getActiveModule());
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isModuleActive = (moduleId) => location.pathname.includes(moduleId);

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { name: "Solutions", path: "/solutions" },
      { name: "Commerce", path: "/solutions/commerce" },
    ];

    // Find current module
    const currentModule = modules.find(
      (m) => path.includes(m.id) && m.id !== "overview",
    );
    if (currentModule) {
      breadcrumbs.push({ name: currentModule.name, path: currentModule.path });

      // Find current submodule
      if (currentModule.subItems) {
        const currentSubItem = currentModule.subItems.find(
          (sub) => path === sub.path,
        );
        if (currentSubItem) {
          breadcrumbs.push({
            name: currentSubItem.name,
            path: currentSubItem.path,
          });
        }
      }
    } else if (path.includes("/overview")) {
      breadcrumbs.push({
        name: "Overview",
        path: "/solutions/commerce/overview",
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      <div className="pt-20 flex">
        {/* Left Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 bg-white border-r border-slate-200 fixed left-0 top-20 bottom-0 overflow-y-auto z-40`}
        >
          <div className="p-6">
            <Link
              to="/solutions"
              className="flex items-center gap-2 text-[#033F99] hover:text-[#033F99] font-semibold mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              All Solutions
            </Link>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                IB Commerce
              </h2>
              <p className="text-sm text-slate-600">
                Commercial Intelligence Platform
              </p>
            </div>

            <nav className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isExpanded = expandedModule === module.id;
                const isCurrentModule = isModuleActive(module.id);

                return (
                  <div key={module.id}>
                    <button
                      onClick={() => {
                        setExpandedModule(isExpanded ? null : module.id);
                        navigate(module.path);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isCurrentModule
                          ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-lg"
                          : "hover:bg-slate-50 text-slate-700"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{module.name}</span>
                            {module.badge && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {module.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs ${isCurrentModule ? "text-white/80" : "text-slate-500"}`}
                          >
                            {module.description}
                          </p>
                        </div>
                      </div>
                      {module.subItems && (
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      )}
                    </button>

                    {/* Sub-items */}
                    {module.subItems && isExpanded && (
                      <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 pl-4">
                        {module.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${isActive(subItem.path)
                                  ? "bg-[#EBF3FC] text-[#033F99] font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                              <SubIcon className="h-4 w-4" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-8 p-4 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl text-white">
              <h3 className="font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-sm mb-4 opacity-90">
                Experience IB Commerce in action
              </p>
              <Link
                to="/auth/signup"
                className="block w-full text-center bg-white text-[#033F99] font-bold py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-4 top-24 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg border border-slate-200"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Main Content */}
        <main
          className={`flex-1 ${sidebarOpen ? "ml-80" : "ml-0"} transition-all duration-300 p-8`}
        >
          {/* Breadcrumb Navigation */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-[#033F99]">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-slate-600 hover:text-[#033F99] transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
};

export default IBCommerceHub;
