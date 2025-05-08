
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
        phone: data.phone,
        passportNumber: data.passportNumber,
        address: data.address
      };
      
      // Handle date fields as strings from the beginning
      if (data.dateOfBirth) {
        // Format as YYYY-MM-DD string directly
        updateData.usEntryDate = data.dateOfBirth instanceof Date 
          ? data.dateOfBirth.toISOString().split('T')[0]  // Convert to YYYY-MM-DD format
          : data.dateOfBirth; // If it's already a string
      }

      if (data.passportExpiryDate) {
        updateData.passportExpiryDate = data.passportExpiryDate instanceof Date
          ? data.passportExpiryDate.toISOString().split('T')[0]
          : data.passportExpiryDate;
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
