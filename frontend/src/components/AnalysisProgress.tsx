import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  onComplete?: () => void;
}

const STEPS = [
  "Understanding requirement",
  "Extracting key information",
  "Matching standards",
  "Checking related references",
  "Preparing recommendation"
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card-enterprise bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm max-w-xl mx-auto my-6 animate-fade-in">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#E2E8F0]">
        <div className="w-8 h-8 rounded-full bg-[#0B1220] flex items-center justify-center text-white">
          <Loader2 className="w-4 h-4 animate-spin text-[#E87524]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0B1220] font-heading">
            Analyzing procurement requirement
          </h3>
          <p className="text-xs text-[#64748B]">
            Evaluating specifications against verified Indian Standards index
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((stepName, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={idx} className="flex items-center gap-3 text-sm">
              {isDone && (
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
              )}
              {isCurrent && (
                <div className="w-4 h-4 rounded-full border-2 border-[#E87524] border-t-transparent animate-spin shrink-0" />
              )}
              {isPending && (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}

              <span
                className={`${
                  isDone
                    ? 'text-slate-800 font-medium'
                    : isCurrent
                    ? 'text-[#0B1220] font-semibold'
                    : 'text-slate-400 font-normal'
                }`}
              >
                {stepName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
