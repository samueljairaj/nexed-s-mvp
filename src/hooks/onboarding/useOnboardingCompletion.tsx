
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useOnboardingCompletion() {
  const { completeOnboarding } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Mark onboarding as complete in the database
      const success = await completeOnboarding();
      if (success) {
        toast.success("Onboarding completed successfully!");
        // Navigate to dashboard after successful completion
        setTimeout(() => {
          navigate("/app/dashboard");
        }, 1500);
        return true;
      }
      return false;
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
