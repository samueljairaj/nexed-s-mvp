
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DsoProfileFormData } from "@/components/onboarding/DsoProfileStep";
import { supabase } from "@/integrations/supabase/client";

export function useDsoOnboarding() {
  const { updateDSOProfile, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionTimeoutId, setSubmissionTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [dsoProfileData, setDsoProfileData] = useState<Partial<DsoProfileFormData>>({
    title: "",
    department: "",
    officeLocation: "",
    officeHours: "",
    contactEmail: currentUser?.email || "",
    contactPhone: ""
  });

  // Improved function that handles submission state, multiple timeouts and better error handling
  const handleDsoProfileSetup = async (data: DsoProfileFormData): Promise<boolean> => {
    // If already submitting, prevent duplicate submissions
    if (isSubmitting) {
      console.log("Already submitting DSO profile, please wait");
      toast.info("Already submitting your profile. Please wait a moment...");
      return false;
    }
    
    // Clear any existing timeout
    if (submissionTimeoutId) {
      clearTimeout(submissionTimeoutId);
    }
    
    setDsoProfileData(data);
    setIsSubmitting(true);
    
    console.log("Updating DSO profile with data:", data);
    
    // Create a promise that will automatically resolve/reject after a timeout
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      const timeoutId = setTimeout(() => {
        console.log("DSO profile submission timed out, resetting state");
        reject(new Error("Profile update timed out. Please try again."));
      }, 12000); // 12 second timeout
      
      setSubmissionTimeoutId(timeoutId);
    });
    
    try {
      // Create a promise for the actual update
      const updatePromise = new Promise<boolean>(async (resolve, reject) => {
        try {
          // Update DSO profile in the database
          await updateDSOProfile({
            title: data.title,
            department: data.department,
            office_location: data.officeLocation,
            office_hours: data.officeHours,
            contact_email: data.contactEmail,
            contact_phone: data.contactPhone
          });
          
          console.log("DSO profile updated successfully");
          resolve(true);
        } catch (error) {
          console.error("Failed to update DSO profile in updatePromise:", error);
          reject(error);
        }
      });
      
      // Race the promises
      const result = await Promise.race([updatePromise, timeoutPromise]);
      
      // Clear the timeout if update was successful
      if (submissionTimeoutId) {
        clearTimeout(submissionTimeoutId);
        setSubmissionTimeoutId(null);
      }
      
      toast.success("DSO profile updated successfully");
      return result;
    } catch (error: any) {
      console.error("Failed to update DSO profile:", error);
      
      // Clear the timeout
      if (submissionTimeoutId) {
        clearTimeout(submissionTimeoutId);
        setSubmissionTimeoutId(null);
      }
      
      // Show meaningful error message
      if (error.message.includes("timed out")) {
        toast.error("Profile update timed out. Please check your connection and try again.");
      } else {
        toast.error(`Failed to update profile: ${error.message || "Unknown error"}`);
      }
      
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
