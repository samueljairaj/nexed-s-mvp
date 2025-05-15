
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAccountCreation } from "./onboarding/useAccountCreation";
import { usePersonalInfo } from "./onboarding/usePersonalInfo";
import { useVisaStatus } from "./onboarding/useVisaStatus";
import { useAcademicInfo } from "./onboarding/useAcademicInfo";
import { useEmploymentInfo } from "./onboarding/useEmploymentInfo";
import { useOnboardingCompletion } from "./onboarding/useOnboardingCompletion";
import { useOnboardingNavigation } from "./onboarding/useOnboardingNavigation";
import { VisaType } from "@/types/onboarding";

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
        password: "",
        confirmPassword: "",
        acceptTerms: true
      });
      
      // Pre-fill personal info if available
      if (currentUser.country) {
        personalInfo.setPersonalData(prev => ({ 
          ...prev, 
          country: currentUser.country || "",
          currentCountry: currentUser.country || "United States",
          address: currentUser.address || "",
          phoneNumber: currentUser.phone || "",
          passportNumber: currentUser.passportNumber || ""
        }));
      }
      
      // Pre-fill visa info if available
      if (currentUser.visaType) {
        visaStatus.setVisaData(prev => ({ 
          ...prev, 
          visaType: currentUser.visaType as VisaType || VisaType.F1,
          sevisId: currentUser.sevisId || ""
        }));
        
        // Store visa type in localStorage for conditional navigation
        localStorage.setItem('visaType', currentUser.visaType);
      }
      
      // Pre-fill academic info if available
      if (currentUser.university) {
        academicInfo.setAcademicData(prev => ({ 
          ...prev, 
          university: currentUser.university || "",
          fieldOfStudy: currentUser.fieldOfStudy || "",
          degreeLevel: currentUser.degreeLevel || "",
          isSTEM: currentUser.isSTEM || false
        }));
      }
      
      // Pre-fill employment info if available
      if (currentUser.employerName) {
        employmentInfo.setEmploymentData(prev => ({ 
          ...prev,
          employmentStatus: "Employed",
          employerName: currentUser.employerName || "",
          jobTitle: currentUser.jobTitle || ""
        }));
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
      employer: employmentInfo.employmentData.employerName,
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

  // Handle visa status with enhanced conditional navigation
  const handleVisaStatus = async (data: any): Promise<boolean> => {
    const success = await visaStatus.handleVisaStatus(data);
    if (success) {
      // Store visa type for later use in conditional logic
      localStorage.setItem('visaType', data.visaType);
      
      // Skip to employment step for non-student visas
      if (data.visaType !== VisaType.F1 && data.visaType !== VisaType.J1) {
        localStorage.setItem('skipAcademic', 'true');
        navigation.setCurrentStep(navigation.currentStep + 2); // Skip Academic step
      } else {
        // Regular student visa flow
        localStorage.setItem('skipAcademic', 'false');
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

  // Check if visa type is F1 or J1 (student visas)
  const isF1OrJ1 = () => {
    const visaType = visaStatus.visaData.visaType;
    return visaType === VisaType.F1 || visaType === VisaType.J1;
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
