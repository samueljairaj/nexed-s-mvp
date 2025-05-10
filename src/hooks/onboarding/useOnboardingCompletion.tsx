
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useOnboardingCompletion() {
  const { completeOnboarding, isDSO } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Call completeOnboarding() without checking its return value
      await completeOnboarding();
      
      // Assume success if no error was thrown
      toast.success("Onboarding completed successfully!");
      
      // Navigate to appropriate dashboard based on user role
      setTimeout(() => {
        navigate(isDSO ? "/app/dso-dashboard" : "/app/dashboard");
      }, 1500);
      
      return true;
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error("Error completing onboarding:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleFinish,
    isSubmitting
  };
}
