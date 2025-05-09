import { z } from "zod";

export type VisaType = "F1" | "J1" | "H1B" | "Other" | null;

// Account Creation Schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Personal Info Schema (for the step after account creation)
export const onboardingPersonalInfoSchema = z.object({
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  nationality: z.string().min(1, "Nationality is required"),
  country: z.string().min(1, "Country is required"),
  usEntryDate: z.date({
    required_error: "Date of entry to the US is required",
  }),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

// Visa Status Schema
export const visaStatusSchema = z.object({
  visaType: z.enum(["F1", "J1", "H1B", "Other"], {
    required_error: "Visa type is required",
  }),
  visaExpiryDate: z.date().optional(),
  hasDS2019: z.boolean().optional(),
  hasDependents: z.boolean().optional(),
  sevisId: z.string().optional(),
  i20ExpiryDate: z.date().optional(),
  entryDate: z.date().optional(),
});

// Academic Info Schema
export const academicInfoSchema = z.object({
  university: z.string().min(1, "University name is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  degreeLevel: z.string().min(1, "Degree level is required"),
  courseStartDate: z.date().optional(),
  graduationDate: z.date().optional(),
  hasTransferred: z.boolean().optional(),
  previousUniversity: z.string().optional(),
  isSTEM: z.boolean().optional(),
  programStartDate: z.date().optional(),
});

export const visaInfoSchema = z.object({
  visaType: z.enum(["F1", "J1", "H1B", "Other"]),
  otherVisaType: z.string().optional(),
  countryOfOrigin: z.string().min(1, "Please select your country of origin"),
  visaStatus: z.enum(["Active", "Pending", "Expiring Soon", "Expired", "Not Yet Obtained"]),
  visaExpirationDate: z.date().refine(date => {
    if (date < new Date()) {
      return false;
    }
    return true;
  }, {
    message: "Expiration date must be in the future"
  }).optional(),
});

export const educationalInfoSchema = z.object({
  university: z.string().optional(),
  programDegree: z.enum(["Bachelor's", "Master's", "PhD", "Certificate", "Exchange Program", "Other"]).optional(),
  fieldOfStudy: z.string().optional(),
  programStartDate: z.date().optional(),
  programEndDate: z.date().optional(),
}).refine(data => {
  if (data.programStartDate && data.programEndDate) {
    return data.programEndDate > data.programStartDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["programEndDate"],
});

export const sevisInfoSchema = z.object({
  sevisId: z.string().regex(/^N00\d{8}$/, "SEVIS ID must be in format N00########").optional(),
  i20IssueDate: z.date().refine(date => date <= new Date(), {
    message: "Issue date must be in the past or today"
  }).optional(),
  i20ExpirationDate: z.date().refine(date => date > new Date(), {
    message: "Expiration date must be in the future"
  }).optional(),
  previousSevisIds: z.array(z.string().regex(/^N00\d{8}$/, "SEVIS ID must be in format N00########")).optional(),
});

export const employmentInfoSchema = z.object({
  employmentStatus: z.enum(["Not Employed", "On-Campus Employment", "CPT", "OPT", "STEM OPT Extension", "H1B"]),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentStartDate: z.date().optional(),
  employmentEndDate: z.date().optional(),
  isFieldRelated: z.boolean().optional(),
  optCptStartDate: z.date().optional(),
  optCptEndDate: z.date().optional(),
  eadNumber: z.string().optional(),
  stemEVerify: z.string().optional(),
  stemI983Date: z.date().optional(),
}).refine(data => {
  if (data.employmentStartDate && data.employmentEndDate) {
    return data.employmentEndDate > data.employmentStartDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["employmentEndDate"],
});

export const preferencesSchema = z.object({
  documentChecklist: z.array(z.string()).min(1, "Select at least one document"),
  notificationPreferences: z.array(z.string()).min(1, "Select at least one notification method"),
  communicationFrequency: z.enum(["Daily", "Weekly", "Bi-weekly", "Monthly", "Only for urgent matters"]),
});

export const termsSchema = z.object({
  termsOfService: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms of Service",
  }),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must accept the Privacy Policy",
  }),
  dataUsage: z.boolean().optional(),
  legalDisclaimer: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the Legal Disclaimer",
  }),
});

export const OnboardingSteps = {
  PERSONAL_INFO: 1,
  VISA_INFO: 2,
  EDUCATIONAL_INFO: 3,
  SEVIS_INFO: 4,
  EMPLOYMENT_INFO: 5,
  DOCUMENT_PREFERENCES: 6,
  TERMS: 7,
  COMPLETION: 8
};

export const stepLabels = [
  "Personal Info",
  "Visa Info",
  "Education",
  "SEVIS",
  "Employment",
  "Documents",
  "Terms",
  "Complete"
];

export interface OnboardingFormData {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Visa info
  visaType: string;
  otherVisaType: string;
  countryOfOrigin: string;
  visaStatus: string;
  visaExpirationDate: Date | null;
  
  // Educational info
  university: string;
  programDegree: string;
  fieldOfStudy: string;
  programStartDate: Date | null;
  programEndDate: Date | null;
  
  // SEVIS info
  sevisId: string;
  i20IssueDate: Date | null;
  i20ExpirationDate: Date | null;
  previousSevisIds: string[];
  
  // Employment info
  employmentStatus: string;
  employerName: string;
  jobTitle: string;
  employmentStartDate: Date | null;
  employmentEndDate: Date | null;
  isFieldRelated: boolean;
  optCptStartDate: Date | null;
  optCptEndDate: Date | null;
  eadNumber: string;
  stemEVerify: string;
  stemI983Date: Date | null;
  
  // Document and notification preferences
  documentChecklist: string[];
  notificationPreferences: string[];
  communicationFrequency: string;
  
  // Terms and privacy
  termsOfService: boolean;
  privacyPolicy: boolean;
  dataUsage: boolean;
  legalDisclaimer: boolean;
}

export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", 
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", 
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", 
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", 
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", 
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", 
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", 
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", 
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", 
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", 
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", 
  "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", 
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", 
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", 
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
