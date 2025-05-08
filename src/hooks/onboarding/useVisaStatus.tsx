
import { useState } from "react";
import { useAuth, VisaType } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VisaStatusFormData } from "@/components/onboarding/VisaStatusStep";

export function useVisaStatus() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visaData, setVisaData] = useState<Partial<VisaStatusFormData>>({
    visaType: "F1",
    currentStatus: ""
  });

  const handleVisaStatus = async (data: VisaStatusFormData) => {
    // Store the full data in the component state
    setVisaData(data);
    setIsSubmitting(true);
    
    try {
      // Ensure we're using the correct property names that match the database schema
      const formattedData: any = {
        visaType: data.visaType as VisaType,
      };
      
      // Only include dates if they exist and ensure proper string conversion
      if (data.entryDate) {
        formattedData.usEntryDate = data.entryDate instanceof Date 
          ? data.entryDate.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
          : data.entryDate;  // If it's already a string
      }
      
      if (data.programStartDate) {
        formattedData.courseStartDate = data.programStartDate instanceof Date 
          ? data.programStartDate.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
          : data.programStartDate;  // If it's already a string
      }
      
      console.log("Attempting to update profile with visa data:", formattedData);
      
      // Update the user profile with the visa status information
      await updateProfile(formattedData);
      
      // Log what was saved to help with debugging
      console.log("Saved visa data:", formattedData);
      
      return true;
    } catch (error) {
      toast.error("Failed to save visa information");
      console.error("Visa update error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVisaTypeChange = (visaType: string) => {
    setVisaData(prev => ({ 
      ...prev, 
      visaType: visaType as "F1" | "J1" | "H1B" | "Other"
    }));
  };

  return {
    visaData,
    setVisaData,
    handleVisaStatus,
    handleVisaTypeChange,
    isSubmitting
  };
}
