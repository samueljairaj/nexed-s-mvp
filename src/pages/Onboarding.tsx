
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

  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingComplete) {
      // Redirect to the dashboard if onboarding is complete
      navigate("/app/dashboard");
    } else if (isAuthenticated && currentStep === 0) {
      // If user is already authenticated, skip the account creation step
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

  // Handle continue button click - Enhanced for debugging
  const handleContinue = async () => {
    console.log("Continue button clicked, current step:", currentStep);
    
    // For academic step (step 3), submit the form directly
    if (currentStep === 3) {
      console.log("Academic step - submitting form");
      
      if (academicStepRef.current) {
        try {
          console.log("Using academic step ref to submit form");
          await academicStepRef.current.submitForm();
        } catch (error) {
          console.error("Error submitting academic form:", error);
          toast.error("There was an error submitting the form. Please check your inputs.");
        }
      } else {
        console.warn("Academic step ref is null - cannot submit form");
      }
      return;
    }
    
    // Get the ref for the current step
    const activeStepRef = getActiveStepRef(currentStep, { academicStepRef });
    
    if (activeStepRef && activeStepRef.current) {
      // If we have a ref, call submitForm method
      try {
        console.log("Using step ref to submit form");
        await activeStepRef.current.submitForm();
        // Form submission is handled within the step component
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("There was an error submitting the form");
      }
    } else {
      // For steps without a ref, just proceed to the next step
      if (currentStep === 4) {
        // If on last step, call handleFinish
        await handleFinish();
      }
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
      {currentStep !== 5 && currentStep !== 0 && (
        <StepNavigation
          currentStep={currentStep}
          isFirstStep={isFirstStep()}
          isLastStep={isLastStep()}
          onNext={handleContinue}
          onPrevious={goToPreviousStep}
          isSubmitting={isSubmitting}
        />
      )}
    </OnboardingLayout>
  );
};

export default Onboarding;
