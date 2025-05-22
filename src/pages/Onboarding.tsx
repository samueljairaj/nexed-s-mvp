
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";
import { OnboardingStepContent } from "@/components/onboarding/OnboardingStepContent";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  AccountCreationFormValues, 
  PersonalInfoFormValues, 
  VisaStatusFormValues, 
  AcademicInfoFormValues, 
  EmploymentInfoFormValues 
} from "@/types/onboarding";

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
    isOptOrCpt,
    isStemOpt,
    handleAccountCreation,
    handleVisaTypeChange,
    handleEmploymentStatusChange,
    calculateProgress,
    goToPreviousStep,
    setCurrentStep,
    finishOnboarding
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

  // Form submission handlers that return boolean promises
  const handleAccountFormSubmit = async (data: AccountCreationFormValues) => {
    try {
      await handleAccountCreation(data);
      return true;
    } catch (error) {
      console.error("Account form submission error:", error);
      toast.error("Failed to create account");
      return false;
    }
  };

  const handlePersonalFormSubmit = async (data: PersonalInfoFormValues) => {
    try {
      await onboardingFlow.handlePersonalFormSubmit(data);
      return true;
    } catch (error) {
      console.error("Personal info submission error:", error);
      toast.error("Failed to save personal information");
      return false;
    }
  };

  const handleVisaFormSubmit = async (data: VisaStatusFormValues) => {
    try {
      await onboardingFlow.handleVisaFormSubmit(data);
      return true;
    } catch (error) {
      console.error("Visa information submission error:", error);
      toast.error("Failed to save visa information");
      return false;
    }
  };

  const handleAcademicFormSubmit = async (data: AcademicInfoFormValues) => {
    try {
      await onboardingFlow.handleAcademicFormSubmit(data);
      return true;
    } catch (error) {
      console.error("Academic information submission error:", error);
      toast.error("Failed to save academic information");
      return false;
    }
  };

  const handleEmploymentFormSubmit = async (data: EmploymentInfoFormValues) => {
    try {
      await onboardingFlow.handleEmploymentFormSubmit(data);
      return true;
    } catch (error) {
      console.error("Employment information submission error:", error);
      toast.error("Failed to save employment information");
      return false;
    }
  };

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
      
      {/* Step content */}
      <OnboardingStepContent
        currentStep={currentStep}
        accountData={formData.account}
        personalData={formData.personal}
        visaData={formData.visa}
        academicData={formData.academic}
        employmentData={formData.employment}
        isSubmitting={isSubmitting}
        currentUser={currentUser}
        handleAccountCreation={handleAccountFormSubmit}
        handlePersonalInfo={handlePersonalFormSubmit}
        handleVisaStatus={handleVisaFormSubmit}
        handleVisaTypeChange={handleVisaTypeChange}
        handleAcademicInfo={handleAcademicFormSubmit}
        handleEmploymentInfo={handleEmploymentFormSubmit}
        handleEmploymentStatusChange={handleEmploymentStatusChange}
        isF1OrJ1={isF1OrJ1()}  // Call the function here instead of passing it directly
        isEmployed={isEmployed}
        isOptOrCpt={isOptOrCpt}
        isStemOpt={isStemOpt}
        handleFinish={finishOnboarding}
        handleBackToLogin={handleBackToLogin}
      />
      
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
