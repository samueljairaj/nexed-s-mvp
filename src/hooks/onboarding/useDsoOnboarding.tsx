
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DsoProfileFormData } from "@/components/onboarding/DsoProfileStep";
import { supabase } from "@/integrations/supabase/client";

export function useDsoOnboarding() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dsoProfileData, setDsoProfileData] = useState<Partial<DsoProfileFormData>>({
    title: "",
    department: "",
    officeLocation: "",
    officeHours: "",
    contactEmail: currentUser?.email || "",
    contactPhone: ""
  });

  const handleDsoProfileSetup = async (data: DsoProfileFormData): Promise<boolean> => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      toast.info("Already submitting your profile. Please wait a moment...");
      return false;
    }
    
    setDsoProfileData(data);
    setIsSubmitting(true);
    
    try {
      if (!currentUser?.id) {
        toast.error("User session not found. Please try logging out and back in.");
        return false;
      }

      // Format the profile data
      const profileData = {
        id: currentUser.id,
        title: data.title,
        department: data.department,
        office_location: data.officeLocation,
        office_hours: data.officeHours,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        updated_at: new Date().toISOString()
      };

      console.log("Updating DSO profile:", profileData);

      // Upsert the DSO profile (will insert or update)
      const { error } = await supabase
        .from('dso_profiles')
        .upsert(profileData);
      
      if (error) {
        console.error("Failed to update DSO profile:", error);
        toast.error(`Failed to update profile: ${error.message}`);
        return false;
      }
      
      toast.success("DSO profile updated successfully");
      return true;
    } catch (error: any) {
      console.error("Failed to update DSO profile:", error);
      toast.error(`Failed to update profile: ${error.message || "Unknown error"}`);
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
