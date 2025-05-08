import { useState, useEffect } from "react";
import { useAuth, VisaType } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AccountCreationFormData } from "@/components/onboarding/AccountCreationStep";
import { PersonalInfoFormData } from "@/components/onboarding/PersonalInfoStep";
import { VisaStatusFormData } from "@/components/onboarding/VisaStatusStep";
import { AcademicInfoFormData } from "@/components/onboarding/AcademicInfoStep";

export function useOnboardingState() {
  const { isAuthenticated, currentUser, updateProfile, signup, completeOnboarding, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Data for all steps
  const [accountData, setAccountData] = useState<Partial<AccountCreationFormData>>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  
  const [personalData, setPersonalData] = useState<Partial<PersonalInfoFormData>>({
    country: "",
    phone: "",
    passportNumber: "",
    address: ""
  });
  
  const [visaData, setVisaData] = useState<Partial<VisaStatusFormData>>({
    visaType: "F1",
    currentStatus: ""
  });
  
  const [academicData, setAcademicData] = useState<Partial<AcademicInfoFormData>>({
    university: "",
    degreeLevel: "",
    fieldOfStudy: "",
    isSTEM: false
  });
  
  const [employmentData, setEmploymentData] = useState({
    employmentStatus: "Not Employed",
    employerName: "",
    jobTitle: "",
    employmentStartDate: null,
    employmentEndDate: null,
    isFieldRelated: false,
    optCptStartDate: null,
    optCptEndDate: null,
    eadNumber: "",
    stemEVerify: "",
    stemI983Date: null
  });

  useEffect(() => {
    // If user is already authenticated, pre-fill the fields
    if (isAuthenticated && currentUser) {
      setAccountData({
        firstName: currentUser.name?.split(" ")[0] || "",
        lastName: currentUser.name?.split(" ")[1] || "",
        email: currentUser.email || "",
      });
      
      if (currentUser.country) {
        setPersonalData(prev => ({ ...prev, country: currentUser.country || "" }));
      }
      
      if (currentUser.visaType) {
        setVisaData(prev => ({ ...prev, visaType: currentUser.visaType }));
      }
      
      if (currentUser.university) {
        setAcademicData(prev => ({ ...prev, university: currentUser.university || "" }));
      }
    }
  }, [isAuthenticated, currentUser]);

  const handleAccountCreation = async (data: AccountCreationFormData) => {
    setAccountData(data);
    
    if (!isAuthenticated) {
      setIsSubmitting(true);
      try {
        await signup(data.email, data.password);
        // Update the profile with name
        await updateProfile({ 
          name: `${data.firstName} ${data.lastName}` 
        });
        toast.success("Account created successfully!");
        setCurrentStep(currentStep + 1);
      } catch (error: any) {
        toast.error(`Account creation failed: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Just update the profile with name if authenticated
      setIsSubmitting(true);
      try {
        await updateProfile({ 
          name: `${data.firstName} ${data.lastName}` 
        });
        setCurrentStep(currentStep + 1);
      } catch (error) {
        toast.error("Failed to update profile");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePersonalInfo = async (data: PersonalInfoFormData) => {
    setPersonalData(data);
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        country: data.country,
        // Save other personal data as needed
      });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      toast.error("Failed to save personal information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVisaStatus = async (data: VisaStatusFormData) => {
    setVisaData(data);
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        visaType: data.visaType as VisaType,
        // Save other visa data as needed
      });
      
      // Skip to employment step for non-student visas
      if (data.visaType !== "F1" && data.visaType !== "J1") {
        setCurrentStep(currentStep + 2);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      toast.error("Failed to save visa information");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVisaTypeChange = (visaType: string) => {
    setVisaData(prev => ({ 
      ...prev, 
      visaType: visaType as "F1" | "J1" | "H1B" | "Other"
    }));
  };

  const handleAcademicInfo = async (data: AcademicInfoFormData) => {
    setAcademicData(data);
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        university: data.university,
        // Save other academic data as needed
      });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      toast.error("Failed to save academic information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmploymentInfo = async (data: any) => {
    setEmploymentData(data);
    setIsSubmitting(true);
    
    try {
      // Only include fields that are defined in UserProfile
      await updateProfile({
        // employmentStatus would be saved here if it was in UserProfile
      });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      toast.error("Failed to save employment information");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEmploymentStatusChange = (status: string) => {
    setEmploymentData(prev => ({ ...prev, employmentStatus: status }));
  };
  
  // Helper functions for the EmploymentInfoStep
  const isF1OrJ1 = () => {
    return visaData.visaType === "F1" || visaData.visaType === "J1";
  };
  
  const isEmployed = () => {
    return employmentData.employmentStatus !== "Not Employed";
  };
  
  const isOptOrCpt = () => {
    return employmentData.employmentStatus === "CPT" || 
           employmentData.employmentStatus === "OPT" || 
           employmentData.employmentStatus === "STEM OPT Extension";
  };
  
  const isStemOpt = () => {
    return employmentData.employmentStatus === "STEM OPT Extension";
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Mark onboarding as complete in the database
      await completeOnboarding();
      toast.success("Onboarding completed successfully!");
      
      // Navigation is now handled directly in the OnboardingComplete component
      // This ensures proper order - first complete onboarding, then navigate
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error("Error completing onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Determine if step is the first step
  const isFirstStep = () => {
    // If authenticated, first visible step is step 1 (Personal Info)
    return isAuthenticated ? currentStep === 1 : currentStep === 0;
  };

  // Determine if step is the last step
  const isLastStep = () => {
    return currentStep === 4;
  };

  // Calculate the progress percentage
  const calculateProgress = () => {
    // If authenticated, we skip step 0, so we have 4 steps (1-4)
    // Otherwise, we have 5 steps (0-4)
    const totalSteps = isAuthenticated ? 4 : 5;
    const effectiveStep = isAuthenticated ? currentStep : currentStep + 1;
    return (effectiveStep / totalSteps) * 100;
  };

  return {
    currentStep,
    isSubmitting,
    accountData,
    personalData,
    visaData,
    academicData,
    employmentData,
    isAuthenticated,
    currentUser,
    isLoading,
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
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    calculateProgress,
    setCurrentStep
  };
}
