
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { EmploymentInfoFormValues, OptStatus } from "@/types/onboarding";
import { dateUtils } from "@/lib/date-utils";

export function useEmploymentInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employmentData, setEmploymentData] = useState<Partial<EmploymentInfoFormValues>>({
    employmentStatus: "Not Employed",
    employerName: "",
    jobTitle: "",
    employmentStartDate: undefined,
    employmentEndDate: undefined,
    jobLocation: "",
    isFieldRelated: "No",
    authorizationType: "None",
    authStartDate: undefined,
    authEndDate: undefined,
    eadNumber: "",
    unemploymentDaysUsed: "",
    eVerifyNumber: "",
    previousEmployers: []
  });

  const handleEmploymentInfo = async (data: EmploymentInfoFormValues) => {
    setEmploymentData(data);
    setIsSubmitting(true);
    
    try {
      // Create a plain object with string values only - no Date objects
      const updateData: Record<string, any> = {
        // Basic employment data
        employmentStatus: data.employmentStatus,
      };
      
      // Only add employment related fields if employed
      if (data.employmentStatus === "Employed") {
        updateData.employerName = data.employerName;
        updateData.jobTitle = data.jobTitle;
        updateData.jobLocation = data.jobLocation;
        
        // Add field relation info if available
        if (data.isFieldRelated) {
          updateData.isJobRelatedToField = data.isFieldRelated;
        }
        
        // Format employment start date if provided
        if (data.employmentStartDate) {
          updateData.employmentStartDate = dateUtils.formatToYYYYMMDD(data.employmentStartDate);
        }
        
        // Format employment end date if provided
        if (data.employmentEndDate) {
          updateData.employmentEndDate = dateUtils.formatToYYYYMMDD(data.employmentEndDate);
        }
        
        // Add authorization data if provided
        if (data.authorizationType && data.authorizationType !== "None") {
          updateData.authorizationType = data.authorizationType;
          
          // Map authorization type to opt status for database consistency
          switch (data.authorizationType) {
            case "CPT":
              updateData.optStatus = OptStatus.None;
              break;
            case "OPT":
              updateData.optStatus = OptStatus.Opt;
              break;
            case "STEM OPT":
              updateData.optStatus = OptStatus.StemOpt;
              break;
            default:
              updateData.optStatus = OptStatus.None;
          }
          
          // Add authorization dates if provided
          if (data.authStartDate) {
            updateData.authStartDate = dateUtils.formatToYYYYMMDD(data.authStartDate);
          }
          
          if (data.authEndDate) {
            updateData.authEndDate = dateUtils.formatToYYYYMMDD(data.authEndDate);
          }
          
          // Add EAD number if provided
          if (data.eadNumber) {
            updateData.eadNumber = data.eadNumber;
          }
          
          // Add unemployment days if provided
          if (data.unemploymentDaysUsed) {
            updateData.unemploymentDays = data.unemploymentDaysUsed;
          }
          
          // Add E-Verify number for STEM OPT
          if (data.authorizationType === "STEM OPT" && data.eVerifyNumber) {
            updateData.eVerifyNumber = data.eVerifyNumber;
          }
        }
      }
      
      console.log("Updating profile with employment data:", updateData);
      
      await updateProfile(updateData);
      return true;
    } catch (error) {
      toast.error("Failed to save employment information");
      console.error("Employment info update error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed type issue by ensuring we're returning the same type we're setting
  const handleEmploymentStatusChange = (status: "Employed" | "Not Employed") => {
    setEmploymentData((prev) => ({
      ...prev,
      employmentStatus: status
    }));
  };

  return {
    employmentData,
    setEmploymentData,
    handleEmploymentInfo,
    handleEmploymentStatusChange,
    isSubmitting
  };
}
