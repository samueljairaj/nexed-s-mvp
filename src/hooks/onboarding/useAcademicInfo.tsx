
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AcademicInfoFormValues } from "@/types/onboarding";

export function useAcademicInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicData, setAcademicData] = useState<Partial<AcademicInfoFormValues>>({
    university: "",
    degreeLevel: "",
    fieldOfStudy: ""
  });

  const handleAcademicInfo = async (data: AcademicInfoFormValues) => {
    setAcademicData(data);
    setIsSubmitting(true);
    
    try {
      // Map the form field names to match the database column names
      const updateData: Record<string, any> = {
        university: data.university,
        degree_level: data.degreeLevel,  // Use snake_case for database columns
        field_of_study: data.fieldOfStudy,  // Use snake_case for database columns
      };
      
      // Format program start date as YYYY-MM-DD string
      if (data.programStartDate) {
        updateData.courseStartDate = formatDateToString(data.programStartDate);
      }

      if (data.programCompletionDate) {
        updateData.graduationDate = formatDateToString(data.programCompletionDate);
      }

      if (data.isTransferStudent) {
        updateData.previous_university = data.previousUniversity;
        updateData.has_transferred = true;
      }

      console.log("Updating profile with academic data:", updateData);
      
      await updateProfile(updateData);
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
      // Return today's date as fallback
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
  };

  return {
    academicData,
    setAcademicData,
    handleAcademicInfo,
    isSubmitting
  };
}
