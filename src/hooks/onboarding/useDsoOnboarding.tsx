
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

  const handleDsoProfileSetup = async (data: DsoProfileFormData) => {
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
    } catch (error: any) {
      console.error("Failed to update DSO profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
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
