
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
      
      // Handle dateOfBirth field with extra null and type checks
      if (data.dateOfBirth) {
        // Make sure we only try to call toISOString on actual Date objects
        if (data.dateOfBirth instanceof Date) {
          updateData.usEntryDate = data.dateOfBirth.toISOString();
        } else if (typeof data.dateOfBirth === 'string') {
          updateData.usEntryDate = data.dateOfBirth;
        } else {
          console.log("dateOfBirth is neither a Date nor a string:", data.dateOfBirth);
        }
      }

      // Log the data we're about to send for debugging
      console.log("Updating profile with data:", updateData);
      
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
