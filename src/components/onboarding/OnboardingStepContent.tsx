import { useRef } from "react";
import { AccountCreationStep } from "./AccountCreationStep";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { VisaStatusStep } from "./VisaStatusStep"; 
import { AcademicInfoStep, AcademicInfoStepRef } from "./AcademicInfoStep";
import { EmploymentStep } from "./EmploymentStep";
import { CompletionStep } from "./CompletionStep";
import { useAuth } from "@/contexts/auth-hooks";
import { 
  AccountCreationFormValues, 
  PersonalInfoFormValues, 
  VisaStatusFormValues, 
  AcademicInfoFormValues, 
  EmploymentInfoFormValues 
} from "@/types/onboarding";

// Define User type to avoid circular dependency
interface User {
  id: string;
  email: string;
  user_type: "student" | "dso";
  onboardingComplete: boolean;
  role?: "student" | "dso";
  name?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  currentCountry?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  nationality?: string;
  visaType?: string;
  visaStatus?: string;
  visa_expiry_date?: string;
  usEntryDate?: string;
  i94Number?: string;
  sevisId?: string;
  university?: string;
  universityId?: string;
  university_id?: string;
  universityName?: string;
  universityCountry?: string;
  fieldOfStudy?: string;
  degreeLevel?: string;
  courseStartDate?: string;
  graduationDate?: string;
  isSTEM?: boolean;
  dsoContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  employmentStatus?: string;
  employerName?: string;
  employer?: string;
  jobTitle?: string;
  employmentStartDate?: string;
  employmentEndDate?: string;
  authType?: string;
  authStartDate?: string;
  authEndDate?: string;
  eadNumber?: string;
  unemploymentDays?: string;
  eVerifyNumber?: string;
}

interface OnboardingStepContentProps {
  currentStep: number;
  accountData: AccountCreationFormValues | null;
  personalData: PersonalInfoFormValues | null;
  visaData: VisaStatusFormValues | null;
  academicData: AcademicInfoFormValues | null;
  employmentData: EmploymentInfoFormValues | null;
  isSubmitting: boolean;
  currentUser: User | null;
  handleAccountCreation: (data: AccountCreationFormValues) => Promise<boolean>;
  handlePersonalInfo: (data: PersonalInfoFormValues) => Promise<boolean>;
  handleVisaStatus: (data: VisaStatusFormValues) => Promise<boolean>;
  handleVisaTypeChange: (type: string) => void;
  handleAcademicInfo: (data: AcademicInfoFormValues) => Promise<boolean>;
  handleEmploymentInfo: (data: EmploymentInfoFormValues) => Promise<boolean>;
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