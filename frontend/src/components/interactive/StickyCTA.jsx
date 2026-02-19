import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Zap, Phone } from "lucide-react";

export const StickyCTA = ({
  primaryText = "Start Free Trial",
  primaryLink = "/auth/signup",
  secondaryText = "Book a Demo",
  secondaryLink = "/contact",
  showOnScroll = 100,
  variant = "default", // default, minimal, full
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;
      setIsVisible(window.scrollY > showOnScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showOnScroll, isDismissed]);

  if (!isVisible || isDismissed) return null;

  if (variant === "minimal") {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 bg-[#033F99] py-3 px-4 z-50 transform transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"
          } ${className}`}
        data-testid="sticky-cta"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-white font-medium text-sm">
            Ready to transform your business?
          </p>
          <Link
            to={primaryLink}
            className="bg-white text-[#033F99] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            {primaryText}
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"
          } ${className}`}
        data-testid="sticky-cta"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-slate-900">
                Ready to get started?
              </h4>
              <p className="text-sm text-slate-600">
                14-day free trial. No credit card required.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={secondaryLink}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {secondaryText}
              </Link>
              <Link
                to={primaryLink}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#033F99] text-white rounded-lg font-semibold hover:bg-[#033F99] transition-colors"
              >
                <Zap className="h-4 w-4" />
                {primaryText}
              </Link>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 md:relative md:top-auto md:right-auto p-2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - mobile only
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 md:hidden transform transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"
        } ${className}`}
      data-testid="sticky-cta"
    >
      <div className="flex gap-3">
        <Link
          to={secondaryLink}
          className="flex-1 py-3 text-center border border-[#033F99] text-[#033F99] rounded-lg font-semibold hover:bg-[#033F99]/5 transition-colors"
        >
          {secondaryText}
        </Link>
        <Link
          to={primaryLink}
          className="flex-1 py-3 text-center bg-[#033F99] text-white rounded-lg font-semibold hover:bg-[#033F99] transition-colors"
        >
          {primaryText}
        </Link>
      </div>
    </div>
  );
};

export default StickyCTA;
