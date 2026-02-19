import React from "react";
import { Shield, Lock, FileCheck, Award, CheckCircle } from "lucide-react";

const defaultBadges = [
  {
    icon: Shield,
    title: "SOC 2 Compliant",
    description: "Enterprise-grade security",
  },
  {
    icon: Lock,
    title: "256-bit Encryption",
    description: "Bank-level data protection",
  },
  { icon: FileCheck, title: "GDPR Ready", description: "Privacy by design" },
  { icon: Award, title: "ISO 27001", description: "Certified data centers" },
];

export const SecurityBadges = ({
  badges = defaultBadges,
  variant = "default", // default, compact, dark
  className = "",
}) => {
  if (variant === "compact") {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-6 ${className}`}
        data-testid="security-badges"
      >
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={`badge-${badge.title}-${index}`}
              className="flex items-center gap-2 text-slate-600"
            >
              <Icon className="h-5 w-5 text-[#033F99]" />
              <span className="font-medium">{badge.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`bg-slate-900 rounded-3xl p-8 ${className}`}
        data-testid="security-badges"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Enterprise Security
          </h3>
          <p className="text-slate-400">
            Your data is protected with industry-leading security
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={`badge-${badge.title}-${index}`}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#033F99]/20 flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-[#033F99]" />
                </div>
                <p className="font-semibold text-white mb-1">{badge.title}</p>
                <p className="text-sm text-slate-400">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${className}`} data-testid="security-badges">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={`badge-${badge.title}-${index}`}
              className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#033F99]/30 hover:shadow-lg transition-all duration-300 text-center group"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#033F99]/10 group-hover:bg-[#033F99]/20 flex items-center justify-center mb-4 transition-all duration-300">
                <Icon className="h-7 w-7 text-[#033F99]" />
              </div>
              <p className="font-bold text-slate-900 mb-1">{badge.title}</p>
              <p className="text-sm text-slate-500">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityBadges;
