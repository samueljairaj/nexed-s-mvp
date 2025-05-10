import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useOnboardingNavigation() {
  const { isAuthenticated, isDSO } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  console.log("Navigation Hook - Current Step:", currentStep);
  console.log("Navigation Hook - Is DSO:", isDSO);

  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    console.log("Moving to next step:", nextStep);
    setCurrentStep(nextStep);
  };

  const goToPreviousStep = () => {
    const prevStep = currentStep - 1;
    console.log("Moving to previous step:", prevStep);
    setCurrentStep(prevStep);
  };

  // Determine if step is the first step
  const isFirstStep = () => {
    // If authenticated, first visible step is step 1 (Personal Info)
    return isAuthenticated ? currentStep === 1 : currentStep === 0;
  };

  // Determine if step is the last step
  const isLastStep = () => {
    // For DSOs, the last step before completion is step 2
    // For students, the last step is step 4
    return isDSO ? currentStep === 2 : currentStep === 4;
  };

  // Calculate the progress percentage
  const calculateProgress = () => {
    // If authenticated, we skip step 0, so we have 4 steps (1-4)
    // Otherwise, we have 5 steps (0-4)
    const totalSteps = isDSO ? 3 : 5;
    const effectiveStep = isAuthenticated ? currentStep : currentStep + 1;
    return Math.min((effectiveStep / totalSteps) * 100, 100);
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
