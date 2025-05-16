
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

// Terms schema for the Terms step
export const termsSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and privacy policy"),
});

export type TermsFormValues = z.infer<typeof termsSchema>;

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

// SEVIS information schema
export const sevisInfoSchema = z.object({
  sevisId: z.string().min(5, "Please enter your SEVIS ID"),
  i94Number: z.string().min(5, "Please enter your I-94 number"),
  entryDate: z.date({
    required_error: "Please select your most recent entry date",
  }),
});

export type SevisInfoFormValues = z.infer<typeof sevisInfoSchema>;

// Educational information schema
export const educationalInfoSchema = z.object({
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
});

export type EducationalInfoFormValues = z.infer<typeof educationalInfoSchema>;

// Document preferences schema
export const preferencesSchema = z.object({
  notificationPreference: z.enum(["email", "sms", "both"]),
  documentReminders: z.boolean(),
  autoRenewals: z.boolean().optional(),
});

export type PreferencesFormValues = z.infer<typeof preferencesSchema>;

// Visa status schema
export const visaStatusSchema = z.object({
  visaType: z.enum(["F1", "J1", "H1B", "Other", "OPT", "CPT"]), // Added OPT and CPT as valid types
  visaStatus: z.string().min(1, "Please select your current visa status"),
  sevisId: z.string().min(1, "Please enter your SEVIS ID"),
  i94Number: z.string().min(1, "Please enter your I-94 number"),
  entryDate: z.date({
    required_error: "Please select your most recent entry date",
  }),
  visaExpiryDate: z.date().optional(),
  programStartDate: z.date().optional(),
  i20ExpiryDate: z.date().optional(), // Use this for both I-20 and DS-2019
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
  OPT = "OPT", // Added OPT to match schema
  CPT = "CPT", // Added CPT to match schema
  Other = "Other"
}

// Status for OPT/STEM OPT
export enum OptStatus {
  PreOpt = "pre_opt",
  Opt = "opt",
  StemOpt = "stem_opt",
  None = "none"
}

// Export the countries list directly from here as well for consistency
// This will allow imports from the same location to work properly
export const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "North Korea",
  "South Korea",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];
