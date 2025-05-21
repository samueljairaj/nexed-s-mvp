
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingState } from "../hooks/useOnboardingState";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingStepContent, getActiveStepRef } from "@/components/onboarding/OnboardingStepContent";
import { StepNavigation } from "@/components/onboarding/StepNavigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AcademicInfoStepRef } from "@/components/onboarding/AcademicInfoStep";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const onboardingState = useOnboardingState();
  
  // Create refs for form steps
  const academicStepRef = useRef<AcademicInfoStepRef>(null);
  
  const {
    currentStep,
    isSubmitting,
    isAuthenticated,
    currentUser,
    isLoading,
    accountData,
    personalData,
    visaData,
    academicData,
    employmentData,
    handleAccountCreation,
    handlePersonalInfo,
    handleVisaStatus,
    handleVisaTypeChange,
    handleAcademicInfo,
    handleEmploymentInfo,
    handleEmploymentStatusChange,
    isF1OrJ1,
    isEmployed,
    isOptOrCpt,
    isStemOpt,
    handleFinish,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    calculateProgress,
    setCurrentStep
  } = onboardingState;

  // Step names for the progress indicator
  const stepNames = ["Account", "Personal", "Visa", "Academic", "Employment"];

  // Direct to dashboard if onboarding is already complete
  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingComplete) {
      console.log("User has completed onboarding. Redirecting to dashboard...");
      // Redirect to the dashboard if onboarding is complete
      const targetDashboard = currentUser?.role === 'dso' ? '/app/dso-dashboard' : '/app/dashboard';
      navigate(targetDashboard, { replace: true });
    } else if (isAuthenticated && currentStep === 0) {
      // If user is already authenticated, skip the account creation step
      console.log("User is authenticated. Skipping to personal info step.");
      setCurrentStep(1);
    }
  }, [isAuthenticated, currentUser, navigate, currentStep, setCurrentStep]);

  // Handle back to login
  const handleBackToLogin = () => {
    // Logout the user if they are authenticated
    logout();
    // Navigate back to login page
    navigate("/", { replace: true });
  };

  // Get the current form ID based on the step
  const getCurrentFormId = () => {
    return "step-form";
  };

  // Handle continue button click with improved logging and error handling
  const handleContinue = async () => {
    console.log("Continue button clicked, current step:", currentStep);
    
    // Special handling for the final step to complete onboarding
    if (currentStep === 4) { // Employment step
      console.log("Last step - calling handleFinish");
      try {
        const success = await handleFinish();
        if (success) {
          console.log("Onboarding completed successfully");
          // Navigation will be handled in handleFinish()
          return;
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
        toast.error("There was an error completing the onboarding process. Please try again.");
      }
      return;
    }
    
    // For academic step (step 3), submit the form directly through ref
    if (currentStep === 3 && academicStepRef.current) {
      console.log("Academic step - submitting form through ref");
      try {
        console.log("Using academic step ref to submit form");
        await academicStepRef.current.submitForm();
      } catch (error) {
        console.error("Error submitting academic form:", error);
        toast.error("There was an error submitting the form. Please check your inputs.");
      }
      return;
    }
    
    // For steps without a specific ref implementation, trigger form submission via form ID
    try {
      console.log("Submitting form with ID:", getCurrentFormId());
      const form = document.getElementById(getCurrentFormId()) as HTMLFormElement;
      
      if (form) {
        // If the form exists, submit it
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      } else {
        console.warn("No form found for step", currentStep);
        // Fallback handling based on current step
        if (currentStep === 0) await handleAccountCreation(accountData as any);
        else if (currentStep === 1) await handlePersonalInfo(personalData as any);
        else if (currentStep === 2) await handleVisaStatus(visaData as any);
        else if (currentStep === 4) await handleEmploymentInfo(employmentData as any);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("There was an error submitting the form. Please check your inputs.");
    }
  };

  console.log("Onboarding Page - Current step:", currentStep);
  console.log("Onboarding Page - isF1OrJ1:", typeof isF1OrJ1 === 'function' ? isF1OrJ1() : isF1OrJ1);

  // If loading, show a loading indicator
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
      
      {/* Step content */}
      <div className="mt-8">
        <OnboardingStepContent
          currentStep={currentStep}
          accountData={accountData}
          personalData={personalData}
          visaData={visaData}
          academicData={academicData}
          employmentData={employmentData}
          isSubmitting={isSubmitting}
          currentUser={currentUser}
          handleAccountCreation={handleAccountCreation}
          handlePersonalInfo={handlePersonalInfo}
          handleVisaStatus={handleVisaStatus}
          handleVisaTypeChange={handleVisaTypeChange}
          handleAcademicInfo={handleAcademicInfo}
          handleEmploymentInfo={handleEmploymentInfo}
          handleEmploymentStatusChange={handleEmploymentStatusChange}
          isF1OrJ1={typeof isF1OrJ1 === 'function' ? isF1OrJ1() : isF1OrJ1}
          isEmployed={typeof isEmployed === 'function' ? isEmployed() : isEmployed}
          isOptOrCpt={typeof isOptOrCpt === 'function' ? isOptOrCpt() : isOptOrCpt}
          isStemOpt={typeof isStemOpt === 'function' ? isStemOpt() : isStemOpt}
          handleFinish={handleFinish}
          handleBackToLogin={handleBackToLogin}
        />
      </div>
      
      {/* Navigation buttons - only show if not on the final completion screen */}
      {currentStep <= 4 && currentStep !== 0 && (
        <StepNavigation
          currentStep={currentStep}
          isFirstStep={isFirstStep()}
          isLastStep={isLastStep()}
          onNext={handleContinue}
          onPrevious={goToPreviousStep}
          isSubmitting={isSubmitting}
          formId={getCurrentFormId()}
        />
      )}
    </OnboardingLayout>
  );
};

export default Onboarding;
