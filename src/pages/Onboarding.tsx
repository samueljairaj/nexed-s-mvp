
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingState } from "../hooks/useOnboardingState";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingStepContent } from "@/components/onboarding/OnboardingStepContent";
import { StepNavigation } from "@/components/onboarding/StepNavigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const Onboarding = () => {
  const navigate = useNavigate();
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

  // Step names for the progress indicator
  const stepNames = ["Account", "Personal", "Visa", "Academic", "Employment"];

  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingComplete) {
      navigate("/app/dashboard");
    }
  }, [isAuthenticated, currentUser, navigate]);

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
          isF1OrJ1={isF1OrJ1}
          isEmployed={isEmployed}
          isOptOrCpt={isOptOrCpt}
          isStemOpt={isStemOpt}
          handleFinish={handleFinish}
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
