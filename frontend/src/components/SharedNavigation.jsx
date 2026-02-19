import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, UserPlus, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const SharedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
    setIsMenuOpen(false);
  };

  // Check if current path matches the nav link
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/workspace-overview", label: "Workspace" },
    { path: "/solutions", label: "Solutions" },
    { path: "/pricing", label: "Pricing" },
    { path: "/intelligence-overview", label: "Intelligence" },
    { path: "/contact", label: "Contact" },
  ];

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-[#033F99] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 sm:gap-3" onClick={handleNavClick}>
            <img
              src="/innovate-books-logo-new.png"
              alt="Innovate Books"
              className="h-10 sm:h-12 w-auto brightness-0 invert"
            />
            <div className="flex flex-col sm:block">
              <span className="font-bold text-lg sm:text-2xl text-white">
                Innovate Books
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm xl:text-base ${isActive(link.path)
                  ? "bg-white text-[#033F99] shadow-lg"
                  : "text-white hover:bg-white/10"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-8 bg-white/20 mx-2"></div>

            {isAuthenticated ? (
              <>
                <Link to="/commerce">
                  <Button
                    size="lg"
                    className="bg-white text-[#033F99] hover:bg-white/90 font-bold rounded-xl shadow-lg transition-all duration-300 px-6 py-2.5 flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  size="lg"
                  className="bg-transparent text-white border-2 border-white/40 hover:bg-white/10 font-bold rounded-xl transition-all duration-300 px-6 py-2.5 ml-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button
                    size="lg"
                    className="bg-white text-[#033F99] hover:bg-white/90 font-bold rounded-xl shadow-lg transition-all duration-300 px-6 py-2.5 flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup" className="ml-2">
                  <Button
                    size="lg"
                    className="bg-transparent text-white border-2 border-white/40 hover:bg-white/10 font-bold rounded-xl transition-all duration-300 px-6 py-2.5 flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#033F99] border-t border-white/10 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleNavClick}
                className={`block px-4 py-4 rounded-xl font-semibold text-lg transition-all ${isActive(link.path)
                  ? "bg-white text-[#033F99]"
                  : "text-white hover:bg-white/10"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/commerce" onClick={handleNavClick} className="block">
                    <Button
                      className="w-full bg-white text-[#033F99] hover:bg-white/90 font-bold rounded-xl py-6 text-lg flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full bg-transparent text-white border-2 border-white/40 hover:bg-white/10 font-bold rounded-xl py-6 text-lg"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={handleNavClick} className="block">
                    <Button
                      className="w-full bg-white text-[#033F99] hover:bg-white/90 font-bold rounded-xl py-6 text-lg flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-5 w-5" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth/signup" onClick={handleNavClick} className="block">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent text-white border-2 border-white/40 hover:bg-white/10 font-bold rounded-xl py-6 text-lg flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-5 w-5" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SharedNavigation;
