import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const defaultTestimonials = [
  {
    name: "Rajesh Kumar",
    role: "CFO, Tech Startup",
    company: "CloudNine Solutions",
    content:
      "Innovate Books transformed how we handle finances. Month-end close went from 7 days to just 2 hours.",
    rating: 5,
    image: null,
  },
  {
    name: "Priya Sharma",
    role: "Finance Director",
    company: "RetailMax India",
    content:
      "The intelligence module predicts cash flow issues weeks before they happen. Game changer for our planning.",
    rating: 5,
    image: null,
  },
  {
    name: "Arun Patel",
    role: "CEO",
    company: "Manufacturing Co",
    content:
      "Finally, a platform that connects sales, operations, and finance. No more spreadsheet chaos.",
    rating: 5,
    image: null,
  },
];

export const TestimonialCarousel = ({
  testimonials = defaultTestimonials,
  autoPlay = true,
  interval = 5000,
  variant = "default", // default, card, minimal
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, testimonials.length, interval]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const goToIndex = (index) => {
    setIsAutoPlaying(false);
    setActiveIndex(index);
  };

  if (variant === "card") {
    return (
      <div
        className={`relative ${className}`}
        data-testid="testimonial-carousel"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={`testimonial-${testimonial.name}-${index}`}
              className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-[#033F99]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-[#033F99]/20 mb-4" />
              <p className="text-slate-600 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#033F99]/10 flex items-center justify-center">
                  <span className="font-bold text-[#033F99]">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default carousel variant
  return (
    <div className={`relative ${className}`} data-testid="testimonial-carousel">
      {/* Main testimonial */}
      <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 md:p-12 border border-slate-100 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#033F99]/5 rounded-full blur-3xl" />
        <Quote className="absolute top-8 right-8 h-16 w-16 text-[#033F99]/10" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
              <Star
                key={`star-${i}`}
                className="h-5 w-5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-8 italic">
            "{testimonials[activeIndex].content}"
          </p>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#033F99]/10 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-[#033F99]">
                {testimonials[activeIndex].name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-lg">
              {testimonials[activeIndex].name}
            </p>
            <p className="text-slate-500">{testimonials[activeIndex].role}</p>
            <p className="text-[#033F99] font-medium">
              {testimonials[activeIndex].company}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={goToPrev}
          className="w-10 h-10 rounded-full border border-slate-200 hover:border-[#033F99] hover:bg-[#033F99]/5 flex items-center justify-center transition-all duration-300"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => goToIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === activeIndex
                  ? "bg-[#033F99] w-8"
                  : "bg-slate-300 hover:bg-slate-400"
                }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="w-10 h-10 rounded-full border border-slate-200 hover:border-[#033F99] hover:bg-[#033F99]/5 flex items-center justify-center transition-all duration-300"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
