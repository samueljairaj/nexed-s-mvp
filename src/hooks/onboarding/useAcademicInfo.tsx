
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AcademicInfoFormData } from "@/components/onboarding/AcademicInfoStep";

export function useAcademicInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicData, setAcademicData] = useState<Partial<AcademicInfoFormData>>({
    university: "",
    degreeLevel: "",
    fieldOfStudy: "",
    isSTEM: false
  });

  const handleAcademicInfo = async (data: AcademicInfoFormData) => {
    setAcademicData(data);
    setIsSubmitting(true);
    
    try {
      // Only include properties that exist in the database schema
      const updateData: any = {
        university: data.university,
      };
      
      // Safely handle programStartDate with proper string conversion
      if (data.programStartDate) {
        updateData.courseStartDate = data.programStartDate instanceof Date 
          ? data.programStartDate.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
          : data.programStartDate;  // If it's already a string
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

  return {
    academicData,
    setAcademicData,
    handleAcademicInfo,
    isSubmitting
  };
}
