
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
      
      // Only include dates if they exist and convert to ISO strings for the database
      if (data.entryDate && data.entryDate instanceof Date) {
        formattedData.usEntryDate = data.entryDate.toISOString();
      } else if (data.entryDate && typeof data.entryDate === 'string') {
        formattedData.usEntryDate = data.entryDate;
      }
      
      if (data.programStartDate && data.programStartDate instanceof Date) {
        formattedData.courseStartDate = data.programStartDate.toISOString();
      } else if (data.programStartDate && typeof data.programStartDate === 'string') {
        formattedData.courseStartDate = data.programStartDate;
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
