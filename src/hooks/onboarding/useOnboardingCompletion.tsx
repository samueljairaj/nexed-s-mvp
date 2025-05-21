
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
  const saveTasksToDatabase = async (userId: string, visaType: string): Promise<boolean> => {
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
        // Insert the tasks with ON CONFLICT DO NOTHING to avoid errors
        const { error } = await supabase
          .from('compliance_tasks')
          .upsert(dbTasks, {
            onConflict: 'user_id,title,phase', 
            ignoreDuplicates: true
          });
          
        if (error) {
          console.error('Error saving onboarding tasks to database:', error);
          // Don't throw here, just log the error
        } else {
          console.log('Successfully saved onboarding tasks to database');
        }
      } catch (dbError) {
        console.error('Failed to save tasks to database:', dbError);
        // Don't throw here, allow the onboarding to complete anyway
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save onboarding tasks:', error);
      // Don't throw here, allow the onboarding to complete anyway
      return false;
    }
  };

  const handleFinish = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      console.log("Completing onboarding process...");
      
      // Call completeOnboarding() which marks the user's onboarding as complete
      const success = await completeOnboarding();
      if (!success) {
        throw new Error("Failed to complete onboarding");
      }
      
      // Generate and save tasks if user completed onboarding
      if (currentUser?.id && currentUser?.visaType) {
        console.log("Generating tasks for user:", currentUser.id, "with visa type:", currentUser.visaType);
        try {
          // Call saveTasksToDatabase without checking its return value
          await saveTasksToDatabase(currentUser.id, currentUser.visaType);
        } catch (taskError) {
          console.error("Error saving tasks, but continuing:", taskError);
          // Don't block the flow
        }
      }
      
      // Assume success if no error was thrown
      toast.success("Onboarding completed successfully!");
      
      // Navigate to the appropriate dashboard based on user role
      const targetPath = isDSO ? "/app/dso-dashboard" : "/app/dashboard";
      console.log("Redirecting to:", targetPath);
      
      // Use a slight delay to ensure state updates are complete
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 50);
      
      return true;
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error("Error completing onboarding:", error);
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
      employer: currentUser?.employerName || currentUser?.employer || '' // Both properties now exist in UserProfile
    };
  };

  return {
    handleFinish,
    isSubmitting,
    getUserDataForCompliance
  };
}
