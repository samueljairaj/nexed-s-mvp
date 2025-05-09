
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DsoProfileFormData } from "@/components/onboarding/DsoProfileStep";

export function useDsoOnboarding() {
  const { updateDSOProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dsoProfileData, setDsoProfileData] = useState<Partial<DsoProfileFormData>>({
    title: "",
    department: "",
    officeLocation: "",
    officeHours: "",
    contactEmail: "",
    contactPhone: ""
  });

  // Fix: Make sure this function returns a Promise<boolean> and properly manages submission state
  const handleDsoProfileSetup = async (data: DsoProfileFormData): Promise<boolean> => {
    // If already submitting, prevent duplicate submissions
    if (isSubmitting) {
      console.log("Already submitting DSO profile, please wait");
      return false;
    }
    
    setDsoProfileData(data);
    setIsSubmitting(true);
    
    // Add timeout to auto-reset submission state
    const timeoutId = setTimeout(() => {
      console.log("DSO profile submission timed out, resetting state");
      setIsSubmitting(false);
    }, 8000);
    
    try {
      // Update DSO profile in the database
      await updateDSOProfile({
        title: data.title,
        department: data.department,
        officeLocation: data.officeLocation,
        officeHours: data.officeHours,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone
      });
      
      clearTimeout(timeoutId);
      toast.success("DSO profile updated successfully");
      return true;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Failed to update DSO profile:", error);
      toast.error(`Failed to update profile: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return {
    dsoProfileData,
    setDsoProfileData,
    handleDsoProfileSetup,
    isSubmitting
  };
}
