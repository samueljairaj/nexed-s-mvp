
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AccountCreationFormValues, PersonalInfoFormValues, VisaStatusFormValues, AcademicInfoFormValues, EmploymentInfoFormValues } from "@/types/onboarding";

// Type for storing the onboarding state
interface OnboardingState {
  accountCreation: Partial<AccountCreationFormValues>;
  personalInfo: Partial<PersonalInfoFormValues>;
  visaStatus: Partial<VisaStatusFormValues>;
  academicInfo: Partial<AcademicInfoFormValues>;
  employmentInfo: Partial<EmploymentInfoFormValues>;
  completedSteps: string[];
}

// Hook for managing onboarding state
export const useOnboardingState = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Initialize with empty values
  const [state, setState] = useState<OnboardingState>({
    accountCreation: {},
    personalInfo: {},
    visaStatus: {},
    academicInfo: {},
    employmentInfo: {},
    completedSteps: []
  });

  // Load any existing user data into onboarding state
  useEffect(() => {
    // Only attempt to load user data if we have a user
    if (currentUser) {
      const updatedState = { ...state };
      
      // Pre-fill personal info if available
      if (currentUser.name || currentUser.email) {
        const nameParts = (currentUser.name || "").split(" ");
        updatedState.accountCreation = {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: currentUser.email || ""
        };
      }

      // Pre-fill personal info if available
      if (currentUser.country || currentUser.phone || currentUser.passport_number) {
        updatedState.personalInfo = {
          country: currentUser.country || "",
          currentCountry: "United States", // Default for existing users
          phoneNumber: currentUser.phone || "",
          passportNumber: currentUser.passport_number || "",
          address: currentUser.address || "",
          // Convert date strings to Date objects if they exist
          dateOfBirth: currentUser.date_of_birth ? new Date(currentUser.date_of_birth) : undefined,
          passportExpiryDate: currentUser.passport_expiry_date ? new Date(currentUser.passport_expiry_date) : undefined
        };
      }

      // Pre-fill visa status if available
      if (currentUser.visa_type) {
        // Use optional chaining to safely access properties that might not exist
        updatedState.visaStatus = {
          visaType: currentUser.visa_type,
          visaStatus: "Active", // Default for existing users
          sevisId: currentUser?.sevis_id || "", // Add null check with optional chaining
          i94Number: currentUser?.i94_number || "", // Add null check with optional chaining
          entryDate: currentUser.us_entry_date ? new Date(currentUser.us_entry_date) : undefined,
          visaExpiryDate: currentUser.visa_expiry_date ? new Date(currentUser.visa_expiry_date) : undefined
        };
      }

      // Pre-fill academic info if available
      if (currentUser.university || currentUser.degree_level) {
        updatedState.academicInfo = {
          university: currentUser.university || "",
          degreeLevel: currentUser.degree_level || "",
          fieldOfStudy: currentUser.field_of_study || "",
          isSTEM: currentUser.is_stem || false,
          programStartDate: currentUser.course_start_date ? new Date(currentUser.course_start_date) : undefined,
          programCompletionDate: undefined // No direct mapping in current schema
        };
      }

      // Pre-fill employment info if available
      // Use optional chaining to safely access properties that might not exist
      if (currentUser?.employer_name || currentUser?.employment_start_date) {
        updatedState.employmentInfo = {
          employmentStatus: "Employed",
          employerName: currentUser?.employer_name || "", // Add null check with optional chaining
          jobTitle: currentUser?.job_title || "", // Add null check with optional chaining
          employmentStartDate: currentUser?.employment_start_date ? new Date(currentUser.employment_start_date) : undefined,
          jobLocation: "", // No direct mapping in current schema
        };
      } else {
        updatedState.employmentInfo = {
          employmentStatus: "Not Employed"
        };
      }

      // Update state with pre-filled values
      setState(updatedState);
    }
    
    setLoading(false);
  }, [currentUser]);

  // Function to skip directly to the dashboard
  const skipOnboarding = () => {
    navigate("/app/dashboard");
  };

  // Function to update a specific step in the onboarding process
  const updateStep = (step: keyof OnboardingState, data: any) => {
    setState(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
      completedSteps: [...new Set([...prev.completedSteps, step])]
    }));
  };

  // Check if a step has been completed
  const isStepCompleted = (step: keyof OnboardingState) => 
    state.completedSteps.includes(step);

  return {
    state,
    loading,
    updateStep,
    isStepCompleted,
    skipOnboarding
  };
};

export default useOnboardingState;
