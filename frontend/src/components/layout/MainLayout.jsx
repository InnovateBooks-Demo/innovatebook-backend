import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../utils/auth';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Clock,
  PhoneCall,
  Building2,
  Receipt,
  DollarSign,
  Landmark,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu // RESPONSIVE CHANGE
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cashFlowExpanded, setCashFlowExpanded] = useState(false);
  const [arExpanded, setArExpanded] = useState(false);
  const [apExpanded, setApExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/financial-reporting', label: 'Financial Reporting', icon: FileText },
    {
      label: 'Cash Flow Analysis',
      icon: TrendingUp,
      expanded: cashFlowExpanded,
      setExpanded: setCashFlowExpanded,
      children: [
        { path: '/cashflow/actuals', label: 'Actuals' },
        { path: '/cashflow/budgeting', label: 'Budgeting' },
        { path: '/cashflow/forecasting', label: 'Forecasting' },
        { path: '/cashflow/variance', label: 'Variance' },
      ]
    },
    {
      label: 'Receivable',
      icon: Users,
      expanded: arExpanded,
      setExpanded: setArExpanded,
      children: [
        { path: '/customers', label: 'Customers' },
        { path: '/invoices', label: 'Invoices' },
        { path: '/aging-dso', label: 'Aging & DSO' },
        { path: '/collections', label: 'Collections' },
      ]
    },
    {
      label: 'Payable',
      icon: Building2,
      expanded: apExpanded,
      setExpanded: setApExpanded,
      children: [
        { path: '/vendors', label: 'Vendors' },
        { path: '/bills', label: 'Bills' },
        { path: '/aging-dpo', label: 'Aging & DPO' },
        { path: '/payments', label: 'Payments' },
      ]
    },
    { path: '/banking', label: 'Banking', icon: Landmark },
    { path: '/adjustment-entries', label: 'Adjustment Entries', icon: FileText },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" // RESPONSIVE CHANGE
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 bg-[#033F99] z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col // RESPONSIVE CHANGE
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} // RESPONSIVE CHANGE
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/innovate-books-logo.png"
              alt="Innovate Books"
              className="w-10 h-10 object-contain brightness-0 invert"
            />
            <div>
              <h1 className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: 'Poppins' }} data-testid="app-logo">IB Finance</h1>
              <p className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">Intelligence OS</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10" // RESPONSIVE CHANGE
            onClick={() => setIsSidebarOpen(false)}
          >
            <ChevronRight className="h-5 w-5 transform rotate-180" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
          {menuItems.map((item, index) => {
            if (item.children) {
              return (
                <div key={`item-${index}`} className="mb-2">
                  <div
                    className={`sidebar-item flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/10 ${item.expanded ? 'bg-white/5' : ''}`}
                    onClick={() => item.setExpanded(!item.expanded)}
                    data-testid={`menu-${item.label.toLowerCase().replace(/ /g, '-')}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className={`h-5 w-5 ${item.expanded ? 'text-white' : 'text-white/70'}`} />}
                      <span className={`font-medium ${item.expanded ? 'text-white' : 'text-white/80'}`}>{item.label}</span>
                    </div>
                    {item.expanded ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                  </div>
                  {item.expanded && (
                    <div className="ml-4 mt-1 border-l border-white/10 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`
                            block px-8 py-2.5 rounded-r-xl text-sm transition-all duration-200
                            ${location.pathname === child.path
                              ? 'bg-white/10 text-white font-semibold border-l-2 border-white'
                              : 'text-white/60 hover:text-white hover:bg-white/5'}
                          `}
                          data-testid={`menu-${child.path.slice(1)}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={`item-${index}`}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-white text-[#033F99] font-bold shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'}
                `}
                data-testid={`menu-${item.path.slice(1)}`}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-base font-bold">
                {authService.getUser()?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{authService.getUser()?.full_name}</p>
              <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider">{authService.getUser()?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-white hover:bg-red-500/20 hover:text-red-400 shrink-0"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white min-w-0"> // RESPONSIVE CHANGE
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white"> // RESPONSIVE CHANGE
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <img src="/innovate-books-logo.png" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-[#033F99] text-sm tracking-tight">IB FINANCE</span>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-bold">
              {authService.getUser()?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
