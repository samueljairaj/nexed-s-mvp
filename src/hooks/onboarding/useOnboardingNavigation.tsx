
import { useState } from "react";

export function useOnboardingNavigation() {
  const [currentStep, setCurrentStep] = useState<number>(0);

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
    // For students, the last interactive step is 4 (Employment) 
    return currentStep === 4;
  };

  const calculateProgress = () => {
    // Total steps: Account, Personal, Visa, Academic, Employment, Completion (6 total)
    const total = 5; // We calculate progress based on 5 interactive steps
    return Math.min(100, Math.round((currentStep / total) * 100));
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
