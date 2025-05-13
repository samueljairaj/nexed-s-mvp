
import { useState } from "react";
import { useAuth, VisaType } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VisaStatusFormValues } from "@/types/onboarding";

export function useVisaStatus() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visaData, setVisaData] = useState<Partial<VisaStatusFormValues>>({
    visaType: "F1",
    visaStatus: ""
  });

  const handleVisaStatus = async (data: VisaStatusFormValues) => {
    // Store the full data in the component state
    setVisaData(data);
    setIsSubmitting(true);
    
    try {
      // Format data using camelCase for the userProfile object
      const formattedData: Record<string, any> = {
        visaType: data.visaType as VisaType,
      };
      
      // Format dates as YYYY-MM-DD strings
      if (data.entryDate) {
        formattedData.usEntryDate = formatDateToString(data.entryDate);
      }
      
      if (data.programStartDate) {
        formattedData.courseStartDate = formatDateToString(data.programStartDate);
      }
      
      // Add visa expiry date if available
      if (data.visaExpiryDate) {
        formattedData.visa_expiry_date = formatDateToString(data.visaExpiryDate);
      }
      
      console.log("Saving visa data to profile:", formattedData);
      
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

  // Helper function to safely format dates
  const formatDateToString = (date: Date | string): string => {
    if (typeof date === 'string') {
      return date;
    }
    
    try {
      // Format as YYYY-MM-DD manually
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      // Return today's date as fallback
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
  };

  return {
    visaData,
    setVisaData,
    handleVisaStatus,
    handleVisaTypeChange,
    isSubmitting
  };
}
