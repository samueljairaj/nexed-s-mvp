
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { StepNavigation } from "@/components/onboarding/StepNavigation";

import { useAuth } from "@/contexts/AuthContext";
import { useUniversityInfo } from "@/hooks/onboarding/useUniversityInfo";
import { useVisaTypeConfig } from "@/hooks/onboarding/useVisaTypeConfig";
import { useDocumentRuleConfig } from "@/hooks/onboarding/useDocumentRuleConfig";
import { useDsoTeamInvite } from "@/hooks/onboarding/useDsoTeamInvite";
import { useOnboardingCompletion } from "@/hooks/onboarding/useOnboardingCompletion";

import UniversityInfoStep from "@/components/onboarding/UniversityInfoStep";
import VisaTypesStep from "@/components/onboarding/VisaTypesStep";
import DocumentRulesStep from "@/components/onboarding/DocumentRulesStep";
import TeamInviteStep from "@/components/onboarding/TeamInviteStep";
import DashboardTourStep from "@/components/onboarding/DashboardTourStep";

const DSOOnboarding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, isLoading, isDSO, logout } = useAuth();
  const { handleFinish } = useOnboardingCompletion();
  
  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  
  // University setup hooks
  const { 
    universityData, 
    handleUniversityInfoSetup, 
    isSubmitting: isUniversitySubmitting 
  } = useUniversityInfo();
  
  // Visa types configuration hook
  const { 
    visaConfigData, 
    handleVisaTypeConfig, 
    isSubmitting: isVisaConfigSubmitting 
  } = useVisaTypeConfig();
  
  // Document rules configuration hook
  const { 
    documentRuleData, 
    handleVisaTypeChange, 
    handleDocumentRuleConfig, 
    getDefaultDocuments, 
    isSubmitting: isDocRulesSubmitting
  } = useDocumentRuleConfig();
  
  // Team invite hook
  const { 
    teamInviteData, 
    handleTeamInvites, 
    addInviteField, 
    removeInviteField, 
    updateInviteField, 
    isSubmitting: isTeamInviteSubmitting 
  } = useDsoTeamInvite();
  
  // Combined submission state
  const isSubmitting = 
    isUniversitySubmitting || 
    isVisaConfigSubmitting || 
    isDocRulesSubmitting || 
    isTeamInviteSubmitting;
  
  // Step names for the progress indicator
  const stepNames = ["University", "Visa Types", "Documents", "Team", "Dashboard"];

  useEffect(() => {
    // Redirect non-DSO users to the student onboarding
    if (isAuthenticated && !isLoading && !isDSO) {
      navigate("/onboarding");
    }
    
    // Redirect users who completed onboarding
    if (isAuthenticated && currentUser?.onboardingComplete) {
      navigate("/app/dso-dashboard");
    }
  }, [isAuthenticated, currentUser, navigate, isLoading, isDSO]);
  
  // Navigation functions
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(stepNames.length - 1, prev + 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === stepNames.length - 1;
  
  // Compute progress percentage
  const calculateProgress = () => {
    return Math.floor((currentStep / (stepNames.length - 1)) * 100);
  };
  
  // Handle back to login/landing page
  const handleBackToHome = () => {
    // Logout the user if they are authenticated
    logout();
    // Navigate back to landing page
    navigate("/", { replace: true });
  };
  
  // Step submission handlers
  const handleUniversityStep = async (data: any) => {
    const success = await handleUniversityInfoSetup(data);
    if (success) goToNextStep();
    return success;
  };
  
  const handleVisaTypesStep = async (data: any) => {
    const success = await handleVisaTypeConfig(data);
    if (success) goToNextStep();
    return success;
  };
  
  const handleDocumentRulesStep = async (data: any) => {
    const success = await handleDocumentRuleConfig(data);
    if (success) goToNextStep();
    return success;
  };
  
  const handleTeamStep = async (data: any) => {
    const success = await handleTeamInvites(data);
    if (success) goToNextStep();
    return success;
  };
  
  // Completion handler
  const handleCompletion = async () => {
    const success = await handleFinish();
    if (success) {
      // Already redirects in the hook
      return true;
    }
    return false;
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <UniversityInfoStep
            defaultValues={universityData}
            onSubmit={handleUniversityStep}
            isSubmitting={isUniversitySubmitting}
          />
        );
      case 1:
        return (
          <VisaTypesStep
            defaultValues={visaConfigData}
            onSubmit={handleVisaTypesStep}
            isSubmitting={isVisaConfigSubmitting}
          />
        );
      case 2:
        return (
          <DocumentRulesStep
            defaultValues={documentRuleData}
            onSubmit={handleDocumentRulesStep}
            onVisaTypeChange={handleVisaTypeChange}
            getDefaultDocuments={getDefaultDocuments}
            isSubmitting={isDocRulesSubmitting}
            availableVisaTypes={visaConfigData.visaTypes}
          />
        );
      case 3:
        return (
          <TeamInviteStep
            defaultValues={teamInviteData}
            onSubmit={handleTeamStep}
            isSubmitting={isTeamInviteSubmitting}
            addInviteField={addInviteField}
            removeInviteField={removeInviteField}
            updateInviteField={updateInviteField}
          />
        );
      case 4:
        return (
          <DashboardTourStep
            onComplete={handleCompletion}
            isLoading={isSubmitting}
          />
        );
      default:
        return <div>Loading...</div>;
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
      <div className="mt-8">
        {renderStep()}
      </div>
      
      {/* Navigation buttons - only show if not on the final step */}
      {currentStep !== 4 && (
        <StepNavigation
          currentStep={currentStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          isSubmitting={isSubmitting}
          onBackToHome={handleBackToHome}
        />
      )}
    </OnboardingLayout>
  );
};

export default DSOOnboarding;
