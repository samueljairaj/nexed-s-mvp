
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { OnboardingFormData, OnboardingSteps } from "@/types/onboarding";

const Onboarding = () => {
  const { updateProfile, completeOnboarding, currentUser, login, isAuthenticated } = useAuth();
  const [step, setStep] = useState(OnboardingSteps.PERSONAL_INFO);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // Form data for all steps
  const [allFormData, setAllFormData] = useState<OnboardingFormData>({
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
  const [documentChecklist, setDocumentChecklist] = useState<string[]>([]);

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
    switch (step) {
      case OnboardingSteps.PERSONAL_INFO:
        await handlePersonalInfoSubmit();
        break;
      case OnboardingSteps.VISA_INFO:
        await handleVisaInfoSubmit();
        break;
      case OnboardingSteps.EDUCATIONAL_INFO:
        if (!shouldShowEducationStep()) {
          goToNextStep();
          break;
        }
        await handleEducationalInfoSubmit();
        break;
      case OnboardingSteps.SEVIS_INFO:
        if (!shouldShowSEVISStep()) {
          goToNextStep();
          break;
        }
        await handleSevisInfoSubmit();
        break;
      case OnboardingSteps.EMPLOYMENT_INFO:
        await handleEmploymentInfoSubmit();
        break;
      case OnboardingSteps.DOCUMENT_PREFERENCES:
        await handleDocumentPreferencesSubmit();
        break;
      case OnboardingSteps.TERMS:
        await handleTermsSubmit();
        break;
      case OnboardingSteps.COMPLETION:
        finishOnboarding();
        break;
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

  const goToNextStep = () => {
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
  };

  // Step-specific handlers
  const handlePersonalInfoSubmit = async (data?: any) => {
    try {
      if (data) {
        setAllFormData(prev => ({ ...prev, ...data }));
      }

      // If user is not authenticated, create the account here
      if (!isAuthenticated) {
        setIsCreatingAccount(true);
        try {
          // Create user account
          const { data: authData, error } = await supabase.auth.signUp({
            email: allFormData.email,
            password: allFormData.password,
          });
          
          if (error) {
            toast.error("Account creation failed: " + error.message);
            setIsCreatingAccount(false);
            return;
          }
          
          // Log in the user
          await login(allFormData.email, allFormData.password);
          toast.success("Account created successfully!");
        } catch (error: any) {
          toast.error("Error creating account: " + error.message);
          setIsCreatingAccount(false);
          return;
        }
        
        setIsCreatingAccount(false);
      }
      
      goToNextStep();
    } catch (error) {
      console.error("Error in personal info step:", error);
    }
  };

  const handleVisaInfoSubmit = async (data?: any) => {
    if (data) {
      setAllFormData(prev => ({ ...prev, ...data }));
    }
    goToNextStep();
  };

  const handleEducationalInfoSubmit = async (data?: any) => {
    if (data) {
      setAllFormData(prev => ({ ...prev, ...data }));
    }
    goToNextStep();
  };

  const handleSevisInfoSubmit = async (data?: any) => {
    if (data) {
      setAllFormData(prev => ({ ...prev, ...data }));
    }
    goToNextStep();
  };

  const handleEmploymentInfoSubmit = async (data?: any) => {
    if (data) {
      setAllFormData(prev => ({ ...prev, ...data }));
    }
    goToNextStep();
  };

  const handleDocumentPreferencesSubmit = async (data?: any) => {
    if (data) {
      // Make sure we update the document checklist in the form data
      setAllFormData(prev => ({ 
        ...prev, 
        ...data,
        documentChecklist: documentChecklist 
      }));
    } else {
      // Just update the document checklist in the form data
      setAllFormData(prev => ({ 
        ...prev,
        documentChecklist: documentChecklist 
      }));
    }
    goToNextStep();
  };

  const handleTermsSubmit = async (data?: any) => {
    if (data) {
      setAllFormData(prev => ({ ...prev, ...data }));
    }
    goToNextStep();
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

  const handleVisaTypeChange = (value: string) => {
    setAllFormData(prev => ({...prev, visaType: value}));
  };

  const handleVisaStatusChange = (value: string) => {
    setAllFormData(prev => ({...prev, visaStatus: value}));
  };

  const handleEmploymentStatusChange = (value: string) => {
    setAllFormData(prev => ({...prev, employmentStatus: value}));
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
        <OnboardingProgress currentStep={step} />

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
              <div>
                <PersonalInfoStep 
                  defaultValues={{
                    firstName: allFormData.firstName,
                    lastName: allFormData.lastName,
                    email: allFormData.email,
                    password: allFormData.password,
                    confirmPassword: allFormData.confirmPassword,
                  }}
                  onSubmit={handlePersonalInfoSubmit}
                  isAuthenticated={!!currentUser}
                />
                <StepNavigation 
                  currentStep={step}
                  isFirstStep={step === OnboardingSteps.PERSONAL_INFO}
                  isLastStep={false}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  isSubmitting={isCreatingAccount}
                />
              </div>
            )}
            
            {/* Step 2: Visa Information */}
            {step === OnboardingSteps.VISA_INFO && (
              <div>
                <VisaInfoStep
                  defaultValues={{
                    visaType: allFormData.visaType as any || undefined,
                    otherVisaType: allFormData.otherVisaType,
                    countryOfOrigin: allFormData.countryOfOrigin,
                    visaStatus: allFormData.visaStatus as any || undefined,
                    visaExpirationDate: allFormData.visaExpirationDate,
                  }}
                  onSubmit={handleVisaInfoSubmit}
                  onVisaTypeChange={handleVisaTypeChange}
                  onVisaStatusChange={handleVisaStatusChange}
                />
                <StepNavigation 
                  currentStep={step}
                  isFirstStep={false}
                  isLastStep={false}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  isSubmitting={false}
                />
              </div>
            )}
            
            {/* Step 3: Educational Information */}
            {step === OnboardingSteps.EDUCATIONAL_INFO && (
              <div>
                <EducationalInfoStep
                  defaultValues={{
                    university: allFormData.university,
                    programDegree: allFormData.programDegree as any || undefined,
                    fieldOfStudy: allFormData.fieldOfStudy,
                    programStartDate: allFormData.programStartDate,
                    programEndDate: allFormData.programEndDate,
                  }}
                  onSubmit={handleEducationalInfoSubmit}
                  isF1OrJ1={isF1OrJ1()}
                />
                <StepNavigation 
                  currentStep={step}
                  isFirstStep={false}
                  isLastStep={false}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  isSubmitting={false}
                />
              </div>
            )}
            
            {/* Step 4: SEVIS Information */}
            {step === OnboardingSteps.SEVIS_INFO && (
              <div>
                <SevisInfoStep
                  defaultValues={{
                    sevisId: allFormData.sevisId,
                    i20IssueDate: allFormData.i20IssueDate,
                    i20ExpirationDate: allFormData.i20ExpirationDate,
                    previousSevisIds: allFormData.previousSevisIds,
                  }}
                  onSubmit={handleSevisInfoSubmit}
                  visaType={allFormData.visaType}
                />
                <StepNavigation 
                  currentStep={step}
                  isFirstStep={false}
                  isLastStep={false}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  isSubmitting={false}
                />
              </div>
            )}
            
            {/* Step 5: Employment Information */}
            {step === OnboardingSteps.EMPLOYMENT_INFO && (
              <div>
                <EmploymentInfoStep
                  defaultValues={{
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
                  }}
                  onSubmit={handleEmploymentInfoSubmit}
                  visaType={allFormData.visaType}
                  onEmploymentStatusChange={handleEmploymentStatusChange}
                  isF1OrJ1={isF1OrJ1}
                  isEmployed={isEmployed}
                  isOptOrCpt={isOptOrCpt}
                  isStemOpt={isStemOpt}
                />
                <StepNavigation 
                  currentStep={step}
                  isFirstStep={false}
                  isLastStep={false}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  isSubmitting={false}
                />
              </div>
            )}
            
            {/* Step 6: Document Upload Preparedness */}
            {step === OnboardingSteps.DOCUMENT_PREFERENCES && (
              <div>
                <DocumentPreferencesStep
                  defaultValues={{
                    documentChecklist: allFormData.documentChecklist,
                    notificationPreferences: allFormData.notificationPreferences,
                    communicationFrequency: allFormData.communicationFrequency as any,
                  }}
                  documentChecklist={documentChecklist}
                  onSubmit={handleDocumentPreferencesSubmit}
                />
                <StepNavigation 
                  currentStep={step}
                  isFirstStep={false}
                  isLastStep={false}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  isSubmitting={false}
                />
              </div>
            )}
            
            {/* Step 7: Terms and Privacy */}
            {step === OnboardingSteps.TERMS && (
              <div>
                <TermsStep
                  defaultValues={{
                    termsOfService: allFormData.termsOfService,
                    privacyPolicy: allFormData.privacyPolicy,
                    dataUsage: allFormData.dataUsage,
                    legalDisclaimer: allFormData.legalDisclaimer,
                  }}
                  onSubmit={handleTermsSubmit}
                />
                <StepNavigation 
                  currentStep={step}
                  isFirstStep={false}
                  isLastStep={false}
                  onNext={nextStep}
                  onPrevious={prevStep}
                  isSubmitting={false}
                />
              </div>
            )}
            
            {/* Step 8: Completion */}
            {step === OnboardingSteps.COMPLETION && (
              <CompletionStep onFinish={finishOnboarding} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
