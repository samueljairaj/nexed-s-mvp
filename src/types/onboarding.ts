export interface AccountCreationFormValues {
  email: string;
  name: string;
}

export interface PersonalInfoFormValues {
  country: string;
  dateOfBirth?: Date;
  phoneNumber: string;
  passportNumber: string;
  passportExpiryDate?: Date;
  address: string;
}

export interface VisaStatusFormValues {
  visaType: "F1" | "J1" | "H1B" | "Other";
  entryDate?: Date;
  visaExpiryDate?: Date;
}

export interface AcademicInfoFormValues {
  university: string;
  degreeLevel: string;
  fieldOfStudy: string;
  programStartDate?: Date;
  isSTEM?: boolean;
}

export enum OptStatus {
  None = "None",
  Opt = "OPT",
  StemOpt = "STEM OPT"
}

export interface EmploymentInfoFormValues {
  employmentStatus: "Employed" | "Not Employed";
  employerName?: string;
  jobTitle?: string;
  employmentStartDate?: Date;
  employmentEndDate?: Date;
  isFieldRelated?: "Yes" | "No";
  authorizationType?: "None" | "CPT" | "OPT" | "STEM OPT";
  authStartDate?: Date;
  authEndDate?: Date;
  eadNumber?: string;
  unemploymentDaysUsed?: string;
  eVerifyNumber?: string;
  previousEmployers?: Array<{
    name: string;
    startDate: Date;
    endDate?: Date;
  }>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  category: string;
  priority: "High" | "Medium" | "Low";
  phase?: 'pre-arrival' | 'during-program' | 'post-graduation' | 'general';
  visaType?: "F1" | "J1" | "H1B" | "Other";
}
