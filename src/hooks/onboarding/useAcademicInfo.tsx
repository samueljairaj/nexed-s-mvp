
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AcademicInfoFormValues } from "@/types/onboarding";

export function useAcademicInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicData, setAcademicData] = useState<Partial<AcademicInfoFormValues>>({});

  const handleAcademicInfo = async (data: AcademicInfoFormValues) => {
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
      
      // Handle dates
      if (data.programStartDate) {
        formattedData.courseStartDate = formatDateToString(data.programStartDate);
      }
      
      console.log("Saving academic data to profile:", formattedData);
      
      // Update the user profile with the academic information
      await updateProfile(formattedData);
      
      return true;
    } catch (error) {
      toast.error("Failed to save academic information");
      console.error("Academic info update error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
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
      return "";
    }
  };

  return {
    academicData,
    setAcademicData,
    handleAcademicInfo,
    isSubmitting
  };
}
