import { z } from "zod";

export interface AccountCreationFormValues {
  email: string;
  name: string;
}

export interface PersonalInfoFormValues {
  country: string;
  currentCountry?: string;
  dateOfBirth?: Date;
  phoneNumber: string;
  passportNumber: string;
  passportExpiryDate?: Date;
  address: string;
}

export type VisaType = "F1" | "J1" | "H1B" | "Other";

export interface VisaStatusFormValues {
  visaType: VisaType;
  visaStatus?: string;
  entryDate?: Date;
  visaExpiryDate?: Date;
  sevisId?: string;
  i94Number?: string;
  otherVisaType?: string;
  hadUnemploymentPeriods?: boolean;
  totalUnemployedDays?: string;
  i20ExpiryDate?: Date;
  programStartDate?: Date;
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
  visaType?: VisaType;
}

// List of countries for dropdowns
export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", 
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", 
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", 
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", 
  "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", 
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", 
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", 
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", 
  "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", 
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", 
  "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", 
  "Zambia", "Zimbabwe"
];

// Schema definitions
export const personalInfoSchema = z.object({
  country: z.string().min(1, "Country is required"),
  currentCountry: z.string().min(1, "Current country is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  phoneNumber: z.string().min(1, "Phone number is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  passportExpiryDate: z.date({
    required_error: "Passport expiry date is required",
  }),
  address: z.string().min(1, "Address is required"),
});

export const visaStatusSchema = z.object({
  visaType: z.enum(["F1", "J1", "H1B", "Other"]),
  visaStatus: z.string().optional(),
  sevisId: z.string().optional(),
  i94Number: z.string().optional(),
  entryDate: z.date().optional(),
  visaExpiryDate: z.date().optional(),
  otherVisaType: z.string().optional(),
  hadUnemploymentPeriods: z.boolean().default(false),
  totalUnemployedDays: z.string().optional(),
  i20ExpiryDate: z.date().optional(),
  programStartDate: z.date().optional(),
});

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

export const termsSchema = z.object({
  termsOfService: z.boolean().refine(value => value === true, {
    message: "You must accept the Terms of Service"
  }),
  privacyPolicy: z.boolean().refine(value => value === true, {
    message: "You must accept the Privacy Policy"
  }),
  dataUsage: z.boolean().optional(),
  legalDisclaimer: z.boolean().refine(value => value === true, {
    message: "You must acknowledge the legal disclaimer"
  })
});

export const sevisInfoSchema = z.object({
  sevisId: z.string().min(1, "SEVIS ID is required"),
  i20IssueDate: z.date().nullable(),
  i20ExpirationDate: z.date().nullable(),
  previousSevisIds: z.array(z.string()).default([]),
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
