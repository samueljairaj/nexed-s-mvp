
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PersonalInfoFormData } from "@/components/onboarding/PersonalInfoStep";

export function usePersonalInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalData, setPersonalData] = useState<Partial<PersonalInfoFormData>>({
    country: "",
    phone: "",
    passportNumber: "",
    address: ""
  });

  const handlePersonalInfo = async (data: PersonalInfoFormData) => {
    setPersonalData(data);
    setIsSubmitting(true);
    
    try {
      // Map the form fields to database fields correctly
      const updateData: any = {
        country: data.country,
      };
      
      // Safely handle dateOfBirth - ensure it's passed as a string to the database
      if (data.dateOfBirth) {
        // Check if it's a Date object before calling toISOString
        if (data.dateOfBirth instanceof Date) {
          updateData.usEntryDate = data.dateOfBirth.toISOString();
        } else if (typeof data.dateOfBirth === 'string') {
          // If it's already a string, use it directly
          updateData.usEntryDate = data.dateOfBirth;
        }
      }
      
      await updateProfile(updateData);
      return true;
    } catch (error) {
      toast.error("Failed to save personal information");
      console.error("Personal info update error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    personalData,
    setPersonalData,
    handlePersonalInfo,
    isSubmitting
  };
}
