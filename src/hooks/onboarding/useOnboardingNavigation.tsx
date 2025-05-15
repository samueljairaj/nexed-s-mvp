import { useState } from "react";

export function useOnboardingNavigation() {
  const [currentStep, setCurrentStep] = useState(0);

  // Total number of steps in the onboarding process
  const totalSteps = 6; // 0: Account, 1: Personal, 2: Visa, 3: Academic, 4: Employment, 5: Complete

  // Check if we're on the first step
  const isFirstStep = () => currentStep === 0;
  
  // Check if we're on the last main step (before completion)
  const isLastStep = () => currentStep === 4;
  
  // Check if we're on completion step
  const isCompletionStep = () => currentStep === 5;

  // Function to navigate to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to navigate to previous step with conditional logic
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      // Special case: If we're on Employment step (4) and should skip Academic step (3)
      if (currentStep === 4) {
        const shouldSkipAcademic = localStorage.getItem('skipAcademic') === 'true';
        if (shouldSkipAcademic) {
          setCurrentStep(2); // Go back to Visa step
          return;
        }
      }
      
      // Otherwise do normal navigation
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate progress percentage for the progress bar
  const calculateProgress = (): number => {
    // -1 because step 5 is completion which should show as 100%
    return Math.round((currentStep / (totalSteps - 1)) * 100);
  };

  // Jump to a specific step (for special navigation)
  const jumpToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  // Skip steps based on conditions (e.g., visa type)
  const skipToStep = (targetStep: number, condition: boolean) => {
    if (condition) {
      setCurrentStep(targetStep);
    } else {
      goToNextStep();
    }
  };

  return {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    isCompletionStep,
    calculateProgress,
    jumpToStep,
    skipToStep
  };
}
