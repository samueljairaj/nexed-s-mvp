
import { useState } from "react";
import { useAuth } from "@/contexts";
import { toast } from "sonner";
import { PersonalInfoFormValues } from "@/types/onboarding";
import { dateUtils } from "@/lib/date-utils";

export function usePersonalInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalData, setPersonalData] = useState<Partial<PersonalInfoFormValues>>({
    country: "",
    currentCountry: "",
    phoneNumber: "",
    passportNumber: "",
    passportExpiryDate: undefined,
    dateOfBirth: undefined,
    address: ""
  });

  const handlePersonalInfo = async (data: PersonalInfoFormValues) => {
    setPersonalData(data);
    setIsSubmitting(true);
    
    try {
      // Create a plain object with string values only - no Date objects
      const updateData: Record<string, any> = {
        country: data.country,
        currentCountry: data.currentCountry,
        phone: data.phoneNumber, // Map to proper database field
        passportNumber: data.passportNumber,
        address: data.address,
      };
      
      // Format dates as YYYY-MM-DD strings using our utility
      if (data.dateOfBirth) {
        updateData.dateOfBirth = dateUtils.formatToYYYYMMDD(data.dateOfBirth);
      }

      if (data.passportExpiryDate) {
        updateData.passportExpiryDate = dateUtils.formatToYYYYMMDD(data.passportExpiryDate);
      }

      // Log the data we're about to send for debugging
      console.log("Updating profile with personal data:", updateData);
      
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

