
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DsoProfileFormData } from "@/components/onboarding/DsoProfileStep";
import { supabase } from "@/integrations/supabase/client";

export function useDsoOnboarding() {
  const { updateDSOProfile, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dsoProfileData, setDsoProfileData] = useState<Partial<DsoProfileFormData>>({
    title: "",
    department: "",
    officeLocation: "",
    officeHours: "",
    contactEmail: currentUser?.email || "",
    contactPhone: ""
  });

  // Simplified version that handles submission with better error recovery
  const handleDsoProfileSetup = async (data: DsoProfileFormData): Promise<boolean> => {
    // If already submitting, prevent duplicate submissions
    if (isSubmitting) {
      console.log("Already submitting DSO profile, please wait");
      toast.info("Already submitting your profile. Please wait a moment...");
      return false;
    }
    
    setDsoProfileData(data);
    setIsSubmitting(true);
    
    console.log("Updating DSO profile with data:", data);
    
    try {
      if (!currentUser?.id) {
        console.error("No current user ID found");
        toast.error("User session not found. Please try logging out and back in.");
        return false;
      }

      // Direct Supabase approach to avoid potential issues
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
      
      // First check if DSO profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('dso_profiles')
        .select('id')
        .eq('id', currentUser.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking DSO profile existence:", checkError);
        toast.error("Error checking your profile. Please try again.");
        return false;
      }
      
      let updateResult;
      
      if (!existingProfile) {
        // Create profile if it doesn't exist
        console.log("No DSO profile found, creating one");
        updateResult = await supabase
          .from('dso_profiles')
          .insert(profileData);
      } else {
        // Update existing profile
        console.log("Updating existing DSO profile");
        updateResult = await supabase
          .from('dso_profiles')
          .update(profileData)
          .eq('id', currentUser.id);
      }
      
      if (updateResult.error) {
        console.error("Failed to update DSO profile:", updateResult.error);
        toast.error(`Failed to update profile: ${updateResult.error.message || "Unknown error"}`);
        return false;
      }
      
      console.log("DSO profile updated successfully");
      toast.success("DSO profile updated successfully");
      return true;
    } catch (error: any) {
      console.error("Failed to update DSO profile:", error);
      toast.error(`Failed to update profile: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      // Always reset the submission state
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
