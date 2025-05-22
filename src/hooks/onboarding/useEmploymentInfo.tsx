
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
        employment_status: data.employmentStatus, // Use correct column name with underscore
      };
      
      // Only add employment related fields if employed
      if (data.employmentStatus === "Employed") {
        updateData.employer_name = data.employerName;
        updateData.job_title = data.jobTitle;
        
        // The jobLocation field doesn't exist in the database schema
        // So we'll omit it or store it in a different column if needed
        
        // Add field relation info if available
        if (data.isFieldRelated) {
          updateData.isJobRelatedToField = data.isFieldRelated;
        }
        
        // Format employment start date if provided
        if (data.employmentStartDate) {
          updateData.employment_start_date = dateUtils.formatToYYYYMMDD(data.employmentStartDate);
        }
        
        // Format employment end date if provided - Fix: use snake_case column name
        if (data.employmentEndDate) {
          updateData.employment_end_date = dateUtils.formatToYYYYMMDD(data.employmentEndDate);
        }
        
        // Add authorization data if provided
        if (data.authorizationType && data.authorizationType !== "None") {
          updateData.auth_type = data.authorizationType;
          
          // Map authorization type to opt status for database consistency
          switch (data.authorizationType) {
            case "CPT":
              updateData.opt_status = OptStatus.None;
              break;
            case "OPT":
              updateData.opt_status = OptStatus.Opt;
              break;
            case "STEM OPT":
              updateData.opt_status = OptStatus.StemOpt;
              break;
            default:
              updateData.opt_status = OptStatus.None;
          }
          
          // Add authorization dates if provided
          if (data.authStartDate) {
            updateData.auth_start_date = dateUtils.formatToYYYYMMDD(data.authStartDate);
          }
          
          if (data.authEndDate) {
            updateData.auth_end_date = dateUtils.formatToYYYYMMDD(data.authEndDate);
          }
          
          // Add EAD number if provided
          if (data.eadNumber) {
            updateData.ead_number = data.eadNumber;
          }
          
          // Add unemployment days if provided
          if (data.unemploymentDaysUsed) {
            updateData.unemployment_days = data.unemploymentDaysUsed;
          }
          
          // Add E-Verify number for STEM OPT
          if (data.authorizationType === "STEM OPT" && data.eVerifyNumber) {
            updateData.e_verify_number = data.eVerifyNumber;
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
