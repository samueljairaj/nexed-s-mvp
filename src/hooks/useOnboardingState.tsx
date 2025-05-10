import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAccountCreation } from "./onboarding/useAccountCreation";
import { usePersonalInfo } from "./onboarding/usePersonalInfo";
import { useVisaStatus } from "./onboarding/useVisaStatus";
import { useAcademicInfo } from "./onboarding/useAcademicInfo";
import { useEmploymentInfo } from "./onboarding/useEmploymentInfo";
import { useOnboardingCompletion } from "./onboarding/useOnboardingCompletion";
import { useOnboardingNavigation } from "./onboarding/useOnboardingNavigation";

export function useOnboardingState() {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  
  // Import all of our separate hooks
  const accountCreation = useAccountCreation();
  const personalInfo = usePersonalInfo();
  const visaStatus = useVisaStatus();
  const academicInfo = useAcademicInfo();
  const employmentInfo = useEmploymentInfo();
  const completion = useOnboardingCompletion();
  const navigation = useOnboardingNavigation();
  
  useEffect(() => {
    // If user is already authenticated, pre-fill the fields
    if (isAuthenticated && currentUser) {
      accountCreation.setAccountData({
        firstName: currentUser.name?.split(" ")[0] || "",
        lastName: currentUser.name?.split(" ")[1] || "",
        email: currentUser.email || "",
      });
      
      if (currentUser.country) {
        personalInfo.setPersonalData(prev => ({ ...prev, country: currentUser.country || "" }));
      }
      
      if (currentUser.visaType) {
        visaStatus.setVisaData(prev => ({ ...prev, visaType: currentUser.visaType }));
      }
      
      if (currentUser.university) {
        academicInfo.setAcademicData(prev => ({ ...prev, university: currentUser.university || "" }));
      }
    }
  }, [isAuthenticated, currentUser]);

  // Collect user data for completion step
  const getUserData = () => {
    return {
      name: currentUser?.name,
      visaType: visaStatus.visaData.visaType,
      university: academicInfo.academicData.university,
      fieldOfStudy: academicInfo.academicData.fieldOfStudy,
      employer: employmentInfo.employmentData.employerName, // Fixed: using employerName instead of employer
    };
  };

  // Handle account creation and navigate to next step if successful
  const handleAccountCreation = async (data: any): Promise<boolean> => {
    const success = await accountCreation.handleAccountCreation(data);
    if (success) {
      navigation.goToNextStep();
    }
    return success;
  };

  // Handle personal info and navigate to next step if successful
  const handlePersonalInfo = async (data: any): Promise<boolean> => {
    const success = await personalInfo.handlePersonalInfo(data);
    if (success) {
      navigation.goToNextStep();
    }
    return success;
  };

  // Handle visa status and navigate to next step if successful
  const handleVisaStatus = async (data: any): Promise<boolean> => {
    const success = await visaStatus.handleVisaStatus(data);
    if (success) {
      // Skip to employment step for non-student visas
      if (data.visaType !== "F1" && data.visaType !== "J1") {
        navigation.setCurrentStep(navigation.currentStep + 2);
      } else {
        navigation.goToNextStep();
      }
    }
    return success;
  };

  // Handle academic info and navigate to next step if successful
  const handleAcademicInfo = async (data: any): Promise<boolean> => {
    const success = await academicInfo.handleAcademicInfo(data);
    if (success) {
      navigation.goToNextStep();
    }
    return success;
  };

  // Handle employment info and navigate to next step if successful 
  const handleEmploymentInfo = async (data: any): Promise<boolean> => {
    const success = await employmentInfo.handleEmploymentInfo(data);
    if (success) {
      navigation.goToNextStep();
    }
    return success;
  };

  const isF1OrJ1 = () => {
    return visaStatus.visaData.visaType === "F1" || visaStatus.visaData.visaType === "J1";
  };

  return {
    currentStep: navigation.currentStep,
    isSubmitting: accountCreation.isSubmitting || personalInfo.isSubmitting || 
                 visaStatus.isSubmitting || academicInfo.isSubmitting || 
                 employmentInfo.isSubmitting || completion.isSubmitting,
    accountData: accountCreation.accountData,
    personalData: personalInfo.personalData,
    visaData: visaStatus.visaData,
    academicData: academicInfo.academicData,
    employmentData: employmentInfo.employmentData,
    isAuthenticated,
    currentUser,
    isLoading,
    getUserData,
    handleAccountCreation,
    handlePersonalInfo,
    handleVisaStatus,
    handleVisaTypeChange: visaStatus.handleVisaTypeChange,
    handleAcademicInfo,
    handleEmploymentInfo,
    handleEmploymentStatusChange: employmentInfo.handleEmploymentStatusChange,
    isF1OrJ1,
    isEmployed: employmentInfo.isEmployed,
    isOptOrCpt: employmentInfo.isOptOrCpt,
    isStemOpt: employmentInfo.isStemOpt,
    handleFinish: completion.handleFinish,
    goToNextStep: navigation.goToNextStep,
    goToPreviousStep: navigation.goToPreviousStep,
    isFirstStep: navigation.isFirstStep,
    isLastStep: navigation.isLastStep,
    calculateProgress: navigation.calculateProgress,
    setCurrentStep: navigation.setCurrentStep
  };
}
