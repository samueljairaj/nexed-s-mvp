
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
      // Create a plain object with string values only - no Date objects
      const updateData: Record<string, any> = {
        country: data.country,
        phone: data.phone,
        passportNumber: data.passportNumber,
        address: data.address
      };
      
      // Format dates as YYYY-MM-DD strings
      if (data.dateOfBirth) {
        // Convert to string format directly without using toISOString
        updateData.usEntryDate = formatDateToString(data.dateOfBirth);
      }

      if (data.passportExpiryDate) {
        updateData.passportExpiryDate = formatDateToString(data.passportExpiryDate);
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
