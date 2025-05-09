
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { StepNavigation } from "@/components/onboarding/StepNavigation";
import { getProfileProperty } from "@/utils/propertyMapping";

import { useAuth } from "@/contexts/AuthContext";
import { useUniversityInfo } from "@/hooks/onboarding/useUniversityInfo";
import { useVisaTypeConfig } from "@/hooks/onboarding/useVisaTypeConfig";
import { useDocumentRuleConfig } from "@/hooks/onboarding/useDocumentRuleConfig";
import { useDsoTeamInvite } from "@/hooks/onboarding/useDsoTeamInvite";
import { useOnboardingCompletion } from "@/hooks/onboarding/useOnboardingCompletion";
import { useDsoOnboarding } from "@/hooks/onboarding/useDsoOnboarding";

import UniversityInfoStep from "@/components/onboarding/UniversityInfoStep";
import VisaTypesStep from "@/components/onboarding/VisaTypesStep";
import DocumentRulesStep from "@/components/onboarding/DocumentRulesStep";
import TeamInviteStep from "@/components/onboarding/TeamInviteStep";
import DashboardTourStep from "@/components/onboarding/DashboardTourStep";
import { DsoProfileStep } from "@/components/onboarding/DsoProfileStep";

const DSOOnboarding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, isLoading, isDSO, logout } = useAuth();
  const { handleFinish } = useOnboardingCompletion();
  
  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  
  // DSO Profile setup hook
  const {
    dsoProfileData,
    handleDsoProfileSetup,
    isSubmitting: isDsoProfileSubmitting
  } = useDsoOnboarding();
  
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
    isDsoProfileSubmitting ||
    isUniversitySubmitting || 
    isVisaConfigSubmitting || 
    isDocRulesSubmitting || 
    isTeamInviteSubmitting;
  
  // Step names for the progress indicator - specific for DSO onboarding
  const stepNames = ["DSO Profile", "University", "Visa Types", "Documents", "Team", "Dashboard"];

  useEffect(() => {
    console.log("DSOOnboarding: Component mounting. Auth state:", { isAuthenticated, isDSO, isLoading });
    
    // Redirect non-DSO users to the student onboarding
    if (!isLoading && isAuthenticated && !isDSO) {
      console.log("DSOOnboarding: Redirecting non-DSO user to student onboarding");
      navigate("/onboarding");
      return;
    }
    
    // Redirect unauthenticated users to the login page
    if (!isLoading && !isAuthenticated) {
      console.log("DSOOnboarding: Redirecting unauthenticated user to university landing");
      navigate("/university");
      return;
    }
    
    // Redirect users who completed onboarding
    const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
    if (!isLoading && isAuthenticated && currentUser && onboardingComplete) {
      console.log("DSOOnboarding: Redirecting user who completed onboarding to dashboard");
      navigate("/app/dso-dashboard");
      return;
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
  const handleDsoProfileStep = async (data: any) => {
    console.log("DSOOnboarding: Handling DSO profile step", data);
    const success = await handleDsoProfileSetup(data);
    if (success) goToNextStep();
    return success;
  };
  
  const handleUniversityStep = async (data: any) => {
    console.log("DSOOnboarding: Handling university step", data);
    const success = await handleUniversityInfoSetup(data);
    if (success) goToNextStep();
    return success;
  };
  
  const handleVisaTypesStep = async (data: any) => {
    console.log("DSOOnboarding: Handling visa types step", data);
    const success = await handleVisaTypeConfig(data);
    if (success) goToNextStep();
    return success;
  };
  
  const handleDocumentRulesStep = async (data: any) => {
    console.log("DSOOnboarding: Handling document rules step", data);
    const success = await handleDocumentRuleConfig(data);
    if (success) goToNextStep();
    return success;
  };
  
  const handleTeamStep = async (data: any) => {
    console.log("DSOOnboarding: Handling team step", data);
    const success = await handleTeamInvites(data);
    if (success) goToNextStep();
    return success;
  };
  
  // Completion handler
  const handleCompletion = async () => {
    console.log("DSOOnboarding: Handling completion step");
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
          <DsoProfileStep
            defaultValues={dsoProfileData}
            onSubmit={handleDsoProfileStep}
            isSubmitting={isDsoProfileSubmitting}
          />
        );
      case 1:
        return (
          <UniversityInfoStep
            defaultValues={universityData}
            onSubmit={handleUniversityStep}
            isSubmitting={isUniversitySubmitting}
          />
        );
      case 2:
        return (
          <VisaTypesStep
            defaultValues={visaConfigData}
            onSubmit={handleVisaTypesStep}
            isSubmitting={isVisaConfigSubmitting}
          />
        );
      case 3:
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
      case 4:
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
      case 5:
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
      {currentStep !== 5 && (
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
