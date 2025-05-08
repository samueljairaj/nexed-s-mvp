import React from "react";
import { AccountCreationStep } from "@/components/onboarding/AccountCreationStep";
import { PersonalInfoStep } from "@/components/onboarding/PersonalInfoStep";
import { VisaStatusStep } from "@/components/onboarding/VisaStatusStep";
import { AcademicInfoStep } from "@/components/onboarding/AcademicInfoStep";
import { EmploymentInfoStep } from "@/components/onboarding/EmploymentInfoStep";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";

interface OnboardingStepContentProps {
  currentStep: number;
  accountData: any;
  personalData: any;
  visaData: any;
  academicData: any;
  employmentData: any;
  isSubmitting: boolean;
  currentUser: any;
  handleAccountCreation: (data: any) => void;
  handlePersonalInfo: (data: any) => void;
  handleVisaStatus: (data: any) => void;
  handleVisaTypeChange: (visaType: string) => void;
  handleAcademicInfo: (data: any) => void;
  handleEmploymentInfo: (data: any) => void;
  handleEmploymentStatusChange: (status: string) => void;
  isF1OrJ1: () => boolean;
  isEmployed: () => boolean;
  isOptOrCpt: () => boolean;
  isStemOpt: () => boolean;
  handleFinish: () => void;
}

export function OnboardingStepContent({
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
}: OnboardingStepContentProps) {
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
          isF1OrJ1={visaData.visaType === "F1" || visaData.visaType === "J1"}
          isSubmitting={isSubmitting}
        />
      );
    case 4:
      return (
        <EmploymentInfoStep
          defaultValues={employmentData}
          onSubmit={handleEmploymentInfo}
          visaType={visaData.visaType || "F1"}
          onEmploymentStatusChange={handleEmploymentStatusChange}
          isF1OrJ1={isF1OrJ1}
          isEmployed={isEmployed}
          isOptOrCpt={isOptOrCpt}
          isStemOpt={isStemOpt}
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
            employer: employmentData.employerName,
            courseStartDate: academicData.courseStartDate,
            graduationDate: academicData.graduationDate,
            employmentStatus: employmentData.employmentStatus,
            optType: employmentData.optType,
            previousUniversity: academicData.previousUniversity,
            hasTransferred: academicData.hasTransferred,
            employmentStartDate: employmentData.employmentStartDate,
            usEntryDate: personalData.usEntryDate
          }}
        />
      );
    default:
      return null;
  }
}
