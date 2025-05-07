
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, CheckCircle2, Calendar as CalendarIcon, AlertTriangle, X, Plus, Mail, MessageSquare, Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Country list for autocomplete
const countries = [
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

// Step 1: Personal Information form schema
const personalInfoSchema = z.object({
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

// Step 2: Visa Information form schema
const visaInfoSchema = z.object({
  visaType: z.enum(["F-1", "J-1", "H-1B", "Other"]),
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

// Step 3: Educational Information form schema
const educationalInfoSchema = z.object({
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

// Step 4: SEVIS Information form schema
const sevisInfoSchema = z.object({
  sevisId: z.string().regex(/^N00\d{8}$/, "SEVIS ID must be in format N00########").optional(),
  i20IssueDate: z.date().refine(date => date <= new Date(), {
    message: "Issue date must be in the past or today"
  }).optional(),
  i20ExpirationDate: z.date().refine(date => date > new Date(), {
    message: "Expiration date must be in the future"
  }).optional(),
  previousSevisIds: z.array(z.string().regex(/^N00\d{8}$/, "SEVIS ID must be in format N00########")).optional(),
});

// Step 5: Employment Information form schema
const employmentInfoSchema = z.object({
  employmentStatus: z.enum(["Not Employed", "On-Campus Employment", "CPT", "OPT", "STEM OPT Extension", "H-1B"]),
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

// Step 6: Document and Notification Preferences form schema
const preferencesSchema = z.object({
  documentChecklist: z.array(z.string()).min(1, "Select at least one document"),
  notificationPreferences: z.array(z.string()).min(1, "Select at least one notification method"),
  communicationFrequency: z.enum(["Daily", "Weekly", "Bi-weekly", "Monthly", "Only for urgent matters"]),
});

// Step 7: Terms and Privacy form schema
const termsSchema = z.object({
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

const OnboardingSteps = {
  PERSONAL_INFO: 1,
  VISA_INFO: 2,
  EDUCATIONAL_INFO: 3,
  SEVIS_INFO: 4,
  EMPLOYMENT_INFO: 5,
  DOCUMENT_PREFERENCES: 6,
  TERMS: 7,
  COMPLETION: 8
};

// Progress Bar Step Labels
const stepLabels = [
  "Personal Info",
  "Visa Info",
  "Education",
  "SEVIS",
  "Employment",
  "Documents",
  "Terms",
  "Complete"
];

const Onboarding = () => {
  const { updateProfile, completeOnboarding, currentUser, login, isAuthenticated } = useAuth();
  const [step, setStep] = useState(OnboardingSteps.PERSONAL_INFO);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // Form data for all steps
  const [allFormData, setAllFormData] = useState({
    // Personal info
    firstName: "",
    lastName: "",
    email: currentUser?.email || "",
    password: "",
    confirmPassword: "",
    
    // Visa info
    visaType: "",
    otherVisaType: "",
    countryOfOrigin: "",
    visaStatus: "",
    visaExpirationDate: null,
    
    // Educational info
    university: "",
    programDegree: "",
    fieldOfStudy: "",
    programStartDate: null,
    programEndDate: null,
    
    // SEVIS info
    sevisId: "",
    i20IssueDate: null,
    i20ExpirationDate: null,
    previousSevisIds: [],
    
    // Employment info
    employmentStatus: "Not Employed",
    employerName: "",
    jobTitle: "",
    employmentStartDate: null,
    employmentEndDate: null,
    isFieldRelated: false,
    optCptStartDate: null,
    optCptEndDate: null,
    eadNumber: "",
    stemEVerify: "",
    stemI983Date: null,
    
    // Document and notification preferences
    documentChecklist: [],
    notificationPreferences: ["Email"],
    communicationFrequency: "Weekly",
    
    // Terms and privacy
    termsOfService: false,
    privacyPolicy: false,
    dataUsage: false,
    legalDisclaimer: false,
  });

  // Custom document checklist based on user selections
  const [documentChecklist, setDocumentChecklist] = useState([]);
  
  // Step-specific forms
  const personalInfoForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: allFormData.firstName,
      lastName: allFormData.lastName,
      email: allFormData.email,
      password: allFormData.password,
      confirmPassword: allFormData.confirmPassword,
    }
  });
  
  const visaInfoForm = useForm({
    resolver: zodResolver(visaInfoSchema),
    defaultValues: {
      visaType: allFormData.visaType as any || undefined,
      otherVisaType: allFormData.otherVisaType,
      countryOfOrigin: allFormData.countryOfOrigin,
      visaStatus: allFormData.visaStatus as any || undefined,
      visaExpirationDate: allFormData.visaExpirationDate,
    }
  });
  
  const educationalInfoForm = useForm({
    resolver: zodResolver(educationalInfoSchema),
    defaultValues: {
      university: allFormData.university,
      programDegree: allFormData.programDegree as any || undefined,
      fieldOfStudy: allFormData.fieldOfStudy,
      programStartDate: allFormData.programStartDate,
      programEndDate: allFormData.programEndDate,
    }
  });
  
  const sevisInfoForm = useForm({
    resolver: zodResolver(sevisInfoSchema),
    defaultValues: {
      sevisId: allFormData.sevisId,
      i20IssueDate: allFormData.i20IssueDate,
      i20ExpirationDate: allFormData.i20ExpirationDate,
      previousSevisIds: allFormData.previousSevisIds,
    }
  });
  
  const employmentInfoForm = useForm({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      employmentStatus: allFormData.employmentStatus as any,
      employerName: allFormData.employerName,
      jobTitle: allFormData.jobTitle,
      employmentStartDate: allFormData.employmentStartDate,
      employmentEndDate: allFormData.employmentEndDate,
      isFieldRelated: allFormData.isFieldRelated,
      optCptStartDate: allFormData.optCptStartDate,
      optCptEndDate: allFormData.optCptEndDate,
      eadNumber: allFormData.eadNumber,
      stemEVerify: allFormData.stemEVerify,
      stemI983Date: allFormData.stemI983Date,
    }
  });
  
  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      documentChecklist: allFormData.documentChecklist,
      notificationPreferences: allFormData.notificationPreferences,
      communicationFrequency: allFormData.communicationFrequency as any,
    }
  });
  
  const termsForm = useForm({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      termsOfService: allFormData.termsOfService,
      privacyPolicy: allFormData.privacyPolicy,
      dataUsage: allFormData.dataUsage,
      legalDisclaimer: allFormData.legalDisclaimer,
    }
  });

  // Update document checklist based on user inputs
  useEffect(() => {
    const checklist = [];
    
    // Base documents all users need
    checklist.push("Valid Passport");
    checklist.push("Visa Document");
    
    const visaType = allFormData.visaType;
    
    if (visaType === "F-1" || visaType === "J-1") {
      checklist.push("I-94 Arrival Record");
      
      if (visaType === "F-1") {
        checklist.push("I-20 Form");
        checklist.push("SEVIS Fee Receipt");
        
        if (allFormData.employmentStatus === "OPT" || allFormData.employmentStatus === "STEM OPT Extension") {
          checklist.push("EAD Card");
          checklist.push("OPT Approval Notice");
        }
        
        if (allFormData.employmentStatus === "CPT") {
          checklist.push("CPT Authorization Letter");
          checklist.push("I-20 with CPT Endorsement");
        }
        
        if (allFormData.employmentStatus === "STEM OPT Extension") {
          checklist.push("I-983 Training Plan");
        }
      }
      
      if (visaType === "J-1") {
        checklist.push("DS-2019 Form");
        checklist.push("SEVIS Fee Receipt");
        checklist.push("Health Insurance Documentation");
      }
    }
    
    if (visaType === "H-1B") {
      checklist.push("I-797 Approval Notice");
      checklist.push("Labor Condition Application");
      checklist.push("Employment Verification Letter");
    }
    
    // Check for expiring documents
    if (allFormData.visaStatus === "Expiring Soon") {
      if (visaType === "F-1") {
        checklist.push("I-20 Extension Request Form");
      } else if (visaType === "J-1") {
        checklist.push("DS-2019 Extension Request Form");
      }
    }
    
    // Set the checklist
    setDocumentChecklist(checklist);
  }, [allFormData.visaType, allFormData.visaStatus, allFormData.employmentStatus]);

  // Check if we should skip education or SEVIS steps based on visa type
  const shouldShowEducationStep = () => {
    return allFormData.visaType === "F-1" || allFormData.visaType === "J-1" || allFormData.visaType === "H-1B";
  };
  
  const shouldShowSEVISStep = () => {
    return allFormData.visaType === "F-1" || allFormData.visaType === "J-1";
  };
  
  const isF1OrJ1 = () => {
    return allFormData.visaType === "F-1" || allFormData.visaType === "J-1";
  };
  
  const isEmployed = () => {
    return allFormData.employmentStatus !== "Not Employed";
  };
  
  const isOptOrCpt = () => {
    return allFormData.employmentStatus === "CPT" || allFormData.employmentStatus === "OPT" || allFormData.employmentStatus === "STEM OPT Extension";
  };
  
  const isStemOpt = () => {
    return allFormData.employmentStatus === "STEM OPT Extension";
  };
  
  // Navigate to next step with validation
  const nextStep = async () => {
    let canProceed = false;
    let data = null;
    
    switch (step) {
      case OnboardingSteps.PERSONAL_INFO:
        const personalResult = await personalInfoForm.trigger();
        if (personalResult) {
          data = personalInfoForm.getValues();
          
          // If user is not authenticated, create the account here
          if (!isAuthenticated) {
            setIsCreatingAccount(true);
            try {
              // Create user account
              const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
              });
              
              if (error) {
                toast.error("Account creation failed: " + error.message);
                setIsCreatingAccount(false);
                return;
              }
              
              // Log in the user
              await login(data.email, data.password);
              toast.success("Account created successfully!");
              
              canProceed = true;
            } catch (error) {
              toast.error("Error creating account: " + (error as any).message);
              setIsCreatingAccount(false);
              return;
            }
            
            setIsCreatingAccount(false);
          } else {
            canProceed = true;
          }
        }
        break;
        
      case OnboardingSteps.VISA_INFO:
        const visaResult = await visaInfoForm.trigger();
        if (visaResult) {
          data = visaInfoForm.getValues();
          canProceed = true;
        }
        break;
        
      case OnboardingSteps.EDUCATIONAL_INFO:
        // Skip if not needed based on visa type
        if (!shouldShowEducationStep()) {
          canProceed = true;
          break;
        }
        
        const educationalResult = await educationalInfoForm.trigger();
        if (educationalResult) {
          data = educationalInfoForm.getValues();
          canProceed = true;
        }
        break;
        
      case OnboardingSteps.SEVIS_INFO:
        // Skip if not needed based on visa type
        if (!shouldShowSEVISStep()) {
          canProceed = true;
          break;
        }
        
        const sevisResult = await sevisInfoForm.trigger();
        if (sevisResult) {
          data = sevisInfoForm.getValues();
          canProceed = true;
        }
        break;
        
      case OnboardingSteps.EMPLOYMENT_INFO:
        const employmentResult = await employmentInfoForm.trigger();
        if (employmentResult) {
          data = employmentInfoForm.getValues();
          canProceed = true;
        }
        break;
        
      case OnboardingSteps.DOCUMENT_PREFERENCES:
        // Update document checklist in form
        preferencesForm.setValue("documentChecklist", documentChecklist);
        
        const preferencesResult = await preferencesForm.trigger();
        if (preferencesResult) {
          data = preferencesForm.getValues();
          canProceed = true;
        }
        break;
        
      case OnboardingSteps.TERMS:
        const termsResult = await termsForm.trigger();
        if (termsResult) {
          data = termsForm.getValues();
          canProceed = true;
        }
        break;
        
      case OnboardingSteps.COMPLETION:
        finishOnboarding();
        canProceed = false; // We're already handling navigation
        break;
    }
    
    if (canProceed) {
      // Update form data
      if (data) {
        setAllFormData(prev => ({ ...prev, ...data }));
      }
      
      // Determine next step with conditional logic
      let nextStep = step + 1;
      
      // Skip education step if not applicable
      if (nextStep === OnboardingSteps.EDUCATIONAL_INFO && !shouldShowEducationStep()) {
        nextStep++;
      }
      
      // Skip SEVIS step if not applicable
      if (nextStep === OnboardingSteps.SEVIS_INFO && !shouldShowSEVISStep()) {
        nextStep++;
      }
      
      setStep(nextStep);
    }
  };

  const prevStep = () => {
    let prevStep = step - 1;
    
    // Skip SEVIS step if not applicable when going back
    if (prevStep === OnboardingSteps.SEVIS_INFO && !shouldShowSEVISStep()) {
      prevStep--;
    }
    
    // Skip education step if not applicable when going back
    if (prevStep === OnboardingSteps.EDUCATIONAL_INFO && !shouldShowEducationStep()) {
      prevStep--;
    }
    
    if (prevStep >= OnboardingSteps.PERSONAL_INFO) {
      setStep(prevStep);
    }
  };

  // Function to generate tasks for the compliance checklist
  const generateComplianceTasks = async () => {
    try {
      // Create basic tasks for all users
      const tasks = [];
      const today = new Date();
      
      // Common task for all visa types
      tasks.push({
        title: "Complete Profile Setup",
        description: "Fill out all your profile information for better compliance tracking",
        due_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        is_completed: false,
        visa_type: allFormData.visaType,
      });
      
      // Visa-specific tasks
      if (allFormData.visaType === "F-1") {
        // F-1 specific tasks
        tasks.push({
          title: "Verify SEVIS Registration",
          description: "Ensure your SEVIS information is up-to-date for the current semester",
          due_date: allFormData.programStartDate || new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
          is_completed: false,
          visa_type: "F-1",
        });
        
        tasks.push({
          title: "Maintain Full-time Enrollment",
          description: "Verify you're enrolled in the required number of credit hours",
          due_date: allFormData.programStartDate || new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
          is_completed: false,
          visa_type: "F-1",
        });
        
        // Check for I-20 expiration
        if (allFormData.i20ExpirationDate) {
          const i20ExpirationDate = new Date(allFormData.i20ExpirationDate);
          const daysDiff = Math.floor((i20ExpirationDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
          
          if (daysDiff <= 90) {
            tasks.push({
              title: "I-20 Expiring Soon",
              description: "Your I-20 expires in less than 90 days. Contact your DSO to discuss renewal options.",
              due_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
              is_completed: false,
              visa_type: "F-1",
            });
          }
        }
        
        // OPT related tasks
        if (allFormData.employmentStatus === "OPT" || allFormData.employmentStatus === "STEM OPT Extension") {
          tasks.push({
            title: "OPT Employment Reporting",
            description: "Report your employment details to maintain valid OPT status",
            due_date: allFormData.optCptStartDate || new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
            is_completed: false,
            visa_type: "F-1",
          });
        }
        
        // STEM OPT specific
        if (allFormData.employmentStatus === "STEM OPT Extension") {
          tasks.push({
            title: "6-Month STEM OPT Validation",
            description: "Complete your 6-month validation report required for STEM OPT",
            due_date: allFormData.optCptStartDate 
              ? new Date(new Date(allFormData.optCptStartDate).getTime() + 180 * 24 * 60 * 60 * 1000)
              : new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000),
            is_completed: false,
            visa_type: "F-1",
          });
          
          tasks.push({
            title: "Annual I-983 Self-Evaluation",
            description: "Complete your annual self-evaluation as required by your I-983 form",
            due_date: allFormData.stemI983Date 
              ? new Date(new Date(allFormData.stemI983Date).getTime() + 365 * 24 * 60 * 60 * 1000)
              : new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000),
            is_completed: false,
            visa_type: "F-1",
          });
        }
      } else if (allFormData.visaType === "J-1") {
        // J-1 specific tasks
        tasks.push({
          title: "Health Insurance Verification",
          description: "Ensure your health insurance meets J-1 visa requirements",
          due_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
          is_completed: false,
          visa_type: "J-1",
        });
        
        tasks.push({
          title: "Submit J-1 Annual Report",
          description: "Complete your required annual reporting for J-1 visa status",
          due_date: allFormData.programStartDate 
            ? new Date(new Date(allFormData.programStartDate).getTime() + 365 * 24 * 60 * 60 * 1000)
            : new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000),
          is_completed: false,
          visa_type: "J-1",
        });
      } else if (allFormData.visaType === "H-1B") {
        // H-1B specific tasks
        tasks.push({
          title: "H-1B Status Verification",
          description: "Ensure your employer has filed all necessary documentation",
          due_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          is_completed: false,
          visa_type: "H-1B",
        });
        
        // If visa expiration is coming up
        if (allFormData.visaExpirationDate) {
          const visaExpirationDate = new Date(allFormData.visaExpirationDate);
          const daysDiff = Math.floor((visaExpirationDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
          
          if (daysDiff <= 180) {
            tasks.push({
              title: "H-1B Renewal Planning",
              description: "Start planning your H-1B renewal process with your employer",
              due_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
              is_completed: false,
              visa_type: "H-1B",
            });
          }
        }
      }
      
      // Insert the tasks into the database
      const { error } = await supabase
        .from('compliance_tasks')
        .insert(tasks);
      
      if (error) {
        console.error("Error creating compliance tasks:", error);
        toast.error("Failed to create compliance checklist");
      } else {
        toast.success("Personalized compliance checklist created");
      }
    } catch (error) {
      console.error("Error in generating tasks:", error);
      toast.error("Failed to generate compliance tasks");
    }
  };

  const finishOnboarding = async () => {
    try {
      // Prepare profile data for update
      const profileData = {
        name: `${allFormData.firstName} ${allFormData.lastName}`,
        country: allFormData.countryOfOrigin,
        visaType: allFormData.visaType as any,
        university: allFormData.university,
        courseStartDate: allFormData.programStartDate,
        usEntryDate: null, // We didn't collect this specifically
        employmentStartDate: allFormData.employmentStartDate,
        onboardingComplete: true,
      };
      
      // Update user profile
      updateProfile(profileData);
      
      // Generate compliance tasks
      await generateComplianceTasks();
      
      // Mark onboarding as complete
      completeOnboarding();
      
      toast.success("Setup complete! Welcome to neXed.");
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast.error("Failed to complete onboarding");
    }
  };
  
  // Add a previous SEVIS ID field
  const addPreviousSevisId = () => {
    const currentIds = sevisInfoForm.getValues("previousSevisIds") || [];
    sevisInfoForm.setValue("previousSevisIds", [...currentIds, ""]);
  };
  
  // Remove a previous SEVIS ID field
  const removePreviousSevisId = (index: number) => {
    const currentIds = sevisInfoForm.getValues("previousSevisIds") || [];
    sevisInfoForm.setValue("previousSevisIds", currentIds.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-md nexed-gradient" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to neXed</h1>
          <p className="text-gray-600">
            Let's set up your profile to provide a personalized experience for your visa and compliance needs.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {stepLabels.map((label, index) => {
              const stepNum = index + 1;
              return (
                <div
                  key={stepNum}
                  className={`flex flex-col items-center ${
                    stepNum !== 8 ? "w-1/7" : ""
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      step >= stepNum
                        ? "nexed-gradient text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > stepNum ? <CheckCircle2 size={20} /> : stepNum}
                  </div>
                  <div className="text-xs mt-2 text-center">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative flex items-center w-full mt-2">
            <div className="h-1 bg-gray-200 w-full absolute">
              <div
                className="h-1 nexed-gradient transition-all duration-500"
                style={{ width: `${((step - 1) / 7) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === OnboardingSteps.PERSONAL_INFO && "Create Your Account"}
              {step === OnboardingSteps.VISA_INFO && "Visa Information"}
              {step === OnboardingSteps.EDUCATIONAL_INFO && "Educational Information"}
              {step === OnboardingSteps.SEVIS_INFO && "SEVIS Information"}
              {step === OnboardingSteps.EMPLOYMENT_INFO && "Employment Information"}
              {step === OnboardingSteps.DOCUMENT_PREFERENCES && "Document & Notification Preferences"}
              {step === OnboardingSteps.TERMS && "Terms & Privacy"}
              {step === OnboardingSteps.COMPLETION && "Setup Complete!"}
            </CardTitle>
            {step === OnboardingSteps.VISA_INFO && (
              <CardDescription>
                Tell us about your visa status so we can provide personalized assistance
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {/* Step 1: Personal Information */}
            {step === OnboardingSteps.PERSONAL_INFO && (
              <Form {...personalInfoForm}>
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalInfoForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={personalInfoForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email address" 
                            {...field} 
                            disabled={!!currentUser} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!currentUser && (
                    <>
                      <FormField
                        control={personalInfoForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a strong password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Must be at least 8 characters with a number and special character
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalInfoForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </form>
              </Form>
            )}
            
            {/* Step 2: Visa Information */}
            {step === OnboardingSteps.VISA_INFO && (
              <Form {...visaInfoForm}>
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <FormField
                    control={visaInfoForm.control}
                    name="visaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Type</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setAllFormData(prev => ({...prev, visaType: value}));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visa type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="F-1">F-1 (Student)</SelectItem>
                            <SelectItem value="J-1">J-1 (Exchange Visitor)</SelectItem>
                            <SelectItem value="H-1B">H-1B (Work)</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {visaInfoForm.watch("visaType") === "Other" && (
                    <FormField
                      control={visaInfoForm.control}
                      name="otherVisaType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify Visa Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your visa type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={visaInfoForm.control}
                    name="countryOfOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Origin</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={visaInfoForm.control}
                    name="visaStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Visa Status</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setAllFormData(prev => ({...prev, visaStatus: value}));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your visa status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                            <SelectItem value="Not Yet Obtained">Not Yet Obtained</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {visaInfoForm.watch("visaStatus") === "Active" || visaInfoForm.watch("visaStatus") === "Expiring Soon" ? (
                    <FormField
                      control={visaInfoForm.control}
                      name="visaExpirationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Visa Expiration Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                  
                  {visaInfoForm.watch("visaStatus") === "Expired" && (
                    <div className="bg-red-50 p-4 rounded-md flex items-start">
                      <AlertTriangle className="text-red-500 mr-2 mt-1" />
                      <div>
                        <h4 className="font-medium text-red-800">Visa Status Alert</h4>
                        <p className="text-sm text-red-600">
                          Your visa has expired. You should contact an immigration attorney immediately 
                          to discuss your options. This app can help track documents and requirements,
                          but cannot provide legal advice for expired visa situations.
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            )}
            
            {/* Step 3: Educational Information */}
            {step === OnboardingSteps.EDUCATIONAL_INFO && (
              <Form {...educationalInfoForm}>
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <FormField
                    control={educationalInfoForm.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University/Institution Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your university name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isF1OrJ1() && (
                    <>
                      <FormField
                        control={educationalInfoForm.control}
                        name="programDegree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Program/Degree</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your program/degree" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                <SelectItem value="Master's">Master's</SelectItem>
                                <SelectItem value="PhD">PhD</SelectItem>
                                <SelectItem value="Certificate">Certificate</SelectItem>
                                <SelectItem value="Exchange Program">Exchange Program</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={educationalInfoForm.control}
                        name="fieldOfStudy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Major/Field of Study</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your field of study" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={educationalInfoForm.control}
                          name="programStartDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Program Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={educationalInfoForm.control}
                          name="programEndDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Expected Completion Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => 
                                      educationalInfoForm.watch("programStartDate") && 
                                      date <= educationalInfoForm.watch("programStartDate")
                                    }
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </form>
              </Form>
            )}
            
            {/* Step 4: SEVIS Information */}
            {step === OnboardingSteps.SEVIS_INFO && (
              <Form {...sevisInfoForm}>
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <FormField
                    control={sevisInfoForm.control}
                    name="sevisId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEVIS ID</FormLabel>
                        <FormControl>
                          <Input placeholder="N00XXXXXXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          Format: N00 followed by 8 digits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={sevisInfoForm.control}
                      name="i20IssueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            {allFormData.visaType === "F-1" ? "I-20 Issue Date" : "DS-2019 Issue Date"}
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={sevisInfoForm.control}
                      name="i20ExpirationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            {allFormData.visaType === "F-1" ? "I-20 Expiration Date" : "DS-2019 Expiration Date"}
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                          {field.value && new Date(field.value) < new Date(new Date().setDate(new Date().getDate() + 60)) && (
                            <div className="mt-2 p-2 bg-amber-50 text-amber-800 text-sm rounded-md flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Your {allFormData.visaType === "F-1" ? "I-20" : "DS-2019"} expires within 60 days. Contact your DSO soon!
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Previous SEVIS IDs (if any)</FormLabel>
                    <div className="space-y-2 mt-2">
                      {sevisInfoForm.watch("previousSevisIds")?.map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            placeholder="N00XXXXXXXX"
                            value={sevisInfoForm.watch(`previousSevisIds.${index}`)}
                            onChange={(e) => {
                              const newIds = [...sevisInfoForm.getValues("previousSevisIds")];
                              newIds[index] = e.target.value;
                              sevisInfoForm.setValue("previousSevisIds", newIds);
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removePreviousSevisId(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addPreviousSevisId}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Previous SEVIS ID
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
            
            {/* Step 5: Employment Information */}
            {step === OnboardingSteps.EMPLOYMENT_INFO && (
              <Form {...employmentInfoForm}>
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <FormField
                    control={employmentInfoForm.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Employment Status</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setAllFormData(prev => ({...prev, employmentStatus: value}));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your employment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Not Employed">Not Employed</SelectItem>
                            {isF1OrJ1() && <SelectItem value="On-Campus Employment">On-Campus Employment</SelectItem>}
                            {allFormData.visaType === "F-1" && <SelectItem value="CPT">CPT (Curricular Practical Training)</SelectItem>}
                            {allFormData.visaType === "F-1" && <SelectItem value="OPT">OPT (Optional Practical Training)</SelectItem>}
                            {allFormData.visaType === "F-1" && <SelectItem value="STEM OPT Extension">STEM OPT Extension</SelectItem>}
                            <SelectItem value="H-1B">H-1B</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isEmployed() && (
                    <>
                      <FormField
                        control={employmentInfoForm.control}
                        name="employerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your employer name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={employmentInfoForm.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position/Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your job title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={employmentInfoForm.control}
                          name="employmentStartDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Employment Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={employmentInfoForm.control}
                          name="employmentEndDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Employment End Date (if applicable)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => 
                                      employmentInfoForm.watch("employmentStartDate") && 
                                      date <= employmentInfoForm.watch("employmentStartDate")
                                    }
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                  
                  {isOptOrCpt() && (
                    <>
                      <FormField
                        control={employmentInfoForm.control}
                        name="isFieldRelated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                This position is related to my field of study
                              </FormLabel>
                              <FormDescription>
                                CPT/OPT employment must be directly related to your major field of study
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={employmentInfoForm.control}
                          name="optCptStartDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                {allFormData.employmentStatus === "CPT" 
                                  ? "CPT Authorization Start Date" 
                                  : "OPT Authorization Start Date"}
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={employmentInfoForm.control}
                          name="optCptEndDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                {allFormData.employmentStatus === "CPT" 
                                  ? "CPT Authorization End Date" 
                                  : "OPT Authorization End Date"}
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => 
                                      employmentInfoForm.watch("optCptStartDate") && 
                                      date <= employmentInfoForm.watch("optCptStartDate")
                                    }
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {(allFormData.employmentStatus === "OPT" || allFormData.employmentStatus === "STEM OPT Extension") && (
                        <FormField
                          control={employmentInfoForm.control}
                          name="eadNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>EAD Card Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your EAD card number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                  
                  {isStemOpt() && (
                    <>
                      <FormField
                        control={employmentInfoForm.control}
                        name="stemEVerify"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer E-Verify Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter employer's E-Verify number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={employmentInfoForm.control}
                        name="stemI983Date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>I-983 Training Plan Submission Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </form>
              </Form>
            )}
            
            {/* Step 6: Document Upload Preparedness */}
            {step === OnboardingSteps.DOCUMENT_PREFERENCES && (
              <Form {...preferencesForm}>
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <FormField
                    control={preferencesForm.control}
                    name="documentChecklist"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Required Documents</FormLabel>
                          <FormDescription>
                            Based on your visa type and status, you will need to upload the following documents.
                            Check each to acknowledge:
                          </FormDescription>
                        </div>
                        <div className="space-y-2">
                          {documentChecklist.map((document) => (
                            <FormField
                              key={document}
                              control={preferencesForm.control}
                              name="documentChecklist"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={document}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(document)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, document])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== document
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {document}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={preferencesForm.control}
                    name="notificationPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Notification Preferences</FormLabel>
                          <FormDescription>
                            Select how you'd like to be notified about important deadlines and updates:
                          </FormDescription>
                        </div>
                        <div className="space-y-2">
                          {[
                            {id: "Email", label: "Email", icon: <Mail className="h-4 w-4 mr-2" />},
                            {id: "SMS", label: "SMS (Coming soon)", icon: <MessageSquare className="h-4 w-4 mr-2" />},
                            {id: "In-app", label: "In-app", icon: <Bell className="h-4 w-4 mr-2" />},
                          ].map((item) => (
                            <FormField
                              key={item.id}
                              control={preferencesForm.control}
                              name="notificationPreferences"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                        disabled={item.id === "SMS"} // SMS not yet available
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center">
                                      {item.icon}
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={preferencesForm.control}
                    name="communicationFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Frequency</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Only for urgent matters">Only for urgent matters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {preferencesForm.watch("communicationFrequency") === "Only for urgent matters" && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800">Urgent matters include:</h4>
                      <ul className="text-sm text-blue-700 list-disc list-inside mt-2">
                        <li>Document expiration within 30 days</li>
                        <li>Missed compliance deadlines</li>
                        <li>Status violations requiring immediate attention</li>
                        <li>Important regulatory changes affecting your visa status</li>
                      </ul>
                    </div>
                  )}
                </form>
              </Form>
            )}
            
            {/* Step 7: Terms and Privacy */}
            {step === OnboardingSteps.TERMS && (
              <Form {...termsForm}>
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <FormField
                    control={termsForm.control}
                    name="termsOfService"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the Terms of Service
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you agree to our <a href="#" className="text-nexed-600 underline">Terms of Service</a>
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={termsForm.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the Privacy Policy
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you agree to our <a href="#" className="text-nexed-600 underline">Privacy Policy</a>
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={termsForm.control}
                    name="dataUsage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I allow my anonymized data to be used to improve services
                          </FormLabel>
                          <FormDescription>
                            This is optional. We use anonymized data to improve our recommendations.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={termsForm.control}
                    name="legalDisclaimer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I acknowledge this platform does not provide legal advice
                          </FormLabel>
                          <FormDescription>
                            neXed helps manage documentation and compliance but is not a substitute for professional legal advice.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
            
            {/* Step 8: Completion */}
            {step === OnboardingSteps.COMPLETION && (
              <div className="text-center py-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Profile Setup Complete!</h3>
                <p className="text-gray-600 mb-6">
                  We've personalized your experience based on your visa type and details. Your personalized compliance checklist has been created and you're now ready to start managing your documents.
                </p>
                <div className="bg-nexed-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-nexed-700 mb-2">Your Next Steps:</h4>
                  <ol className="text-left text-nexed-600 list-decimal list-inside space-y-2">
                    <li>Upload your required documents</li>
                    <li>Review your compliance checklist</li>
                    <li>Set up calendar reminders for important dates</li>
                    <li>Explore your personalized dashboard</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === OnboardingSteps.PERSONAL_INFO}
                type="button"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="nexed-gradient"
                disabled={isCreatingAccount}
                type="button"
              >
                {isCreatingAccount ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {step === OnboardingSteps.COMPLETION ? "Go to Dashboard" : "Continue"} 
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
