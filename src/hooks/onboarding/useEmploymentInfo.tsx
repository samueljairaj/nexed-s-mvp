
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { EmploymentInfoFormValues } from "@/types/onboarding";
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
    isFieldRelated: undefined,
    authorizationType: undefined,
    authStartDate: undefined,
    authEndDate: undefined,
    eadNumber: "",
    unemploymentDaysUsed: "",
    eVerifyNumber: "",
    previousEmployers: []
  });

  const handleEmploymentInfo = async (data: EmploymentInfoFormValues): Promise<boolean> => {
    setEmploymentData(data);
    setIsSubmitting(true);
    
    try {
      // Format data for profile update
      const updateData: Record<string, any> = {
        employmentStatus: data.employmentStatus
      };
      
      // Only include employment details if employed
      if (data.employmentStatus === "Employed") {
        updateData.employerName = data.employerName;
        updateData.jobTitle = data.jobTitle;
        updateData.jobLocation = data.jobLocation;
        
        // Format dates with our utility
        if (data.employmentStartDate) {
          updateData.employmentStartDate = dateUtils.formatToYYYYMMDD(data.employmentStartDate);
        }
        
        if (data.employmentEndDate) {
          updateData.employmentEndDate = dateUtils.formatToYYYYMMDD(data.employmentEndDate);
        }
        
        // Add authorization details if applicable
        if (data.authorizationType) {
          updateData.authorizationType = data.authorizationType;
          updateData.isFieldRelated = data.isFieldRelated;
          
          if (data.authStartDate) {
            updateData.authStartDate = dateUtils.formatToYYYYMMDD(data.authStartDate);
          }
          
          if (data.authEndDate) {
            updateData.authEndDate = dateUtils.formatToYYYYMMDD(data.authEndDate);
          }
          
          if (data.eadNumber) {
            updateData.eadNumber = data.eadNumber;
          }
          
          if (data.unemploymentDaysUsed) {
            updateData.unemploymentDaysUsed = data.unemploymentDaysUsed;
          }
          
          // STEM OPT specific fields
          if (data.authorizationType === "STEM OPT" && data.eVerifyNumber) {
            updateData.eVerifyNumber = data.eVerifyNumber;
          }
        }
        
        // Add previous employment history if available
        if (data.previousEmployers && data.previousEmployers.length > 0) {
          updateData.previousEmployers = data.previousEmployers.map(employer => ({
            employerName: employer.employerName,
            jobTitle: employer.jobTitle,
            jobLocation: employer.jobLocation,
            startDate: dateUtils.formatToYYYYMMDD(employer.startDate),
            endDate: employer.endDate ? dateUtils.formatToYYYYMMDD(employer.endDate) : null
          }));
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
  
  const handleEmploymentStatusChange = (status: string) => {
    setEmploymentData(prev => ({ ...prev, employmentStatus: status }));
  };
  
  const isF1OrJ1 = () => {
    // Get visa type from auth context or from local state
    const visaType = localStorage.getItem('visaType') || 'F1';
    return visaType === "F1" || visaType === "J1";
  };
  
  const isEmployed = () => {
    return employmentData.employmentStatus === "Employed";
  };
  
  const isOptOrCpt = () => {
    return employmentData.authorizationType === "OPT" || 
           employmentData.authorizationType === "CPT" || 
           employmentData.authorizationType === "STEM OPT";
  };
  
  const isStemOpt = () => {
    return employmentData.authorizationType === "STEM OPT";
  };

  return {
    employmentData,
    setEmploymentData,
    handleEmploymentInfo,
    handleEmploymentStatusChange,
    isF1OrJ1,
    isEmployed,
    isOptOrCpt,
    isStemOpt,
    isSubmitting
  };
}
