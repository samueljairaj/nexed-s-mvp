
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateMockTasks } from "@/utils/mockTasks";
import { DocumentCategory } from "@/types/document";

// Type for database-accepted visa types
type DatabaseVisaType = "F1" | "OPT" | "H1B" | "Other";

export function useOnboardingCompletion() {
  const { completeOnboarding, isDSO, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Helper function to normalize visa types for database compatibility
  const normalizeVisaType = (visaType: string | undefined): DatabaseVisaType => {
    if (visaType === "F1") return "F1";
    if (visaType === "J1") return "Other"; // Map J1 to Other as it's not in DatabaseVisaType
    if (visaType === "H1B") return "H1B";
    return "Other";
  };

  // Save personalized compliance tasks to database
  const saveTasksToDatabase = async (userId: string, visaType: string): Promise<void> => {
    try {
      // Generate appropriate tasks based on visa type
      const tasks = generateMockTasks(visaType);
      
      // Normalize the visa type for database compatibility
      const normalizedVisaType = normalizeVisaType(visaType);
      
      // Transform tasks to database format
      const dbTasks = tasks.map(task => ({
        user_id: userId,
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        is_completed: task.completed,
        category: task.category as string, // Cast to string to match database type
        phase: task.phase || 'general',
        priority: task.priority,
        visa_type: normalizedVisaType
      }));
      
      try {
        // Insert the tasks into the database
        const { error } = await supabase
          .from('compliance_tasks')
          .insert(dbTasks);
          
        if (error) {
          console.error('Error saving onboarding tasks to database:', error);
        } else {
          console.log('Successfully saved onboarding tasks to database');
        }
      } catch (dbError) {
        console.error('Failed to save tasks to database:', dbError);
      }
    } catch (error) {
      console.error('Failed to save onboarding tasks:', error);
    }
  };

  const handleFinish = async (): Promise<boolean> => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }
    
    setIsSubmitting(true);
    console.log("Starting onboarding completion process...");
    
    try {
      // Mark onboarding as complete in the database
      console.log("Calling completeOnboarding to update user profile in database");
      await completeOnboarding();
      
      // Generate and save tasks if user has data - do this asynchronously
      if (currentUser?.id && currentUser?.visaType) {
        console.log("Starting task creation for user:", currentUser.id);
        saveTasksToDatabase(currentUser.id, currentUser.visaType)
          .catch(err => console.error("Error saving tasks:", err));
      }
      
      // Success message
      toast.success("Onboarding completed successfully!");
      
      // Determine dashboard path based on user role
      const targetPath = isDSO ? "/app/dso-dashboard" : "/app/dashboard";
      console.log("Onboarding complete, navigating to:", targetPath);
      
      // Use replace to prevent back button from returning to onboarding
      navigate(targetPath, { replace: true });
      
      return true;
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error("Error completing onboarding:", error);
      setIsSubmitting(false);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return user data for the compliance checklist
  const getUserDataForCompliance = () => {
    return {
      name: currentUser?.name || '',
      visaType: currentUser?.visaType || 'F1',
      university: currentUser?.university || '',
      fieldOfStudy: currentUser?.fieldOfStudy || '',
      employer: currentUser?.employerName || currentUser?.employer || ''
    };
  };

  return {
    handleFinish,
    isSubmitting,
    getUserDataForCompliance
  };
}
