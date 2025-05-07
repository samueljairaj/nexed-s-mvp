
import { CheckCircle2 } from "lucide-react";
import { OnboardingSteps, stepLabels } from "@/types/onboarding";

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          return (
            <div
              key={stepNum}
              className={`flex flex-col items-center ${
                stepNum !== 8 ? "w-1/7" : ""
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  currentStep >= stepNum
                    ? "nexed-gradient text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > stepNum ? <CheckCircle2 size={20} /> : stepNum}
              </div>
              <div className="text-xs mt-2 text-center">
                {label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative flex items-center w-full mt-2">
        <div className="h-1 bg-gray-200 w-full absolute">
          <div
            className="h-1 nexed-gradient transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 7) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
