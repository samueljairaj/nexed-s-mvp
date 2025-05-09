
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DsoProfileFormData } from "@/components/onboarding/DsoProfileStep";
import { supabase } from "@/integrations/supabase/client";

export function useDsoOnboarding() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [dsoProfileData, setDsoProfileData] = useState<Partial<DsoProfileFormData>>({
    title: "",
    department: "",
    officeLocation: "",
    officeHours: "",
    contactEmail: currentUser?.email || "",
    contactPhone: ""
  });

  // Clear any hanging timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset error state when data changes
  useEffect(() => {
    if (submitError) {
      setSubmitError(null);
    }
  }, [dsoProfileData]);

  const handleDsoProfileSetup = async (data: DsoProfileFormData): Promise<boolean> => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      toast.info("Already submitting your profile. Please wait a moment...");
      return false;
    }
    
    // Reset error state
    setSubmitError(null);
    setDsoProfileData(data);
    setIsSubmitting(true);
    
    // Set up timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setSubmitError("Request timed out. Please try again.");
      toast.error("Operation timed out. Please try again.");
    }, 15000); // 15 seconds timeout
    
    try {
      if (!currentUser?.id) {
        const errorMsg = "User session not found. Please try logging out and back in.";
        console.error(errorMsg);
        toast.error(errorMsg);
        setSubmitError(errorMsg);
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
      const { error, data: responseData } = await supabase
        .from('dso_profiles')
        .upsert(profileData)
        .select();
      
      if (error) {
        console.error("Failed to update DSO profile:", error);
        
        // Provide more detailed error information
        let errorMessage = `Failed to update profile: ${error.message}`;
        if (error.code === "42501") {
          errorMessage = "Permission denied. You may not have rights to update this profile.";
        } else if (error.code === "23505") {
          errorMessage = "A profile with this information already exists.";
        } else if (error.code?.startsWith("23")) {
          errorMessage = "Database constraint violation. Please check your inputs.";
        }
        
        toast.error(errorMessage);
        setSubmitError(errorMessage);
        
        // Handle retries if needed
        if (retryCount < maxRetries) {
          toast.info("Retrying submission...");
          setRetryCount(prevCount => prevCount + 1);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Clear the current timeout before retrying
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          setIsSubmitting(false);
          return handleDsoProfileSetup(data);
        }
        
        return false;
      }
      
      console.log("DSO profile updated successfully:", responseData);
      toast.success("DSO profile updated successfully");
      return true;
    } catch (error: any) {
      console.error("Failed to update DSO profile:", error);
      const errorMessage = `Failed to update profile: ${error.message || "Unknown error"}`;
      toast.error(errorMessage);
      setSubmitError(errorMessage);
      return false;
    } finally {
      // Clear timeout and reset submission state
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsSubmitting(false);
    }
  };

  return {
    dsoProfileData,
    setDsoProfileData,
    handleDsoProfileSetup,
    isSubmitting,
    submitError,
    retryCount
  };
}
