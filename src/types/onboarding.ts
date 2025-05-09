
import { z } from "zod";

// Shared schema patterns
const optionalDateSchema = z.date().optional().nullable();
const optionalStringSchema = z.string().optional().nullable();
const optionalBooleanSchema = z.boolean().optional().nullable();

// Personal Info Schema
export const personalInfoSchema = z.object({
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  usEntryDate: optionalDateSchema,
  nationality: z.string().min(1, "Nationality is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

// Visa Status Schema
export const visaStatusSchema = z.object({
  visaType: z.enum(["F1", "J1", "H1B", "Other"], {
    required_error: "Visa type is required",
  }),
  visaExpiryDate: optionalDateSchema,
  hasDS2019: optionalBooleanSchema,
  hasDependents: optionalBooleanSchema,
  sevisId: optionalStringSchema,
  i20ExpiryDate: optionalDateSchema,
  entryDate: optionalDateSchema,
  currentStatus: optionalStringSchema,
  programStartDate: optionalDateSchema,
});

// Academic Info Schema
export const academicInfoSchema = z.object({
  university: z.string().min(1, "University name is required"),
  degreeLevel: z.string().min(1, "Degree level is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  programStartDate: optionalDateSchema,
  expectedGraduationDate: optionalDateSchema,
  isTransferStudent: optionalBooleanSchema,
  previousUniversity: optionalStringSchema,
});

// Employment Info Schema
export const employmentInfoSchema = z.object({
  employmentStatus: z.string().min(1, "Employment status is required"),
  employer: optionalStringSchema,
  jobTitle: optionalStringSchema,
  startDate: optionalDateSchema,
  employerAddress: optionalStringSchema,
  supervisorName: optionalStringSchema,
  supervisorEmail: optionalStringSchema,
  isOPT: optionalBooleanSchema,
  isStemOPT: optionalBooleanSchema,
  optStartDate: optionalDateSchema,
  optEndDate: optionalDateSchema,
});

// Define export types from schemas
export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type VisaStatusFormValues = z.infer<typeof visaStatusSchema>;
export type AcademicInfoFormValues = z.infer<typeof academicInfoSchema>;
export type EmploymentInfoFormValues = z.infer<typeof employmentInfoSchema>;
