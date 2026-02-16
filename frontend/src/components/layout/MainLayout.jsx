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
  ChevronRight
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cashFlowExpanded, setCashFlowExpanded] = useState(false);
  const [arExpanded, setArExpanded] = useState(false);
  const [apExpanded, setApExpanded] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 sidebar flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/innovate-books-logo.png"
              alt="Innovate Books"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins' }} data-testid="app-logo">IB Finance</h1>
              <p className="text-white/70 text-xs">Financial Intelligence OS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {menuItems.map((item, index) => {
            if (item.children) {
              return (
                <div key={`item-${index}`}>
                  <div
                    className="sidebar-item flex items-center justify-between"
                    onClick={() => item.setExpanded(!item.expanded)}
                    data-testid={`menu-${item.label.toLowerCase().replace(/ /g, '-')}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.label}</span>
                    </div>
                    {item.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  {item.expanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className={`sidebar-item block text-sm ${location.pathname === child.path ? 'active' : ''}`}
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
                className={`sidebar-item flex items-center gap-3 ${location.pathname === item.path ? 'active' : ''}`}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {authService.getUser()?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{authService.getUser()?.full_name}</p>
                <p className="text-white/70 text-xs">{authService.getUser()?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
