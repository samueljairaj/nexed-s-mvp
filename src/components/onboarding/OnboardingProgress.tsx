
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

export interface OnboardingProgressProps {
  currentStep: number;
  progress: number;
  stepNames: string[];
}

export function OnboardingProgress({ 
  currentStep, 
  progress, 
  stepNames 
}: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {stepNames.map((label, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${
              index !== stepNames.length - 1 ? "w-1/5" : ""
            }`}
          >
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep >= index
                  ? "bg-nexed-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > index ? <CheckCircle2 size={20} /> : index + 1}
            </div>
            <div className="text-xs mt-2 text-center">
              {label}
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex items-center w-full mt-4">
        <Progress value={progress} className="h-2 w-full" />
      </div>
    </div>
  );
}
