import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useOnboardingNavigation() {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Determine if step is the first step
  const isFirstStep = () => {
    // If authenticated, first visible step is step 1 (Personal Info)
    return isAuthenticated ? currentStep === 1 : currentStep === 0;
  };

  // Determine if step is the last step
  const isLastStep = () => {
    return currentStep === 4;
  };

  // Calculate the progress percentage
  const calculateProgress = () => {
    // If authenticated, we skip step 0, so we have 4 steps (1-4)
    // Otherwise, we have 5 steps (0-4)
    const totalSteps = isAuthenticated ? 4 : 5;
    const effectiveStep = isAuthenticated ? currentStep : currentStep + 1;
    return (effectiveStep / totalSteps) * 100;
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
