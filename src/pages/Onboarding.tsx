
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";
import { OnboardingCompletion } from "@/components/onboarding/OnboardingCompletion";
import { AccountCreationStep } from "@/components/onboarding/AccountCreationStep";
import { PersonalInfoStep } from "@/components/onboarding/PersonalInfoStep";
import { VisaStatusStep } from "@/components/onboarding/VisaStatusStep";
import { AcademicInfoStep } from "@/components/onboarding/AcademicInfoStep";
import { EmploymentStep } from "@/components/onboarding/EmploymentStep";
import { useAuth } from "@/contexts/AuthContext";

const Onboarding = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();
  const onboardingFlow = useOnboardingFlow();
  
  const {
    currentStep,
    isSubmitting,
    formData,
    isF1OrJ1,
    isEmployed,
    handleAccountFormSubmit,
    handlePersonalFormSubmit,
    handleVisaFormSubmit,
    handleAcademicFormSubmit,
    handleEmploymentFormSubmit,
    finishOnboarding,
    calculateProgress,
    goToPreviousStep,
    setCurrentStep
  } = onboardingFlow;

  // Step names for the progress indicator
  const stepNames = ["Account", "Personal", "Visa", "Academic", "Employment", "Complete"];
  
  // Direct to dashboard if onboarding is already complete
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser?.onboardingComplete) {
      console.log("User has completed onboarding. Redirecting to dashboard...");
      // Redirect to the dashboard if onboarding is complete
      const targetDashboard = currentUser?.role === 'dso' ? '/app/dso-dashboard' : '/app/dashboard';
      navigate(targetDashboard, { replace: true });
    } else if (isAuthenticated && currentStep === 0) {
      // If user is already authenticated, skip the account creation step
      console.log("User is authenticated. Skipping to personal info step.");
      setCurrentStep(1);
    }
  }, [isAuthenticated, currentUser, navigate, currentStep, setCurrentStep, isLoading]);

  // Handle back to login
  const handleBackToLogin = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Calculate if this is the first or last step
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === 4; // Employment is the last form step

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <OnboardingLayout>
      {/* Progress bar */}
      <OnboardingProgress 
        currentStep={currentStep}
        progress={calculateProgress()}
        stepNames={stepNames}
      />
      
      {/* Step content based on currentStep */}
      <div className="mt-8">
        {currentStep === 0 && (
          <AccountCreationStep 
            defaultValues={formData.account}
            onSubmit={handleAccountFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentStep === 1 && (
          <PersonalInfoStep 
            defaultValues={formData.personal}
            onSubmit={handlePersonalFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentStep === 2 && (
          <VisaStatusStep 
            defaultValues={formData.visa}
            onSubmit={handleVisaFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentStep === 3 && (
          <AcademicInfoStep 
            defaultValues={formData.academic}
            onSubmit={handleAcademicFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentStep === 4 && (
          <EmploymentStep
            defaultValues={formData.employment}
            onSubmit={handleEmploymentFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentStep === 5 && (
          <OnboardingCompletion 
            onComplete={finishOnboarding}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
      
      {/* Navigation buttons - only show if not on the completion screen */}
      {currentStep < 5 && (
        <OnboardingNavigation
          onNext={finishOnboarding}
          onPrevious={goToPreviousStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          formId="step-form"
        />
      )}
    </OnboardingLayout>
  );
};

export default Onboarding;
