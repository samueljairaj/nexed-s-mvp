
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateMockTasks } from "@/utils/mockTasks";

export function useOnboardingCompletion() {
  const { completeOnboarding, isDSO, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Save personalized compliance tasks to database
  const saveTasksToDatabase = async (userId: string, visaType: string) => {
    try {
      // Generate appropriate tasks based on visa type
      const tasks = generateMockTasks(visaType);
      
      // Transform tasks to database format
      const dbTasks = tasks.map(task => ({
        user_id: userId,
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        is_completed: task.completed,
        category: task.category,
        phase: task.phase || 'general',
        priority: task.priority,
        visa_type: visaType
      }));
      
      // Insert the tasks into the database
      const { error } = await supabase
        .from('compliance_tasks')
        .upsert(dbTasks, {
          onConflict: 'user_id, title, phase',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error('Error saving onboarding tasks to database:', error);
        throw error;
      }
      
      console.log('Successfully saved onboarding tasks to database');
      return true;
    } catch (error) {
      console.error('Failed to save onboarding tasks:', error);
      return false;
    }
  };

  const handleFinish = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Call completeOnboarding() without checking its return value
      await completeOnboarding();
      
      // Generate and save tasks if user completed onboarding
      if (currentUser?.id && currentUser?.visaType) {
        await saveTasksToDatabase(currentUser.id, currentUser.visaType);
      }
      
      // Assume success if no error was thrown
      toast.success("Onboarding completed successfully!");
      
      // Add a delay before navigation to ensure the compliance dialog appears
      setTimeout(() => {
        navigate(isDSO ? "/app/dso-dashboard" : "/app/dashboard");
      }, 2500); // Increased delay to give enough time for the checklist to appear
      
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
      // Get employer data in a safe way, with a fallback
      employer: ''  // This is just an empty string since the property doesn't exist on UserProfile
    };
  };

  return {
    handleFinish,
    isSubmitting,
    getUserDataForCompliance
  };
}
