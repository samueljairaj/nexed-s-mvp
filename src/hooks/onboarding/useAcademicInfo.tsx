
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AcademicInfoFormValues } from "@/types/onboarding";
import { dateUtils } from "@/lib/date-utils";

export function useAcademicInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicData, setAcademicData] = useState<Partial<AcademicInfoFormValues>>({});

  const handleAcademicInfo = async (data: AcademicInfoFormValues) => {
    console.log("handleAcademicInfo called with data:", data);
    // Store the full data in the component state
    setAcademicData(data);
    setIsSubmitting(true);
    
    try {
      // Format data using camelCase for the userProfile object
      const formattedData: Record<string, any> = {
        university: data.university,
        fieldOfStudy: data.fieldOfStudy,
        degreeLevel: data.degreeLevel,
        isSTEM: data.isSTEM || false
      };
      
      // Handle dates using our utilities
      if (data.programStartDate) {
        formattedData.courseStartDate = dateUtils.formatToYYYYMMDD(data.programStartDate);
      }

      if (data.programCompletionDate) {
        formattedData.programCompletionDate = dateUtils.formatToYYYYMMDD(data.programCompletionDate);
      }
      
      // Add transfer student information if applicable
      if (data.isTransferStudent && data.transferHistory && data.transferHistory.length > 0) {
        formattedData.transferHistory = data.transferHistory.map(transfer => ({
          universityName: transfer.universityName,
          startDate: dateUtils.formatToYYYYMMDD(transfer.startDate),
          endDate: dateUtils.formatToYYYYMMDD(transfer.endDate),
          reason: transfer.reason
        }));
      }

      // Add DSO contact info if provided
      if (data.dsoName || data.dsoEmail || data.dsoPhone) {
        formattedData.dsoContact = {
          name: data.dsoName,
          email: data.dsoEmail,
          phone: data.dsoPhone
        };
      }
      
      console.log("Saving academic data to profile:", formattedData);
      
      // Update the user profile with the academic information
      await updateProfile(formattedData);
      toast.success("Academic information saved successfully");
      
      return true;
    } catch (error) {
      toast.error("Failed to save academic information");
      console.error("Academic info update error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    academicData,
    setAcademicData,
    handleAcademicInfo,
    isSubmitting
  };
}
