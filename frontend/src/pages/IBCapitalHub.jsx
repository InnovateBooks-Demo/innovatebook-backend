import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Landmark,
  Building2,
  PiggyBank,
  CreditCard,
  LineChart,
  Zap,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
  Home,
} from "lucide-react";
import SharedNavigation from "../components/SharedNavigation";

const IBCapitalHub = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const modules = [
    {
      id: "overview",
      name: "Overview",
      icon: Home,
      path: "/solutions/capital/overview",
      description: "Introduction to IB Capital",
    },
    {
      id: "banks",
      name: "Banks",
      icon: Building2,
      path: "/solutions/capital/banks",
      description: "Multi-Bank Aggregation",
      badge: "CORE",
    },
    {
      id: "treasury",
      name: "Treasury",
      icon: PiggyBank,
      path: "/solutions/capital/treasury",
      description: "Investment Management",
    },
    {
      id: "credit",
      name: "Credit Lines",
      icon: CreditCard,
      path: "/solutions/capital/credit",
      description: "Debt Management",
    },
    {
      id: "forecasting",
      name: "Forecasting",
      icon: LineChart,
      path: "/solutions/capital/forecasting",
      description: "AI Cash Predictions",
    },
    {
      id: "optimization",
      name: "Optimization",
      icon: Zap,
      path: "/solutions/capital/optimization",
      description: "Smart Recommendations",
    },
  ];

  const getActiveModule = () => {
    const path = location.pathname;
    for (const module of modules) {
      if (path.includes(module.id)) return module.id;
    }
    return "overview";
  };

  const [expandedModule, setExpandedModule] = useState(getActiveModule());

  useEffect(() => {
    setExpandedModule(getActiveModule());
  }, [location.pathname]);

  const isModuleActive = (moduleId) => location.pathname.includes(moduleId);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { name: "Solutions", path: "/solutions" },
      { name: "Capital", path: "/solutions/capital" },
    ];

    const currentModule = modules.find(
      (m) => path.includes(m.id) && m.id !== "overview",
    );
    if (currentModule) {
      breadcrumbs.push({ name: currentModule.name, path: currentModule.path });
    } else if (path.includes("/overview")) {
      breadcrumbs.push({
        name: "Overview",
        path: "/solutions/capital/overview",
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-white">
      <SharedNavigation />

      <div className="pt-20 flex">
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
                IB Capital
              </h2>
              <p className="text-sm text-slate-600">
                Treasury & Cash Intelligence
              </p>
            </div>

            <nav className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isCurrentModule = isModuleActive(module.id);

                return (
                  <div key={module.id}>
                    <button
                      onClick={() => {
                        setExpandedModule(module.id);
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
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
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
                    </button>
                  </div>
                );
              })}
            </nav>

            <div className="mt-8 p-4 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl text-white">
              <h3 className="font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-sm mb-4 opacity-90">
                Transform your treasury management
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

        <main
          className={`flex-1 ${sidebarOpen ? "ml-80" : "ml-0"} transition-all duration-300 p-8`}
        >
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

export default IBCapitalHub;
