import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateMockTasks } from "@/utils/mockTasks";
import { dateUtils } from "@/lib/date-utils";
import type {
  AccountCreationFormValues, 
  PersonalInfoFormValues, 
  VisaStatusFormValues, 
  AcademicInfoFormValues,
  EmploymentInfoFormValues
} from "@/types/onboarding";

// Type for database-accepted visa types
type DatabaseVisaType = "F1" | "OPT" | "H1B" | "Other";

export function useOnboardingFlow() {
  const { currentUser, updateProfile, completeOnboarding, isDSO, signup } = useAuth();
  const navigate = useNavigate();
  
  // State for onboarding
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    account: {} as Partial<AccountCreationFormValues>,
    personal: {} as Partial<PersonalInfoFormValues>,
    visa: {} as Partial<VisaStatusFormValues>,
    academic: {} as Partial<AcademicInfoFormValues>,
    employment: {} as Partial<EmploymentInfoFormValues>,
  });

  // Debug logging
  useEffect(() => {
    console.log("Onboarding step:", currentStep);
  }, [currentStep]);

  // Clean up any lingering flags when component mounts or unmounts
  useEffect(() => {
    // If we're not in the final completion step, clean up any flags
    if (currentStep !== 5) {
      localStorage.removeItem('onboarding_completion_in_progress');
    }
    
    // Clean up on unmount
    return () => {
      localStorage.removeItem('onboarding_completion_in_progress');
    };
  }, [currentStep]);

  // Step management helpers
  const goToNextStep = useCallback(() => {
    console.log("Moving to next step");
    setCurrentStep(prev => prev + 1);
  }, []);

  const goToPreviousStep = useCallback(() => {
    console.log("Moving to previous step");
    setCurrentStep(prev => {
      // If on employment and not F1/J1, skip back to visa
      if (prev === 4) {
        const visaType = formData.visa.visaType;
        if (visaType !== "F1" && visaType !== "J1") {
          console.log("Skipping back from academic step");
          return 2; // Skip back to visa
        }
      }
      return prev - 1;
    });
  }, [formData.visa.visaType]);

  // Form submission handlers
  const handleAccountCreation = useCallback(async (data: AccountCreationFormValues) => {
    console.log("Handling account creation", data);
    setIsSubmitting(true);
    
    try {
      // Actually sign up the user  
      await signup(data.email, data.password);
      
      // Store form data
      setFormData(prev => ({ ...prev, account: data }));
      
      // Navigate to email verification page
      navigate('/verify-email', { 
        replace: true,
        state: { 
          email: data.email,
          continueOnboarding: true 
        }
      });
      
      toast.success("Account created! Please check your email to verify your account.");
      return true;
    } catch (error: Error | unknown) {
      console.error("Account creation error:", error);
      toast.error(`Failed to create account: ${(error as Error).message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, setIsSubmitting, signup]);

  const handlePersonalFormSubmit = useCallback(async (data: PersonalInfoFormValues) => {
    setIsSubmitting(true);
    try {
      // Format dates for database
      const updateData: Record<string, string | boolean | undefined> = {
        country: data.country,
        phone: data.phoneNumber,
        passportNumber: data.passportNumber,
        address: data.address,
      };
      
      if (data.dateOfBirth) {
        updateData.dateOfBirth = dateUtils.formatToYYYYMMDD(data.dateOfBirth);
      }

      if (data.passportExpiryDate) {
        updateData.passportExpiryDate = dateUtils.formatToYYYYMMDD(data.passportExpiryDate);
      }
      
      await updateProfile(updateData);
      
      // Update local state and proceed
      setFormData(prev => ({ ...prev, personal: data }));
      goToNextStep();
      return true;
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast.error("Failed to save personal information");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [goToNextStep, updateProfile]);

  const handleVisaFormSubmit = useCallback(async (data: VisaStatusFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare date fields for database
      const updateData: Record<string, string | boolean | undefined> = {
        visaType: data.visaType,
      };
      
      if (data.entryDate) {
        updateData.usEntryDate = dateUtils.formatToYYYYMMDD(data.entryDate);
      }

      if (data.visaExpiryDate) {
        updateData.visa_expiry_date = dateUtils.formatToYYYYMMDD(data.visaExpiryDate);
      }
      
      await updateProfile(updateData);
      
      // Update local state and proceed
      setFormData(prev => ({ ...prev, visa: data }));
      goToNextStep();
      return true;
    } catch (error) {
      console.error("Error saving visa info:", error);
      toast.error("Failed to save visa information");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [goToNextStep, updateProfile]);

  const handleAcademicFormSubmit = useCallback(async (data: AcademicInfoFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare date fields for database
      const updateData: Record<string, string | boolean | undefined> = {
        university: data.university,
        degreeLevel: data.degreeLevel,
        fieldOfStudy: data.fieldOfStudy,
        isSTEM: data.isSTEM || false,
      };
      
      if (data.programStartDate) {
        updateData.courseStartDate = dateUtils.formatToYYYYMMDD(data.programStartDate);
      }
      
      await updateProfile(updateData);
      
      // Update local state and proceed
      setFormData(prev => ({ ...prev, academic: data }));
      goToNextStep();
      return true;
    } catch (error) {
      console.error("Error saving academic info:", error);
      toast.error("Failed to save academic information");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [goToNextStep, updateProfile]);

  const handleEmploymentFormSubmit = useCallback(async (data: EmploymentInfoFormValues) => {
    setIsSubmitting(true);
    try {
      const updateData: Record<string, string | boolean | undefined> = {
        employment_status: data.employmentStatus,
      };
      
      if (data.employmentStatus === "Employed") {
        updateData.employer_name = data.employerName;
        updateData.job_title = data.jobTitle;
        
        if (data.employmentStartDate) {
          updateData.employment_start_date = dateUtils.formatToYYYYMMDD(data.employmentStartDate);
        }
        
        if (data.employmentEndDate) {
          updateData.employment_end_date = dateUtils.formatToYYYYMMDD(data.employmentEndDate);
        }

        // Add authorization data if provided
        if (data.authorizationType && data.authorizationType !== "None") {
          updateData.auth_type = data.authorizationType;
          
          if (data.authStartDate) {
            updateData.auth_start_date = dateUtils.formatToYYYYMMDD(data.authStartDate);
          }
          
          if (data.authEndDate) {
            updateData.auth_end_date = dateUtils.formatToYYYYMMDD(data.authEndDate);
          }
          
          if (data.eadNumber) {
            updateData.ead_number = data.eadNumber;
          }
          
          if (data.unemploymentDaysUsed) {
            updateData.unemployment_days = data.unemploymentDaysUsed;
          }
          
          if (data.authorizationType === "STEM OPT" && data.eVerifyNumber) {
            updateData.e_verify_number = data.eVerifyNumber;
          }
        }
      }
      
      console.log("Updating profile with employment data:", updateData);
      await updateProfile(updateData);
      
      setFormData(prev => ({
        ...prev,
        employment: data
      }));
      goToNextStep();
      return true;
    } catch (error) {
      console.error("Error saving employment info:", error);
      toast.error("Failed to save employment information");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [goToNextStep, updateProfile]);

  // Helper function for normalizing visa types
  const normalizeVisaType = (visaType: string | undefined): DatabaseVisaType => {
    if (visaType === "F1") return "F1";
    if (visaType === "J1") return "Other";
    if (visaType === "H1B") return "H1B";
    return "Other";
  };

  // Create personalized tasks based on visa type
  const createPersonalizedTasks = async (userId: string, visaType: string) => {
    try {
      const tasks = generateMockTasks(visaType);
      const normalizedVisaType = normalizeVisaType(visaType);

      // First, delete any existing tasks for this user
      const { error: deleteError } = await supabase
        .from('compliance_tasks')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing tasks:', deleteError);
        return false;
      }

      // Then insert the new tasks
      const dbTasks = tasks.map(task => ({
        user_id: userId,
        title: task.title,
        description: task.description,
        due_date: task.dueDate ? dateUtils.formatToYYYYMMDD(new Date(task.dueDate)) : dateUtils.formatToYYYYMMDD(new Date()),
        is_completed: task.completed,
        category: task.category as string,
        phase: task.phase || 'general',
        priority: task.priority,
        visa_type: normalizedVisaType,
        is_recurring: task.isRecurring || false,
        recurring_interval: task.recurringInterval
      }));

      const { error: insertError } = await supabase
        .from('compliance_tasks')
        .insert(dbTasks);

      if (insertError) {
        console.error('Error saving tasks to database:', insertError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to create tasks:', error);
      return false;
    }
  };

  // Final onboarding completion
  const finishOnboarding = useCallback(async () => {
    console.log("Starting onboarding completion process");
    
    localStorage.setItem('onboarding_completion_in_progress', 'true');
    setIsSubmitting(true);
    
    try {
      await completeOnboarding();
      
      if (!isDSO && currentUser?.id && currentUser.visaType) {
        console.log("Creating tasks for student");
        await createPersonalizedTasks(currentUser.id, currentUser.visaType);
      }

      toast.success("Onboarding completed successfully!");
      
      localStorage.removeItem('onboarding_completion_in_progress');
      
      // Set flag to show checklist on dashboard
      localStorage.setItem('show_onboarding_checklist', 'true');
      
      const targetPath = isDSO ? "/app/dso-dashboard" : "/app/dashboard";
      console.log("Navigating to:", targetPath);
      
      // Navigate with state to indicate we're coming from onboarding
      navigate(targetPath, { 
        replace: true, 
        state: { fromOnboarding: true }
      });
      
      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
      
      localStorage.removeItem('onboarding_completion_in_progress');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [completeOnboarding, currentUser, isDSO, navigate]);

  const calculateProgress = useCallback(() => {
    const totalSteps = 5;
    return Math.round(((currentStep >= totalSteps ? totalSteps : currentStep) / totalSteps) * 100);
  }, [currentStep]);

  const isF1OrJ1 = useCallback(() => {
    return formData.visa.visaType === "F1" || formData.visa.visaType === "J1";
  }, [formData.visa.visaType]);

  const isEmployed = formData.employment.employmentStatus === "Employed";
  const isOptOrCpt = false;
  const isStemOpt = false;

  const handleVisaTypeChange = useCallback((type: "F1" | "J1" | "H1B" | "Other") => {
    setFormData(prev => ({
      ...prev,
      visa: {
        ...prev.visa,
        visaType: type
      }
    }));
  }, []);
  
  const handleEmploymentStatusChange = useCallback((status: string) => {
    setFormData(prev => ({
      ...prev,
      employment: {
        ...prev.employment,
        employmentStatus: status as "Employed" | "Not Employed"
      }
    }));
  }, []);

  return {
    currentStep,
    isSubmitting,
    formData,
    isF1OrJ1,
    isEmployed,
    isOptOrCpt,
    isStemOpt,
    goToNextStep,
    goToPreviousStep,
    handleAccountCreation,
    handlePersonalFormSubmit,
    handleVisaFormSubmit,
    handleAcademicFormSubmit,
    handleEmploymentFormSubmit,
    handleVisaTypeChange,
    handleEmploymentStatusChange,
    finishOnboarding,
    calculateProgress,
    setCurrentStep,
  };
}
