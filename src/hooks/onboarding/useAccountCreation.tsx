
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AccountCreationFormData } from "@/components/onboarding/AccountCreationStep";

export function useAccountCreation() {
  const { isAuthenticated, updateProfile, signUp } = useAuth();
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
        await signUp({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName
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
