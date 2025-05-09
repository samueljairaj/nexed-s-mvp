
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useOnboardingCompletion() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Update profile with onboarding_complete = true
      await updateProfile({ onboarding_complete: true });
      
      // Assume success if no error was thrown
      toast.success("Onboarding completed successfully!");
      
      // Navigate to student dashboard
      setTimeout(() => {
        navigate("/app/dashboard");
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
