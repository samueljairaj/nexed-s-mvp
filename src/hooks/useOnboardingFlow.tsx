
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
  const { currentUser, updateProfile, completeOnboarding, isDSO } = useAuth();
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
    setCurrentStep(prev => {
      // If on visa step and not F1/J1, skip academic
      if (prev === 2) {
        const visaType = formData.visa.visaType;
        if (visaType !== "F1" && visaType !== "J1") {
          console.log("Skipping academic step");
          return 4; // Skip to employment
        }
      }
      return prev + 1;
    });
  }, [formData.visa.visaType]);

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
  const handleAccountFormSubmit = useCallback((data: AccountCreationFormValues) => {
    setFormData(prev => ({ ...prev, account: data }));
    goToNextStep();
  }, [goToNextStep]);

  const handlePersonalFormSubmit = useCallback(async (data: PersonalInfoFormValues) => {
    setIsSubmitting(true);
    try {
      // Format dates for database
      const updateData: Record<string, any> = {
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
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast.error("Failed to save personal information");
    } finally {
      setIsSubmitting(false);
    }
  }, [goToNextStep, updateProfile]);

  const handleVisaFormSubmit = useCallback(async (data: VisaStatusFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare date fields for database
      const updateData: Record<string, any> = {
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
    } catch (error) {
      console.error("Error saving visa info:", error);
      toast.error("Failed to save visa information");
    } finally {
      setIsSubmitting(false);
    }
  }, [goToNextStep, updateProfile]);

  const handleAcademicFormSubmit = useCallback(async (data: AcademicInfoFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare date fields for database
      const updateData: Record<string, any> = {
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
    } catch (error) {
      console.error("Error saving academic info:", error);
      toast.error("Failed to save academic information");
    } finally {
      setIsSubmitting(false);
    }
  }, [goToNextStep, updateProfile]);

  const handleEmploymentFormSubmit = useCallback(async (data: EmploymentInfoFormValues) => {
    setIsSubmitting(true);
    try {
      const updateData: Record<string, any> = {};
      
      if (data.employmentStatus === "Employed") {
        updateData.employerName = data.employerName;
        
        if (data.employmentStartDate) {
          updateData.employmentStartDate = dateUtils.formatToYYYYMMDD(data.employmentStartDate);
        }
      }
      
      await updateProfile(updateData);
      
      // Update local state and proceed to completion
      setFormData(prev => ({ ...prev, employment: data }));
      goToNextStep();
    } catch (error) {
      console.error("Error saving employment info:", error);
      toast.error("Failed to save employment information");
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
      
      const dbTasks = tasks.map(task => ({
        user_id: userId,
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        is_completed: task.completed,
        category: task.category as string,
        phase: task.phase || 'general',
        priority: task.priority,
        visa_type: normalizedVisaType
      }));
      
      const { error } = await supabase
        .from('compliance_tasks')
        .upsert(dbTasks, {
          onConflict: 'user_id,title',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error('Error saving tasks to database:', error);
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
    
    // Set flag to prevent redirect loops during the process
    localStorage.setItem('onboarding_completion_in_progress', 'true');
    setIsSubmitting(true);
    
    try {
      // Mark onboarding as complete in the database
      await completeOnboarding();
      
      // Generate tasks if this is a student (not DSO)
      if (!isDSO && currentUser?.id && currentUser.visaType) {
        console.log("Creating tasks for student");
        await createPersonalizedTasks(currentUser.id, currentUser.visaType);
      }

      // Toast success
      toast.success("Onboarding completed successfully!");
      
      // Remove flag after completion
      localStorage.removeItem('onboarding_completion_in_progress');
      
      // Navigate to appropriate dashboard with replace to prevent back button issues
      const targetPath = isDSO ? "/app/dso-dashboard" : "/app/dashboard";
      console.log("Navigating to:", targetPath);
      
      // Add a small delay to ensure database updates are reflected
      setTimeout(() => {
        console.log("Performing delayed navigation");
        navigate(targetPath, { replace: true });
      }, 300);
      
      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
      
      // Clear flag on error
      localStorage.removeItem('onboarding_completion_in_progress');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [completeOnboarding, currentUser, isDSO, navigate]);

  // Calculate progress for progress bar
  const calculateProgress = useCallback(() => {
    const totalSteps = 5;
    return Math.round(((currentStep >= totalSteps ? totalSteps : currentStep) / totalSteps) * 100);
  }, [currentStep]);

  // Helper to determine if visa type is F1 or J1
  const isF1OrJ1 = useCallback(() => {
    return formData.visa.visaType === "F1" || formData.visa.visaType === "J1";
  }, [formData.visa.visaType]);

  // Helper to determine if user is employed
  const isEmployed = useCallback(() => {
    return formData.employment.employmentStatus === "Employed";
  }, [formData.employment.employmentStatus]);

  return {
    currentStep,
    isSubmitting,
    formData,
    isF1OrJ1,
    isEmployed,
    goToNextStep,
    goToPreviousStep,
    handleAccountFormSubmit,
    handlePersonalFormSubmit,
    handleVisaFormSubmit,
    handleAcademicFormSubmit,
    handleEmploymentFormSubmit,
    finishOnboarding,
    calculateProgress,
    setCurrentStep, // Expose for manual step control if needed
  };
}
