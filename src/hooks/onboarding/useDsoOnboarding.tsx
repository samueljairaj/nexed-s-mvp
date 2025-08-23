
import { useState } from "react";
import { useAuth } from "@/contexts/auth-hooks";
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

  // Fix: Make sure this function returns a Promise<boolean>
  const handleDsoProfileSetup = async (data: DsoProfileFormData): Promise<boolean> => {
    setDsoProfileData(data);
    setIsSubmitting(true);
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
      
      toast.success("DSO profile updated successfully");
      return true;
    } catch (error: unknown) {
      console.error("Failed to update DSO profile:", error);
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
      return false;
    } finally {
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
