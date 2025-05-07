import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { personalInfoSchema } from "@/types/onboarding";
import { toast } from "sonner";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { PersonalInfoStep } from "@/components/onboarding/PersonalInfoStep";
import { VisaInfoStep } from "@/components/onboarding/VisaInfoStep";
import { EducationalInfoStep } from "@/components/onboarding/EducationalInfoStep";
import { SevisInfoStep } from "@/components/onboarding/SevisInfoStep";
import { EmploymentInfoStep } from "@/components/onboarding/EmploymentInfoStep";
import { DocumentPreferencesStep } from "@/components/onboarding/DocumentPreferencesStep";
import { TermsStep } from "@/components/onboarding/TermsStep";
import { CompletionStep } from "@/components/onboarding/CompletionStep";
import { StepNavigation } from "@/components/onboarding/StepNavigation";

const Onboarding = () => {
  const { isAuthenticated, currentUser, updateProfile, signup, login, completeOnboarding, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This is used when we have multiple steps, to track progress
  const [currentStep, setCurrentStep] = useState(0);

  // Personal Info / Account Creation
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visa Information
  const [visaType, setVisaType] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [visaStatus, setVisaStatus] = useState("");
  const [visaExpiryDate, setVisaExpiryDate] = useState<Date | null>(null);
  const [otherVisaType, setOtherVisaType] = useState("");

  // Educational Information
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [major, setMajor] = useState("");
  const [programStartDate, setProgramStartDate] = useState<Date | null>(null);
  const [programEndDate, setProgramEndDate] = useState<Date | null>(null);

  // SEVIS Information
  const [sevisId, setSevisId] = useState("");
  const [i20IssueDate, setI20IssueDate] = useState<Date | null>(null);
  const [i20ExpiryDate, setI20ExpiryDate] = useState<Date | null>(null);
  const [previousSevisIds, setPreviousSevisIds] = useState<string[]>([]);

  // Employment Information
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [employer, setEmployer] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employmentStartDate, setEmploymentStartDate] = useState<Date | null>(null);
  const [employmentEndDate, setEmploymentEndDate] = useState<Date | null>(null);
  const [isRelatedToField, setIsRelatedToField] = useState<boolean | null>(null);
  const [optCptStartDate, setOptCptStartDate] = useState<Date | null>(null);
  const [optCptEndDate, setOptCptEndDate] = useState<Date | null>(null);
  const [eadCardNumber, setEadCardNumber] = useState("");
  const [stemEmployerEVerify, setStemEmployerEVerify] = useState("");
  const [stemI983Date, setStemI983Date] = useState<Date | null>(null);

  // Document Preferences
  const [documentChecklist, setDocumentChecklist] = useState<string[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<string[]>([]);
  const [communicationFrequency, setCommunicationFrequency] = useState("");

  // Terms and Privacy
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [allowDataUsage, setAllowDataUsage] = useState(false);
  const [acceptLegalDisclaimer, setAcceptLegalDisclaimer] = useState(false);

  // Used to show errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && currentUser?.onboardingComplete) {
      navigate("/app/dashboard");
    }
    
    // If user is already authenticated, pre-fill the fields
    if (isAuthenticated && currentUser) {
      setEmail(currentUser.email || "");
      setFirstName(currentUser.name?.split(" ")[0] || "");
      setLastName(currentUser.name?.split(" ")[1] || "");
      setCountry(currentUser.country || "");
      setVisaType(currentUser.visaType || null);
      setUniversity(currentUser.university || "");
      if (currentUser.courseStartDate) {
        setProgramStartDate(currentUser.courseStartDate);
      }
      if (currentUser.usEntryDate) {
        setVisaExpiryDate(currentUser.usEntryDate);
      }
      if (currentUser.employmentStartDate) {
        setEmploymentStartDate(currentUser.employmentStartDate);
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
      </div>
    );
  }

  const handleNextStep = async () => {
    setErrors({});
    let isValid = true;
    
    // Validation depending on current step
    if (currentStep === 0) {
      try {
        // Validate personal info step with Zod schema
        personalInfoSchema.parse({
          firstName,
          lastName,
          email,
          password: isAuthenticated ? "placeholder" : password,
          confirmPassword: isAuthenticated ? "placeholder" : confirmPassword,
        });
        
        // Create account if not authenticated
        if (!isAuthenticated) {
          setIsSubmitting(true);
          
          try {
            await signup(email, password);
            toast.success("Account created successfully. Please proceed with onboarding.");
            // Next step will happen after auth state updates and component re-renders
          } catch (error: any) {
            toast.error(`Account creation failed: ${error.message}`);
            setIsSubmitting(false);
            return;
          }
        } else {
          // Update the profile with name if authenticated
          await updateProfile({ 
            name: `${firstName} ${lastName}` 
          });
          
          setCurrentStep(currentStep + 1);
        }
      } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
          const newErrors: Record<string, string> = {};
          error.errors.forEach((err: any) => {
            const field = err.path[0];
            newErrors[field] = err.message;
          });
          setErrors(newErrors);
          isValid = false;
        }
      }
    } else if (currentStep === 1) {
      // Visa Information validation
      if (!visaType) {
        setErrors(prev => ({ ...prev, visaType: "Please select a visa type" }));
        isValid = false;
      }
      if (!country) {
        setErrors(prev => ({ ...prev, country: "Please enter your country of origin" }));
        isValid = false;
      }
      if (!visaStatus) {
        setErrors(prev => ({ ...prev, visaStatus: "Please select your current visa status" }));
        isValid = false;
      }
      if (visaStatus === "Active" && !visaExpiryDate) {
        setErrors(prev => ({ ...prev, visaExpiryDate: "Please enter your visa expiration date" }));
        isValid = false;
      }
      if (visaType === "Other" && !otherVisaType) {
        setErrors(prev => ({ ...prev, otherVisaType: "Please specify your visa type" }));
        isValid = false;
      }

      // Update profile data
      if (isValid) {
        setIsSubmitting(true);
        try {
          await updateProfile({
            visaType: visaType as any,
            country,
            // Save other visa-related fields as needed
          });
          setIsSubmitting(false);
        } catch (error) {
          console.error("Error updating profile:", error);
          toast.error("Failed to update visa information");
          setIsSubmitting(false);
          return;
        }
      }
    } else if (currentStep === 2) {
      // Educational Information validation - only required for certain visa types
      if ((visaType === "F-1" || visaType === "J-1")) {
        if (!university) {
          setErrors(prev => ({ ...prev, university: "Please enter your university/institution name" }));
          isValid = false;
        }
        if (!program) {
          setErrors(prev => ({ ...prev, program: "Please select your program/degree" }));
          isValid = false;
        }
        if (!major) {
          setErrors(prev => ({ ...prev, major: "Please enter your major/field of study" }));
          isValid = false;
        }
        if (!programStartDate) {
          setErrors(prev => ({ ...prev, programStartDate: "Please enter your program start date" }));
          isValid = false;
        }
        if (!programEndDate) {
          setErrors(prev => ({ ...prev, programEndDate: "Please enter your expected completion date" }));
          isValid = false;
        } else if (programStartDate && programEndDate && programEndDate < programStartDate) {
          setErrors(prev => ({ ...prev, programEndDate: "Completion date must be after program start date" }));
          isValid = false;
        }
      } else if (visaType === "H-1B") {
        // For H-1B, only institution is required
        if (!university) {
          setErrors(prev => ({ ...prev, university: "Please enter your institution name" }));
          isValid = false;
        }
      }

      // Update profile data
      if (isValid) {
        setIsSubmitting(true);
        try {
          await updateProfile({
            university,
            courseStartDate: programStartDate,
            // Save other education-related fields as needed
          });
          setIsSubmitting(false);
        } catch (error) {
          console.error("Error updating profile:", error);
          toast.error("Failed to update educational information");
          setIsSubmitting(false);
          return;
        }
      }
    } else if (currentStep === 3) {
      // SEVIS Information validation - only required for F-1 and J-1
      if (visaType === "F-1" || visaType === "J-1") {
        if (!sevisId || !/^N00\d{8}$/.test(sevisId)) {
          setErrors(prev => ({ ...prev, sevisId: "Please enter a valid SEVIS ID (format: N00########)" }));
          isValid = false;
        }
        if (!i20IssueDate) {
          setErrors(prev => ({ 
            ...prev, 
            i20IssueDate: `Please enter your ${visaType === "F-1" ? "I-20" : "DS-2019"} issue date` 
          }));
          isValid = false;
        }
        if (!i20ExpiryDate) {
          setErrors(prev => ({ 
            ...prev, 
            i20ExpiryDate: `Please enter your ${visaType === "F-1" ? "I-20" : "DS-2019"} expiration date` 
          }));
          isValid = false;
        } else if (i20ExpiryDate < new Date()) {
          setErrors(prev => ({ 
            ...prev, 
            i20ExpiryDate: `Your ${visaType === "F-1" ? "I-20" : "DS-2019"} has expired` 
          }));
          isValid = false;
        }
      }

      // For all other visa types, we skip validation since this step is optional
    } else if (currentStep === 4) {
      // Employment Information validation
      if (!employmentStatus) {
        setErrors(prev => ({ ...prev, employmentStatus: "Please select your current employment status" }));
        isValid = false;
      }

      // If employed, validate employment details
      if (employmentStatus && employmentStatus !== "Not Employed") {
        if (!employer) {
          setErrors(prev => ({ ...prev, employer: "Please enter your employer name" }));
          isValid = false;
        }
        if (!jobTitle) {
          setErrors(prev => ({ ...prev, jobTitle: "Please enter your position/job title" }));
          isValid = false;
        }
        if (!employmentStartDate) {
          setErrors(prev => ({ ...prev, employmentStartDate: "Please enter your employment start date" }));
          isValid = false;
        }

        // Validate employment end date if provided
        if (employmentEndDate && employmentStartDate && employmentEndDate < employmentStartDate) {
          setErrors(prev => ({ ...prev, employmentEndDate: "End date must be after start date" }));
          isValid = false;
        }

        // Validate fields related to field of study
        if ((employmentStatus === "CPT" || employmentStatus === "OPT") && isRelatedToField === null) {
          setErrors(prev => ({ 
            ...prev, 
            isRelatedToField: "Please indicate if this position is related to your field of study" 
          }));
          isValid = false;
        }

        // Validate CPT/OPT specific fields
        if (employmentStatus === "CPT" || employmentStatus === "OPT") {
          if (!optCptStartDate) {
            setErrors(prev => ({ 
              ...prev, 
              optCptStartDate: `Please enter your ${employmentStatus} authorization start date` 
            }));
            isValid = false;
          }
          if (!optCptEndDate) {
            setErrors(prev => ({ 
              ...prev, 
              optCptEndDate: `Please enter your ${employmentStatus} authorization end date` 
            }));
            isValid = false;
          }
          if (employmentStatus === "OPT" && !eadCardNumber) {
            setErrors(prev => ({ ...prev, eadCardNumber: "Please enter your EAD card number" }));
            isValid = false;
          }
        }

        // Validate STEM OPT Extension specific fields
        if (employmentStatus === "STEM OPT Extension") {
          if (!stemEmployerEVerify) {
            setErrors(prev => ({ ...prev, stemEmployerEVerify: "Please enter the employer E-Verify number" }));
            isValid = false;
          }
          if (!stemI983Date) {
            setErrors(prev => ({ ...prev, stemI983Date: "Please enter the I-983 training plan submission date" }));
            isValid = false;
          }
        }
      }

      // Update profile data
      if (isValid) {
        setIsSubmitting(true);
        try {
          await updateProfile({
            employmentStartDate,
            // Save other employment-related fields as needed
          });
          setIsSubmitting(false);
        } catch (error) {
          console.error("Error updating profile:", error);
          toast.error("Failed to update employment information");
          setIsSubmitting(false);
          return;
        }
      }
    } else if (currentStep === 5) {
      // Document Upload Preparedness validation
      if (documentChecklist.length === 0) {
        setErrors(prev => ({ ...prev, documentChecklist: "Please select at least one document" }));
        isValid = false;
      }
      if (notificationPreferences.length === 0) {
        setErrors(prev => ({ ...prev, notificationPreferences: "Please select at least one notification method" }));
        isValid = false;
      }
      if (!communicationFrequency) {
        setErrors(prev => ({ ...prev, communicationFrequency: "Please select your preferred communication frequency" }));
        isValid = false;
      }
    } else if (currentStep === 6) {
      // Terms and Privacy validation
      if (!acceptTerms) {
        setErrors(prev => ({ ...prev, acceptTerms: "You must accept the Terms of Service to proceed" }));
        isValid = false;
      }
      if (!acceptPrivacy) {
        setErrors(prev => ({ ...prev, acceptPrivacy: "You must acknowledge the Privacy Policy to proceed" }));
        isValid = false;
      }
      if (!acceptLegalDisclaimer) {
        setErrors(prev => ({ 
          ...prev, 
          acceptLegalDisclaimer: "You must acknowledge the Legal Advice Disclaimer to proceed" 
        }));
        isValid = false;
      }
    }

    // If valid, move to next step
    if (isValid && currentStep < 7 && currentStep !== 0) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      toast.success("Onboarding completed successfully!");
      // The navigation to dashboard will be handled by the completeOnboarding function
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total steps based on visa type
  const getTotalSteps = () => {
    if (!visaType) return 8; // Default to all steps
    if (visaType === "F-1" || visaType === "J-1") return 8; // All steps
    if (visaType === "H-1B") return 7; // Skip SEVIS
    return 7; // Others: Skip SEVIS
  };

  // Determine if we should skip a step based on visa type
  const shouldSkipStep = (stepIndex: number) => {
    if (stepIndex === 3) { // SEVIS step
      return !(visaType === "F-1" || visaType === "J-1");
    }
    return false;
  };

  // Determine if step is the first step (considering skipped steps)
  const isFirstStep = () => {
    return currentStep === 0;
  };

  // Determine if step is the last step before completion (considering skipped steps)
  const isLastStep = () => {
    return currentStep === 6 || (currentStep === 5 && shouldSkipStep(6)) || (currentStep === 7);
  };

  // Calculate the progress percentage
  const calculateProgress = () => {
    const totalSteps = getTotalSteps();
    // Add 1 because we're 0-indexed but want to show progress starting at step 1
    const stepNumber = currentStep + 1;
    return (stepNumber / totalSteps) * 100;
  };

  // Get step name for progress indicator
  const getStepName = (index: number) => {
    const stepNames = [
      "Personal Info",
      "Visa Info", 
      "Education", 
      "SEVIS", 
      "Employment", 
      "Documents", 
      "Terms",
      "Complete"
    ];
    return stepNames[index];
  };

  // Function to render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            defaultValues={{
              firstName,
              lastName,
              email,
              password,
              confirmPassword
            }}
            onSubmit={(data) => {
              setFirstName(data.firstName);
              setLastName(data.lastName);
              setEmail(data.email);
              setPassword(data.password);
              setConfirmPassword(data.confirmPassword);
              handleNextStep();
            }}
            isAuthenticated={isAuthenticated}
          />
        );
      case 1:
        return (
          <VisaInfoStep />
        );
      case 2:
        return (
          <EducationalInfoStep />
        );
      case 3:
        return (
          <SevisInfoStep />
        );
      case 4:
        return (
          <EmploymentInfoStep />
        );
      case 5:
        return (
          <DocumentPreferencesStep />
        );
      case 6:
        return (
          <TermsStep />
        );
      case 7:
        return (
          <CompletionStep
            onFinish={handleFinish}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md nexed-gradient" />
            <span className="ml-2 text-xl font-bold text-nexed-900">neXed</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome to neXed</h1>
            
            {/* Progress bar */}
            <OnboardingProgress 
              currentStep={currentStep}
              totalSteps={getTotalSteps()}
              progress={calculateProgress()}
              stepNames={Array(getTotalSteps()).fill(0).map((_, i) => getStepName(i))}
            />
            
            {/* Step content */}
            <div className="mt-8">
              {renderCurrentStep()}
            </div>
            
            {/* Navigation buttons */}
            {currentStep !== 7 && (
              <StepNavigation
                currentStep={currentStep}
                isFirstStep={isFirstStep()}
                isLastStep={isLastStep()}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
