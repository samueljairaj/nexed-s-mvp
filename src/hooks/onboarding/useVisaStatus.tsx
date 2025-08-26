
import { useState } from "react";
import { useAuth } from "@/contexts/auth-hooks";
import { toast } from "sonner";
import { VisaStatusFormValues, VisaType } from "@/types/onboarding";
import { dateUtils } from "@/lib/date-utils";

export function useVisaStatus() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visaData, setVisaData] = useState<Partial<VisaStatusFormValues>>({
    visaType: "F1" as VisaType, // Fix: Use string literal instead of enum reference
    visaStatus: "",
    sevisId: "",
    i94Number: "",
    entryDate: undefined,
    visaExpiryDate: undefined,
    hadUnemploymentPeriods: false,
    totalUnemployedDays: ""
  });

  const handleVisaStatus = async (data: VisaStatusFormValues) => {
    try {
      console.log("Processing visa status data:", data);
      // Store the full data in the component state
      setVisaData(data);
      setIsSubmitting(true);
      
      // Format data using camelCase for the userProfile object
      const formattedData: Record<string, string | boolean | undefined> = {
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
      
      // Fix: Remove programStartDate reference or add it to VisaStatusFormValues type
      // if (data.programStartDate) {
      //   formattedData.courseStartDate = dateUtils.formatToYYYYMMDD(data.programStartDate);
      // }
      
      if (data.visaExpiryDate) {
        formattedData.visaExpiryDate = dateUtils.formatToYYYYMMDD(data.visaExpiryDate);
      }

      // Fix: Remove i20ExpiryDate reference or add it to VisaStatusFormValues type
      // if (data.i20ExpiryDate) {
      //   formattedData.i20ExpiryDate = dateUtils.formatToYYYYMMDD(data.i20ExpiryDate);
      // }

      // Add unemployment information if applicable
      if (data.hadUnemploymentPeriods) {
        formattedData.hadUnemploymentPeriods = data.hadUnemploymentPeriods;
        formattedData.totalUnemployedDays = data.totalUnemployedDays;
      }
      
      console.log("Saving visa data to profile:", formattedData);
      
      // Update the user profile with the visa status information
      await updateProfile(formattedData);
      toast.success("Visa information saved successfully");
      
      // Log what was saved to help with debugging
      console.log("Saved visa data:", formattedData);
      
      return true;
    } catch (error) {
      console.error("Visa update error:", error);
      toast.error("Failed to save visa information");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVisaTypeChange = (visaType: string) => {
    console.log("Visa type changed to:", visaType);
    // Update the visa type in the local state immediately
    setVisaData(prev => ({ 
      ...prev, 
      visaType: visaType as VisaType,
      // Also reset visa status when visa type changes
      visaStatus: ""
    }));
  };

  // Check if visa type is F1 or J1 - return a boolean, not a function
  const isF1OrJ1 = () => {
    const result = visaData.visaType === "F1" || visaData.visaType === "J1";
    console.log("isF1OrJ1 check:", result, "current visaType:", visaData.visaType);
    return result;
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
