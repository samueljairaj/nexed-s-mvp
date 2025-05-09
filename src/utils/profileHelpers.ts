import { Database } from "@/integrations/supabase/types";

// Type for profile from database (snake_case)
export type DatabaseProfile = Database["public"]["Tables"]["profiles"]["Row"];

// Helper to convert snake_case profile to camelCase for component usage
export const convertProfileToCamelCase = (profile: DatabaseProfile | null) => {
  if (!profile) return null;
  
  return {
    ...profile,
    // Add common conversions needed throughout the app
    visaType: profile.visa_type,
    dateOfBirth: profile.date_of_birth,
    usEntryDate: profile.us_entry_date,
    courseStartDate: profile.course_start_date,
    employmentStartDate: profile.employment_start_date,
    passportExpiryDate: profile.passport_expiry_date,
    fieldOfStudy: profile.field_of_study,
    degreeLevel: profile.degree_level,
    onboardingComplete: profile.onboarding_complete,
    // Keep original properties too
    visa_type: profile.visa_type,
    date_of_birth: profile.date_of_birth,
    us_entry_date: profile.us_entry_date,
    course_start_date: profile.course_start_date,
    employment_start_date: profile.employment_start_date,
    passport_expiry_date: profile.passport_expiry_date,
    field_of_study: profile.field_of_study,
    degree_level: profile.degree_level,
    onboarding_complete: profile.onboarding_complete,
  };
};

// Helper to convert camelCase profile back to snake_case for database usage
export const convertProfileToSnakeCase = (profile: any) => {
  const result: any = { ...profile };
  
  // Map camelCase to snake_case
  if (profile.visaType !== undefined) result.visa_type = profile.visaType;
  if (profile.dateOfBirth !== undefined) result.date_of_birth = profile.dateOfBirth;
  if (profile.usEntryDate !== undefined) result.us_entry_date = profile.usEntryDate;
  if (profile.courseStartDate !== undefined) result.course_start_date = profile.courseStartDate;
  if (profile.employmentStartDate !== undefined) result.employment_start_date = profile.employmentStartDate;
  if (profile.passportExpiryDate !== undefined) result.passport_expiry_date = profile.passportExpiryDate;
  if (profile.fieldOfStudy !== undefined) result.field_of_study = profile.fieldOfStudy;
  if (profile.degreeLevel !== undefined) result.degree_level = profile.degreeLevel;
  if (profile.onboardingComplete !== undefined) result.onboarding_complete = profile.onboardingComplete;
  
  // Remove camelCase properties
  delete result.visaType;
  delete result.dateOfBirth;
  delete result.usEntryDate;
  delete result.courseStartDate;
  delete result.employmentStartDate;
  delete result.passportExpiryDate;
  delete result.fieldOfStudy;
  delete result.degreeLevel;
  delete result.onboardingComplete;
  
  return result;
};

// DsoProfile helpers
export type DsoProfileType = {
  id: string;
  title?: string;
  department?: string;
  office_location?: string;
  office_hours?: string;
  contact_email?: string;
  contact_phone?: string;
  university_id?: string;
  created_at?: string;
  updated_at?: string;
  // Camel case alternatives
  officeLocation?: string;
  officeHours?: string;
  contactEmail?: string;
  contactPhone?: string;
  universityId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Convert snake_case DSO profile to camelCase
export const convertDsoProfileToCamelCase = (profile: DsoProfileType | null) => {
  if (!profile) return null;
  
  return {
    ...profile,
    officeLocation: profile.office_location,
    officeHours: profile.office_hours,
    contactEmail: profile.contact_email,
    contactPhone: profile.contact_phone,
    universityId: profile.university_id,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};

// Convert camelCase DSO profile back to snake_case
export const convertDsoProfileToSnakeCase = (profile: DsoProfileType) => {
  const result: any = { ...profile };
  
  if (profile.officeLocation !== undefined) result.office_location = profile.officeLocation;
  if (profile.officeHours !== undefined) result.office_hours = profile.officeHours;
  if (profile.contactEmail !== undefined) result.contact_email = profile.contactEmail;
  if (profile.contactPhone !== undefined) result.contact_phone = profile.contactPhone;
  if (profile.universityId !== undefined) result.university_id = profile.universityId;
  if (profile.createdAt !== undefined) result.created_at = profile.createdAt;
  if (profile.updatedAt !== undefined) result.updated_at = profile.updatedAt;
  
  delete result.officeLocation;
  delete result.officeHours;
  delete result.contactEmail;
  delete result.contactPhone;
  delete result.universityId;
  delete result.createdAt;
  delete result.updatedAt;
  
  return result;
};
