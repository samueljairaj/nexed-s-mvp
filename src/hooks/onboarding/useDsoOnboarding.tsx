
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

  // Improved function that handles submission with better error handling
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
      // First, check if DSO profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('dso_profiles')
        .select('id')
        .eq('id', currentUser?.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking DSO profile existence:", checkError);
      }
      
      // If no DSO profile exists for the user, create one first
      if (!existingProfile && currentUser?.id) {
        console.log("No DSO profile found, creating one first");
        const { error: insertError } = await supabase
          .from('dso_profiles')
          .insert({
            id: currentUser.id,
            contact_email: currentUser.email
          });
          
        if (insertError) {
          console.error("Failed to create initial DSO profile:", insertError);
          toast.error("Failed to create your DSO profile. Please try again.");
          return false;
        }
      }
      
      // Now update the DSO profile
      await updateDSOProfile({
        title: data.title,
        department: data.department,
        office_location: data.officeLocation,
        office_hours: data.officeHours,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone
      });
      
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
