
import { z } from "zod";

// Shared schema patterns
const optionalDateSchema = z.date().optional().nullable();
const optionalStringSchema = z.string().optional().nullable();
const optionalBooleanSchema = z.boolean().optional().nullable();

// Countries array for select inputs
export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

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

// Schema for the onboarding personal info step specifically
export const onboardingPersonalInfoSchema = personalInfoSchema;

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

// Visa Info Schema
export const visaInfoSchema = z.object({
  visaType: z.string({
    required_error: "Visa type is required",
  }),
  otherVisaType: z.string().optional(),
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  visaStatus: z.string({
    required_error: "Visa status is required",
  }),
  visaExpirationDate: optionalDateSchema,
});

// SEVIS Info Schema
export const sevisInfoSchema = z.object({
  sevisId: z.string().min(1, "SEVIS ID is required"),
  i20IssueDate: z.date({
    required_error: "Issue date is required",
  }),
  i20ExpirationDate: z.date({
    required_error: "Expiration date is required",
  }),
  previousSevisIds: z.array(z.string()).default([]),
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

// Educational Info Schema (alias for academic info)
export const educationalInfoSchema = academicInfoSchema;

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

// Terms and conditions schema
export const termsSchema = z.object({
  termsOfService: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms of Service",
  }),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must agree to the Privacy Policy",
  }),
  dataUsage: z.boolean(),
  legalDisclaimer: z.boolean().refine(val => val === true, {
    message: "You must acknowledge this disclaimer",
  }),
});

// Document preferences schema
export const preferencesSchema = z.object({
  receiveNotifications: z.boolean().default(true),
  shareDocuments: z.boolean().default(false),
  autoOrganize: z.boolean().default(true),
  receiveUpdates: z.boolean().default(true),
});

// Define export types from schemas
export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type VisaStatusFormValues = z.infer<typeof visaStatusSchema>;
export type AcademicInfoFormValues = z.infer<typeof academicInfoSchema>;
export type EmploymentInfoFormValues = z.infer<typeof employmentInfoSchema>;
export type VisaInfoFormValues = z.infer<typeof visaInfoSchema>;
export type SevisInfoFormValues = z.infer<typeof sevisInfoSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
export type TermsFormValues = z.infer<typeof termsSchema>;
export type EducationalInfoFormValues = z.infer<typeof educationalInfoSchema>;
