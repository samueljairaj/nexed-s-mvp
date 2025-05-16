
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VisaStatusFormValues, VisaType } from "@/types/onboarding";
import { dateUtils } from "@/lib/date-utils";

export function useVisaStatus() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visaData, setVisaData] = useState<Partial<VisaStatusFormValues>>({
    visaType: VisaType.F1,
    visaStatus: "",
    sevisId: "",
    i94Number: "",
    entryDate: undefined,
    visaExpiryDate: undefined,
    hadUnemploymentPeriods: false,
    totalUnemployedDays: ""
  });

  const handleVisaStatus = async (data: VisaStatusFormValues) => {
    // Store the full data in the component state
    setVisaData(data);
    setIsSubmitting(true);
    
    try {
      // Format data using camelCase for the userProfile object
      const formattedData: Record<string, any> = {
        visaType: data.visaType,
        visaStatus: data.visaStatus,
        sevisId: data.sevisId,
        i94Number: data.i94Number
      };

      // Add other visa type if applicable
      if (data.visaType === "Other" && data.otherVisaType) {
        formattedData.otherVisaType = data.otherVisaType;
      }
      
      // Format dates as YYYY-MM-DD strings
      if (data.entryDate) {
        formattedData.usEntryDate = dateUtils.formatToYYYYMMDD(data.entryDate);
      }
      
      if (data.programStartDate) {
        formattedData.courseStartDate = dateUtils.formatToYYYYMMDD(data.programStartDate);
      }
      
      if (data.visaExpiryDate) {
        formattedData.visaExpiryDate = dateUtils.formatToYYYYMMDD(data.visaExpiryDate);
      }

      if (data.i20ExpiryDate) {
        formattedData.i20ExpiryDate = dateUtils.formatToYYYYMMDD(data.i20ExpiryDate);
      }

      // Add unemployment information if applicable
      if (data.hadUnemploymentPeriods) {
        formattedData.hadUnemploymentPeriods = data.hadUnemploymentPeriods;
        formattedData.totalUnemployedDays = data.totalUnemployedDays;
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
      visaType: visaType as VisaType
    }));
  };

  // Check if visa type is F1 or J1
  const isF1OrJ1 = () => {
    return visaData.visaType === "F1" || visaData.visaType === "J1";
  };

  return {
    visaData,
    setVisaData,
    handleVisaStatus,
    handleVisaTypeChange,
    isSubmitting,
    isF1OrJ1
  };
}
