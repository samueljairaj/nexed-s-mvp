
import { z } from "zod";

// Account creation schema
export const accountCreationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and privacy policy"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type AccountCreationFormValues = z.infer<typeof accountCreationSchema>;

// Personal information schema
export const personalInfoSchema = z.object({
  country: z.string().min(2, "Please select your country of origin"),
  currentCountry: z.string().min(2, "Please select your current country of residence"),
  phoneNumber: z.string().min(5, "Please enter a valid phone number"),
  passportNumber: z.string().min(5, "Please enter your passport number"),
  passportExpiryDate: z.date({
    required_error: "Please select your passport expiry date",
  }),
  dateOfBirth: z.date({
    required_error: "Please select your date of birth",
  }),
  address: z.string().min(5, "Please enter your U.S. residential address"),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

// Visa status schema
export const visaStatusSchema = z.object({
  visaType: z.enum(["F1", "J1", "H1B", "Other"]),
  visaStatus: z.string().min(1, "Please select your current visa status"),
  sevisId: z.string().min(1, "Please enter your SEVIS ID"),
  i94Number: z.string().min(1, "Please enter your I-94 number"),
  entryDate: z.date({
    required_error: "Please select your most recent entry date",
  }),
  visaExpiryDate: z.date().optional(),
  programStartDate: z.date().optional(),
  i20ExpiryDate: z.date().optional(),
  hasDS2019: z.boolean().optional(),
  hasDependents: z.boolean().optional(),
  hadUnemploymentPeriods: z.boolean().optional(),
  totalUnemployedDays: z.string().optional(),
});

export type VisaStatusFormValues = z.infer<typeof visaStatusSchema>;

// Academic information schema
export const academicInfoSchema = z.object({
  university: z.string().min(2, "Please enter your university name"),
  degreeLevel: z.string().min(1, "Please select your degree level"),
  fieldOfStudy: z.string().min(2, "Please enter your field of study"),
  isSTEM: z.boolean().optional(),
  programStartDate: z.date({
    required_error: "Please select your program start date",
  }),
  programCompletionDate: z.date({
    required_error: "Please select your expected program completion date",
  }),
  isTransferStudent: z.boolean().optional(),
  transferHistory: z.array(z.object({
    universityName: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string().optional(),
  })).optional(),
  dsoName: z.string().optional(),
  dsoEmail: z.string().email().optional(),
  dsoPhone: z.string().optional(),
});

export type AcademicInfoFormValues = z.infer<typeof academicInfoSchema>;

// Employment information schema
export const employmentInfoSchema = z.object({
  employmentStatus: z.enum(["Employed", "Not Employed"]),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentStartDate: z.date().optional(),
  employmentEndDate: z.date().optional(),
  jobLocation: z.string().optional(),
  isFieldRelated: z.enum(["Yes", "No", "Not Sure"]).optional(),
  authorizationType: z.enum(["CPT", "OPT", "STEM OPT", "None"]).optional(),
  authStartDate: z.date().optional(),
  authEndDate: z.date().optional(),
  eadNumber: z.string().optional(),
  unemploymentDaysUsed: z.string().optional(),
  eVerifyNumber: z.string().optional(),
  previousEmployers: z.array(z.object({
    employerName: z.string(),
    jobTitle: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    jobLocation: z.string(),
  })).optional(),
});

export type EmploymentInfoFormValues = z.infer<typeof employmentInfoSchema>;

// Document categories for upload
export enum DocumentCategory {
  Immigration = "immigration",
  Employment = "employment",
  Education = "education",
  Personal = "personal",
}

// Visa type enum for consistent usage across the app
export enum VisaType {
  F1 = "F1",
  J1 = "J1",
  H1B = "H1B",
  Other = "Other"
}

// Status for OPT/STEM OPT
export enum OptStatus {
  PreOpt = "pre_opt",
  Opt = "opt",
  StemOpt = "stem_opt",
  None = "none"
}
