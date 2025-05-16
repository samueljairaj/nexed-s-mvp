import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AccountCreationFormValues, PersonalInfoFormValues, VisaStatusFormValues, AcademicInfoFormValues, EmploymentInfoFormValues } from "@/types/onboarding";

// Type for storing the onboarding state
export interface OnboardingState {
  accountCreation: Partial<AccountCreationFormValues>;
  personalInfo: Partial<PersonalInfoFormValues>;
  visaStatus: Partial<VisaStatusFormValues>;
  academicInfo: Partial<AcademicInfoFormValues>;
  employmentInfo: Partial<EmploymentInfoFormValues>;
  completedSteps: string[];
  currentStep: number;
}

// Hook for managing onboarding state
export const useOnboardingState = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Initialize with empty values
  const [state, setState] = useState<OnboardingState>({
    accountCreation: {},
    personalInfo: {},
    visaStatus: {},
    academicInfo: {},
    employmentInfo: {},
    completedSteps: [],
    currentStep: 0
  });

  // Load any existing user data into onboarding state - with dependency array to prevent infinite reloading
  useEffect(() => {
    // Only attempt to load user data if we have a user and we're in the loading state
    if (currentUser && loading) {
      const updatedState = { ...state };
      
      // Pre-fill personal info if available
      if (currentUser.name || currentUser.email) {
        const nameParts = (currentUser.name || "").split(" ");
        updatedState.accountCreation = {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: currentUser.email || ""
        };
      }

      // Pre-fill personal info if available
      if (currentUser.country || currentUser.phone || currentUser.passportNumber) {
        updatedState.personalInfo = {
          country: currentUser.country || "",
          currentCountry: "United States", // Default for existing users
          phoneNumber: currentUser.phone || "",
          passportNumber: currentUser.passportNumber || "",
          address: currentUser.address || "",
          // Convert date strings to Date objects if they exist
          dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth) : undefined,
          passportExpiryDate: currentUser.passportExpiryDate ? new Date(currentUser.passportExpiryDate) : undefined
        };
      }

      // Pre-fill visa status if available
      if (currentUser.visaType) {
        updatedState.visaStatus = {
          visaType: currentUser.visaType,
          visaStatus: "Active", // Default for existing users
          // Don't try to access non-existent properties
          sevisId: "", 
          i94Number: "", 
          entryDate: currentUser.usEntryDate ? new Date(currentUser.usEntryDate) : undefined,
          visaExpiryDate: currentUser.visa_expiry_date ? new Date(currentUser.visa_expiry_date) : undefined 
        };
      }

      // Pre-fill academic info if available
      if (currentUser.university || currentUser.degreeLevel) {
        updatedState.academicInfo = {
          university: currentUser.university || "",
          degreeLevel: currentUser.degreeLevel || "",
          fieldOfStudy: currentUser.fieldOfStudy || "",
          isSTEM: currentUser.isSTEM || false,
          programStartDate: currentUser.courseStartDate ? new Date(currentUser.courseStartDate) : undefined,
          programCompletionDate: undefined // No direct mapping in current schema
        };
      }

      // Pre-fill employment info if available
      // Don't try to access non-existent properties
      if (currentUser?.employmentStartDate) {
        updatedState.employmentInfo = {
          employmentStatus: "Employed",
          employerName: "", 
          jobTitle: "", 
          employmentStartDate: currentUser?.employmentStartDate ? new Date(currentUser.employmentStartDate) : undefined,
          jobLocation: "", // No direct mapping in current schema
        };
      } else {
        updatedState.employmentInfo = {
          employmentStatus: "Not Employed"
        };
      }

      // Update state with pre-filled values
      setState(updatedState);
      setLoading(false);
    } else if (!currentUser) {
      // If no user, just set loading to false
      setLoading(false);
    }
  }, [currentUser]); // Only depend on currentUser changes, not on state

  // Function to calculate progress percentage
  const calculateProgress = () => {
    const totalSteps = 5; // Total number of steps in the onboarding process
    const currentIndex = currentStep;
    return Math.round((currentIndex / totalSteps) * 100);
  };

  // Function to skip directly to the dashboard
  const skipOnboarding = () => {
    navigate("/app/dashboard");
  };

  // Function to update a specific step in the onboarding process
  const updateStep = (step: keyof OnboardingState, data: any) => {
    setState(prev => ({
      ...prev,
      [step]: { ...((prev[step] as object) || {}), ...data },
      completedSteps: [...new Set([...prev.completedSteps, step])]
    }));
  };

  // Check if a step has been completed
  const isStepCompleted = (step: keyof OnboardingState) => 
    state.completedSteps.includes(step);

  // Check if this is the first step
  const isFirstStep = () => currentStep === 0;
  
  // Check if this is the last step
  const isLastStep = () => currentStep === 4;
  
  // Go to the previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if visa type is F1 or J1
  const isF1OrJ1 = () => {
    const visaType = state.visaStatus.visaType;
    return visaType === "F1" || visaType === "J1";
  };

  // Check if user is employed
  const isEmployed = () => {
    return state.employmentInfo.employmentStatus === "Employed";
  };

  // Check if visa status is OPT or CPT
  const isOptOrCpt = () => {
    const visaStatus = state.visaStatus.visaStatus;
    return visaStatus === "opt" || visaStatus === "cpt";
  };

  // Check if visa status is STEM OPT
  const isStemOpt = () => {
    const visaStatus = state.visaStatus.visaStatus;
    return visaStatus === "stem_opt";
  };

  // Handle account creation
  const handleAccountCreation = async (data: AccountCreationFormValues) => {
    setIsSubmitting(true);
    try {
      updateStep('accountCreation', data);
      setCurrentStep(1);
      return true;
    } catch (error) {
      console.error("Account creation error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle personal information
  const handlePersonalInfo = async (data: PersonalInfoFormValues) => {
    setIsSubmitting(true);
    try {
      updateStep('personalInfo', data);
      setCurrentStep(2);
      return true;
    } catch (error) {
      console.error("Personal info error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle visa status
  const handleVisaStatus = async (data: VisaStatusFormValues) => {
    setIsSubmitting(true);
    try {
      updateStep('visaStatus', data);
      
      // Skip to Employment step if not F1 or J1
      const skipAcademicStep = data.visaType !== "F1" && data.visaType !== "J1";
      setCurrentStep(skipAcademicStep ? 4 : 3);
      
      return true;
    } catch (error) {
      console.error("Visa status error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle visa type change
  const handleVisaTypeChange = (visaType: string) => {
    setState(prev => ({
      ...prev,
      visaStatus: { ...((prev.visaStatus as object) || {}), visaType: visaType as any }
    }));
  };

  // Handle academic info
  const handleAcademicInfo = async (data: AcademicInfoFormValues) => {
    setIsSubmitting(true);
    try {
      updateStep('academicInfo', data);
      setCurrentStep(4);
      return true;
    } catch (error) {
      console.error("Academic info error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle employment info
  const handleEmploymentInfo = async (data: EmploymentInfoFormValues) => {
    setIsSubmitting(true);
    try {
      updateStep('employmentInfo', data);
      setCurrentStep(5);
      return true;
    } catch (error) {
      console.error("Employment info error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle employment status change
  const handleEmploymentStatusChange = (status: string) => {
    setState(prev => ({
      ...prev,
      employmentInfo: { ...((prev.employmentInfo as object) || {}), employmentStatus: status as "Employed" | "Not Employed" }
    }));
  };

  // Handle finish
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Handle finishing the onboarding process
      navigate("/app/dashboard");
      return true;
    } catch (error) {
      console.error("Finish error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get data for different sections
  const accountData = state.accountCreation;
  const personalData = state.personalInfo;
  const visaData = state.visaStatus;
  const academicData = state.academicInfo;
  const employmentData = state.employmentInfo;

  return {
    state,
    loading,
    isLoading: loading,
    isSubmitting,
    isAuthenticated,
    currentUser,
    currentStep,
    setCurrentStep,
    updateStep,
    isStepCompleted,
    skipOnboarding,
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
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    calculateProgress,
    handleFinish
  };
};

export default useOnboardingState;
