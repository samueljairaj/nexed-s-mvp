
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PersonalInfoFormValues } from "@/types/onboarding";

export function usePersonalInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalData, setPersonalData] = useState<Partial<PersonalInfoFormValues>>({
    country: "",
    phoneNumber: "",
    nationality: "",
    address: ""
  });

  const handlePersonalInfo = async (data: PersonalInfoFormValues) => {
    setPersonalData(data);
    setIsSubmitting(true);
    
    try {
      // Create a plain object with string values only - no Date objects
      const updateData: Record<string, any> = {
        country: data.country,
        phone: data.phoneNumber,
        address: data.address,
        nationality: data.nationality
      };
      
      // Format dates as YYYY-MM-DD strings
      if (data.dateOfBirth) {
        updateData.dateOfBirth = formatDateToString(data.dateOfBirth);
      }

      if (data.usEntryDate) {
        updateData.usEntryDate = formatDateToString(data.usEntryDate);
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

  // Helper function to safely format dates
  const formatDateToString = (date: Date | string): string => {
    if (typeof date === 'string') {
      return date;
    }
    
    try {
      // Format as YYYY-MM-DD manually to avoid any toISOString issues
      const year = date.getFullYear();
      // Add leading zeros if needed
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
    personalData,
    setPersonalData,
    handlePersonalInfo,
    isSubmitting
  };
}
