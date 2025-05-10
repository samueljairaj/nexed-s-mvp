
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useOnboardingCompletion() {
  const { completeOnboarding, isDSO, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Call completeOnboarding() without checking its return value
      await completeOnboarding();
      
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
