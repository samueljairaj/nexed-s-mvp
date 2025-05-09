
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingState } from "../hooks/useOnboardingState";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingStepContent } from "@/components/onboarding/OnboardingStepContent";
import { StepNavigation } from "@/components/onboarding/StepNavigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDsoOnboarding } from "@/hooks/onboarding/useDsoOnboarding";

const Onboarding = () => {
  const navigate = useNavigate();
  const { logout, isDSO } = useAuth();
  const { handleDsoProfileSetup } = useDsoOnboarding();
  const onboardingState = useOnboardingState();
  
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

  // Step names for the progress indicator - different for DSO and student
  const studentStepNames = ["Account", "Personal", "Visa", "Academic", "Employment"];
  const dsoStepNames = ["Account", "Personal", "DSO Profile"];

  // Use the appropriate step names based on user role
  const stepNames = isDSO ? dsoStepNames : studentStepNames;

  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingComplete) {
      // Redirect to the appropriate dashboard based on role
      navigate(isDSO ? "/app/dso-dashboard" : "/app/dashboard");
    } else if (isAuthenticated && currentStep === 0) {
      // If user is already authenticated, skip the account creation step
      setCurrentStep(1);
    }
  }, [isAuthenticated, currentUser, navigate, currentStep, setCurrentStep, isDSO]);

  // Handle back to login
  const handleBackToLogin = () => {
    // Logout the user if they are authenticated
    logout();
    // Navigate back to login page
    navigate("/", { replace: true });
  };

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
          // For DSOs, use handleDsoProfileSetup instead of handleAcademicInfo
          handleAcademicInfo={isDSO ? handleDsoProfileSetup : handleAcademicInfo}
          handleEmploymentInfo={handleEmploymentInfo}
          handleEmploymentStatusChange={handleEmploymentStatusChange}
          // Convert function references to actual boolean values to fix type errors
          isF1OrJ1={typeof isF1OrJ1 === 'function' ? isF1OrJ1() : isF1OrJ1}
          isEmployed={typeof isEmployed === 'function' ? isEmployed() : isEmployed}
          isOptOrCpt={typeof isOptOrCpt === 'function' ? isOptOrCpt() : isOptOrCpt}
          isStemOpt={typeof isStemOpt === 'function' ? isStemOpt() : isStemOpt}
          handleFinish={handleFinish}
          handleBackToLogin={handleBackToLogin} // Pass the function
        />
      </div>
      
      {/* Navigation buttons - only show if not on the final completion screen */}
      {currentStep !== 5 && currentStep !== 0 && (
        <StepNavigation
          currentStep={currentStep}
          isFirstStep={isFirstStep()}
          isLastStep={isLastStep()}
          onNext={() => {
            // This is handled by the individual form submissions
          }}
          onPrevious={goToPreviousStep}
          isSubmitting={isSubmitting}
        />
      )}
    </OnboardingLayout>
  );
};

export default Onboarding;
