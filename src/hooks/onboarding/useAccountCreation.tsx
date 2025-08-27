
import { useState } from "react";
import { useAuth } from "@/contexts";
import { toast } from "sonner";
import { AccountCreationFormData } from "@/components/onboarding/AccountCreationStep";

export function useAccountCreation() {
  const { isAuthenticated, updateProfile, signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountData, setAccountData] = useState<Partial<AccountCreationFormData>>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });

  const handleAccountCreation = async (data: AccountCreationFormData) => {
    setAccountData(data);
    
    if (!isAuthenticated) {
      setIsSubmitting(true);
      try {
        await signup(data.email, data.password);
        // Update the profile with name
        await updateProfile({ 
          name: `${data.firstName} ${data.lastName}` 
        });
        toast.success("Account created successfully!");
        return true;
      } catch (error: any) {
        toast.error(`Account creation failed: ${error.message}`);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Just update the profile with name if authenticated
      setIsSubmitting(true);
      try {
        await updateProfile({ 
          name: `${data.firstName} ${data.lastName}` 
        });
        return true;
      } catch (error) {
        toast.error("Failed to update profile");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    accountData,
    setAccountData,
    handleAccountCreation,
    isSubmitting
  };
}
