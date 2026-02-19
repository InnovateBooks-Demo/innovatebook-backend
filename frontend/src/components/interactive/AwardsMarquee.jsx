import React from "react";
import { Award, Trophy } from "lucide-react";

const defaultAwards = [
  { year: "2024", title: "Best B2B Platform", org: "Business Awards" },
  { year: "2024", title: "Innovation Excellence", org: "Tech Summit" },
  { year: "2023", title: "Top Fintech Solution", org: "Fintech Awards" },
  { year: "2023", title: "Enterprise Choice", org: "CIO Magazine" },
];

export const AwardsMarquee = ({
  awards = defaultAwards,
  title = "Making the Headlines",
  variant = "default", // default, compact
  className = "",
}) => {
  const AwardCard = ({ award, index }) => (
    <div
      key={`award-${award.title}-${index}`}
      className="flex-shrink-0 bg-white rounded-2xl p-6 border border-slate-100 hover:border-[#033F99]/30 hover:shadow-lg transition-all duration-300 w-72 mx-3"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-yellow-600" />
        </div>
        <span className="text-sm font-semibold text-[#033F99] bg-[#033F99]/10 px-2 py-1 rounded-full">
          {award.year}
        </span>
      </div>
      <h4 className="font-bold text-slate-900 mb-1">{award.title}</h4>
      <p className="text-sm text-slate-500">{award.org}</p>
    </div>
  );

  if (variant === "compact") {
    return (
      <div className={`py-8 ${className}`} data-testid="awards-marquee">
        <div className="flex flex-wrap justify-center gap-4">
          {awards.map((award, index) => (
            <div
              key={`award-${award.title}-${index}`}
              className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full"
            >
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-slate-700">{award.title}</span>
              <span className="text-sm text-slate-500">({award.year})</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      className={`py-16 bg-slate-50 overflow-hidden ${className}`}
      data-testid="awards-marquee"
    >
      {title && (
        <h3 className="text-center text-2xl font-bold text-slate-900 mb-8">
          {title}
        </h3>
      )}

      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

        <div className="flex overflow-hidden">
          <div className="flex animate-[marquee_30s_linear_infinite] hover:pause">
            {/* Double the awards for seamless loop */}
            {[...awards, ...awards].map((award, index) => (
              <AwardCard
                key={`award-first-${index}`}
                award={award}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default AwardsMarquee;
