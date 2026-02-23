import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  CheckCircle,
  Circle,
  ArrowRight,
  Lightbulb,
  MousePointer,
  Hand,
  Zap,
} from "lucide-react";

/**
 * ProductTour - Interactive guided tour component for onboarding
 * Shows step-by-step tooltips highlighting key features
 *
 * @param {boolean} isActive - Whether tour is active
 * @param {function} onComplete - Handler when tour completes
 * @param {function} onSkip - Handler when tour is skipped
 * @param {array} steps - Custom tour steps (optional)
 * @param {string} tourId - Unique tour identifier for localStorage
 */
const ProductTour = ({
  isActive = false,
  onComplete,
  onSkip,
  steps: customSteps,
  tourId = "main-tour",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState(null);

  // Default tour steps for the main application
  const defaultSteps = [
    {
      target: '[data-tour="workspace"]',
      title: "Welcome to Your Workspace",
      content:
        "This is your command center. Access tasks, approvals, chats, and notifications all in one place.",
      position: "right",
      icon: Target,
    },
    {
      target: '[data-tour="solutions"]',
      title: "Your Business Solutions",
      content:
        "Explore IB Commerce, Finance, Operations, Workforce, and Capital modules tailored to your business needs.",
      position: "right",
      icon: Lightbulb,
    },
    {
      target: '[data-tour="intelligence"]',
      title: "AI-Powered Intelligence",
      content:
        "Get predictive analytics, risk insights, and automated recommendations powered by advanced AI.",
      position: "right",
      icon: Sparkles,
    },
    {
      target: '[data-tour="dashboard"]',
      title: "Real-Time Dashboard",
      content:
        "Monitor key metrics, track performance, and make data-driven decisions with live analytics.",
      position: "bottom",
      icon: MousePointer,
    },
    {
      target: '[data-tour="quick-actions"]',
      title: "Quick Actions",
      content:
        "Create new records, run reports, and perform common tasks with just one click.",
      position: "left",
      icon: Zap,
    },
  ];

  const steps = customSteps || defaultSteps;
  const totalSteps = steps.length;

  // Check if tour was already completed
  useEffect(() => {
    const completed = localStorage.getItem(`tour_${tourId}_completed`);
    if (isActive && !completed) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isActive, tourId]);

  // Position highlight on target element
  useEffect(() => {
    if (!isVisible || !steps[currentStep]?.target) return;

    const targetElement = document.querySelector(steps[currentStep].target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });

      // Scroll element into view
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setHighlightPosition(null);
    }
  }, [isVisible, currentStep, steps]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(`tour_${tourId}_completed`, "true");
    setIsVisible(false);
    onComplete?.();
  }, [tourId, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(`tour_${tourId}_completed`, "true");
    setIsVisible(false);
    onSkip?.();
  }, [tourId, onSkip]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleSkip();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleNext, handlePrev, handleSkip]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon || Circle;

  // Calculate tooltip position based on step position preference
  const getTooltipStyle = () => {
    if (!highlightPosition) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const margin = 20;
    switch (currentStepData.position) {
      case "right":
        return {
          top: highlightPosition.top,
          left: highlightPosition.left + highlightPosition.width + margin,
        };
      case "left":
        return {
          top: highlightPosition.top,
          right: window.innerWidth - highlightPosition.left + margin,
        };
      case "bottom":
        return {
          top: highlightPosition.top + highlightPosition.height + margin,
          left: highlightPosition.left,
        };
      case "top":
        return {
          bottom: window.innerHeight - highlightPosition.top + margin,
          left: highlightPosition.left,
        };
      default:
        return {
          top: highlightPosition.top,
          left: highlightPosition.left + highlightPosition.width + margin,
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300" />

      {/* Highlight Box */}
      {highlightPosition && (
        <div
          className="fixed z-[9999] border-2 border-[#033F99] rounded-xl pointer-events-none transition-all duration-300"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
            boxShadow:
              "0 0 0 9999px rgba(0,0,0,0.5), 0 0 20px rgba(3,63,153,0.5)",
          }}
        >
          {/* Pulse animation */}
          <div className="absolute inset-0 border-2 border-[#033F99] rounded-xl animate-ping opacity-75" />
        </div>
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn"
        style={getTooltipStyle()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#033F99] to-[#033F99] p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <StepIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-white/70">
                  Step {currentStep + 1} of {totalSteps}
                </p>
                <h3 className="font-bold">{currentStepData.title}</h3>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-slate-600 leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 px-4 pb-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                ? "w-6 bg-[#033F99]"
                : index < currentStep
                  ? "bg-[#033F99]/60"
                  : "bg-slate-300"
                }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 pt-2 border-t border-slate-100">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-[#033F99] hover:bg-[#033F99] text-white rounded-lg font-semibold transition-colors"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] flex items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-sm rounded-full text-white text-sm">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">→</kbd>
          Navigate
        </span>
        <span className="text-white/40">|</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">Esc</kbd>
          Skip
        </span>
      </div>
    </>
  );
};

/**
 * TourTrigger - Button component to start the product tour
 */
export const TourTrigger = ({ onClick, variant = "default" }) => {
  if (variant === "floating") {
    return (
      <button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <Hand className="h-5 w-5" />
        <span className="font-semibold">Take a Tour</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-[#033F99] hover:bg-[#033F99]/10 rounded-lg font-semibold transition-colors"
    >
      <Hand className="h-5 w-5" />
      Take a Tour
    </button>
  );
};

/**
 * useTour - Hook to manage tour state
 */
export const useTour = (tourId = "main-tour") => {
  const [isTourActive, setIsTourActive] = useState(false);

  const startTour = () => {
    // Clear completed status to restart
    localStorage.removeItem(`tour_${tourId}_completed`);
    setIsTourActive(true);
  };

  const endTour = () => {
    setIsTourActive(false);
  };

  const checkTourCompleted = () => {
    return localStorage.getItem(`tour_${tourId}_completed`) === "true";
  };

  return {
    isTourActive,
    startTour,
    endTour,
    checkTourCompleted,
  };
};

export default ProductTour;
