
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useOnboardingNavigation() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { isDSO } = useAuth();

  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const isFirstStep = () => {
    return currentStep === 0;
  };

  const isLastStep = () => {
    if (isDSO) {
      // For DSO users, the last interactive step is 2 (University Info)
      return currentStep === 2;
    }
    // For students, the last interactive step is 4 (Employment) 
    return currentStep === 4;
  };

  const calculateProgress = () => {
    if (isDSO) {
      // For DSO users:
      // 0 - Account Creation (25%)
      // 1 - Personal Info (50%)
      // 2 - University Info (75%)
      // 3 - Completion (100%)
      const total = 3;
      return Math.min(100, Math.round((currentStep / total) * 100));
    } else {
      // For student users:
      // 0 - Account Creation (20%)
      // 1 - Personal Info (40%)
      // 2 - Visa Status (60%)
      // 3 - Academic Info (80%)
      // 4 - Employment (100%)
      // 5 - Completion (100%)
      const total = 5;
      return Math.min(100, Math.round((currentStep / total) * 100));
    }
  };

  return {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    calculateProgress
  };
}
