import { useRef } from "react";
import { AccountCreationStep } from "./AccountCreationStep";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { VisaStatusStep } from "./VisaStatusStep"; 
import { AcademicInfoStep, AcademicInfoStepRef } from "./AcademicInfoStep";
import { EmploymentStep } from "./EmploymentStep";
import { CompletionStep } from "./CompletionStep";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingStepContentProps {
  currentStep: number;
  accountData: any;
  personalData: any;
  visaData: any;
  academicData: any;
  employmentData: any;
  isSubmitting: boolean;
  currentUser: any;
  handleAccountCreation: (data: any) => Promise<boolean>;
  handlePersonalInfo: (data: any) => Promise<boolean>;
  handleVisaStatus: (data: any) => Promise<boolean>;
  handleVisaTypeChange: (type: any) => void;
  handleAcademicInfo: (data: any) => Promise<boolean>;
  handleEmploymentInfo: (data: any) => Promise<boolean>;
  handleEmploymentStatusChange: (status: string) => void;
  isF1OrJ1: boolean;
  isEmployed: boolean;
  isOptOrCpt: boolean;
  isStemOpt: boolean;
  handleFinish: () => Promise<boolean>;
  handleBackToLogin: () => void;
}

export const OnboardingStepContent = ({
  currentStep,
  accountData,
  personalData,
  visaData,
  academicData,
  employmentData,
  isSubmitting,
  currentUser,
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
  handleBackToLogin
}: OnboardingStepContentProps) => {
  console.log("OnboardingStepContent - currentStep:", currentStep);
  console.log("OnboardingStepContent - isF1OrJ1:", isF1OrJ1);
  
  // Create refs for form components
  const academicStepRef = useRef<AcademicInfoStepRef>(null);

  // Prepare user data for completion step
  const userData = {
    name: currentUser?.name || accountData?.firstName + " " + accountData?.lastName,
    visaType: visaData?.visaType || currentUser?.visaType || "F1",
    university: academicData?.university || currentUser?.university || "",
    fieldOfStudy: academicData?.fieldOfStudy || currentUser?.fieldOfStudy || "",
    employer: employmentData?.employerName || currentUser?.employerName || currentUser?.employer || "", 
  };
  
  console.log("User data prepared for completion checklist:", userData);

  // Student onboarding flow
  const renderStep = () => {
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
            handleBackToLogin={handleBackToLogin}
          />
        );
      case 3:
        return (
          <AcademicInfoStep
            ref={academicStepRef}
            defaultValues={academicData}
            onSubmit={handleAcademicInfo}
            isSubmitting={isSubmitting}
            isF1OrJ1={isF1OrJ1}
            handleBackToLogin={handleBackToLogin}
          />
        );
      case 4:
        return (
          <EmploymentStep
            defaultValues={employmentData}
            onSubmit={handleEmploymentInfo}
            onEmploymentStatusChange={handleEmploymentStatusChange}
            isSubmitting={isSubmitting}
            isOptOrCpt={isOptOrCpt}
            isEmployed={isEmployed}
            isStemOpt={isStemOpt}
            isF1OrJ1={isF1OrJ1}
          />
        );
      case 5:
        return (
          <CompletionStep
            onFinish={handleFinish}
            isSubmitting={isSubmitting}
            userData={userData}
          />
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return renderStep();
}

// Add a method to get the ref for the current step
export const getActiveStepRef = (currentStep: number, refs: {
  academicStepRef: React.RefObject<AcademicInfoStepRef>
}) => {
  switch (currentStep) {
    case 3:
      return refs.academicStepRef;
    default:
      return null;
  }
};