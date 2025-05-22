
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
  programCompletionDate?: Date;
  isSTEM?: boolean;
  isTransferStudent?: boolean;
  transferHistory?: Array<{
    universityName: string;
    startDate: Date;
    endDate: Date;
    reason: string;
  }>;
  dsoName?: string;
  dsoEmail?: string;
  dsoPhone?: string;
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
  // Removing jobLocation field since it doesn't exist in the database
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

// Adding missing schema definitions used in other components
export const educationalInfoSchema = z.object({
  university: z.string().min(1, "University is required"),
  programDegree: z.string().min(1, "Program/Degree is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  programStartDate: z.date().optional(),
  programEndDate: z.date().optional(),
});

export const employmentInfoSchema = z.object({
  employmentStatus: z.enum(["Employed", "Not Employed"]),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentStartDate: z.date().optional(),
  employmentEndDate: z.date().optional(),
  authorizationType: z.enum(["None", "CPT", "OPT", "STEM OPT"]).optional(),
  authStartDate: z.date().optional(),
  authEndDate: z.date().optional(),
  eadNumber: z.string().optional(),
  eVerifyNumber: z.string().optional(),
  unemploymentDaysUsed: z.string().optional(),
});

export const preferencesSchema = z.object({
  receiveUpdates: z.boolean().default(true),
  documentSharing: z.enum(["Full Access", "Limited Access", "No Access"]).default("Limited Access"),
  communicationChannel: z.enum(["Email", "SMS", "Both"]).default("Email"),
});

export type DocumentCategory = 
  | "Personal" 
  | "Immigration" 
  | "Academic" 
  | "Employment" 
  | "Financial" 
  | "Medical" 
  | "Other";
