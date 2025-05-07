import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { AccountCreationStep, AccountCreationFormData } from "@/components/onboarding/AccountCreationStep";
import { PersonalInfoStep, PersonalInfoFormData } from "@/components/onboarding/PersonalInfoStep";
import { VisaStatusStep, VisaStatusFormData } from "@/components/onboarding/VisaStatusStep";
import { AcademicInfoStep, AcademicInfoFormData } from "@/components/onboarding/AcademicInfoStep";
import { EmploymentStep, EmploymentFormData } from "@/components/onboarding/EmploymentStep";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";
import { StepNavigation } from "@/components/onboarding/StepNavigation";

const Onboarding = () => {
  const { isAuthenticated, currentUser, updateProfile, signup, completeOnboarding, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This is used when we have multiple steps, to track progress
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
    visaType: "f1",
    currentStatus: ""
  });
  
  const [academicData, setAcademicData] = useState<Partial<AcademicInfoFormData>>({
    university: "",
    degreeLevel: "",
    fieldOfStudy: "",
    isSTEM: false
  });
  
  const [employmentData, setEmploymentData] = useState<Partial<EmploymentFormData>>({
    employmentStatus: ""
  });

  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingComplete) {
      navigate("/app/dashboard");
    }
    
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
        setVisaData(prev => ({ ...prev, visaType: currentUser.visaType as any }));
      }
      
      if (currentUser.university) {
        setAcademicData(prev => ({ ...prev, university: currentUser.university || "" }));
      }
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
        visaType: data.visaType,
        // Save other visa data as needed
      });
      
      // Skip to employment step for non-student visas
      if (data.visaType !== "f1" && data.visaType !== "j1") {
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
    setVisaData(prev => ({ ...prev, visaType: visaType as "f1" | "j1" | "h1b" | "other" }));
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

  const handleEmploymentInfo = async (data: EmploymentFormData) => {
    setEmploymentData(data);
    setIsSubmitting(true);
    
    try {
      // Only include fields that are defined in UserProfile
      await updateProfile({
        // Remove employer field since it doesn't exist in the UserProfile type
        // employer: data.employer,
        // jobTitle: data.jobTitle,
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

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      toast.success("Onboarding completed successfully!");
      navigate("/app/dashboard");
    } catch (error) {
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if step is the first step
  const isFirstStep = () => {
    return currentStep === 0;
  };

  // Determine if step is the last step
  const isLastStep = () => {
    return currentStep === 4;
  };

  // Calculate the progress percentage
  const calculateProgress = () => {
    // We have 5 steps (0-indexed)
    return ((currentStep + 1) / 5) * 100;
  };

  // Function to render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <AccountCreationStep
            defaultValues={accountData}
            onSubmit={handleAccountCreation}
            isSubmitting={isSubmitting}
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            defaultValues={personalData}
            onSubmit={handlePersonalInfo}
            isSubmitting={isSubmitting}
          />
        );
      case 2:
        return (
          <VisaStatusStep
            defaultValues={visaData}
            onSubmit={handleVisaStatus}
            onVisaTypeChange={handleVisaTypeChange}
            isSubmitting={isSubmitting}
          />
        );
      case 3:
        return (
          <AcademicInfoStep
            defaultValues={academicData}
            onSubmit={handleAcademicInfo}
            isF1OrJ1={visaData.visaType === "f1" || visaData.visaType === "j1"}
            isSubmitting={isSubmitting}
          />
        );
      case 4:
        return (
          <EmploymentStep
            defaultValues={employmentData}
            onSubmit={handleEmploymentInfo}
            visaType={visaData.visaType || "f1"}
            onEmploymentStatusChange={handleEmploymentStatusChange}
            employmentStatus={employmentData.employmentStatus || ""}
            isSubmitting={isSubmitting}
          />
        );
      case 5:
        return (
          <OnboardingComplete
            onFinish={handleFinish}
            isSubmitting={isSubmitting}
            userData={{
              name: currentUser?.name,
              visaType: visaData.visaType,
              university: academicData.university,
              fieldOfStudy: academicData.fieldOfStudy,
              employer: employmentData.employer
            }}
          />
        );
      default:
        return null;
    }
  };

  // Step names for the progress indicator
  const stepNames = ["Account", "Personal", "Visa", "Academic", "Employment"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="ml-2 text-xl font-bold">neXed</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome to neXed</h1>
            
            {/* Progress bar */}
            <OnboardingProgress 
              currentStep={currentStep}
              progress={calculateProgress()}
              stepNames={stepNames}
            />
            
            {/* Step content */}
            <div className="mt-8">
              {renderCurrentStep()}
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
                onPrevious={() => setCurrentStep(currentStep - 1)}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
