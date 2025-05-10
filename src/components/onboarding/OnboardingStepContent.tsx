import { AccountCreationStep } from "./AccountCreationStep";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { VisaStatusStep } from "./VisaStatusStep"; 
import { AcademicInfoStep } from "./AcademicInfoStep";
import { EmploymentStep } from "./EmploymentStep";
import { OnboardingComplete } from "./OnboardingComplete";
import { ComplianceChecklist } from "./ComplianceChecklist";

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

  // Prepare user data for compliance checklist
  const userData = {
    name: currentUser?.name,
    visaType: visaData.visaType,
    university: academicData.university,
    fieldOfStudy: academicData.fieldOfStudy,
    employer: employmentData.employerName, // Changed from employer to employerName
  };

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
          <OnboardingComplete
            handleFinish={handleFinish}
            isSubmitting={isSubmitting}
            role="student"
          />
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <>
      {renderStep()}
      {/* Pass user data directly to CompletionStep when on the final step */}
      {currentStep === 5 && (
        <ComplianceChecklist
          open={true}
          onOpenChange={() => {}}
          userData={userData}
        />
      )}
    </>
  );
}
