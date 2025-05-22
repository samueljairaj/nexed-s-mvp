
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ComplianceChecklist } from "@/components/onboarding/ComplianceChecklist";
import { useNavigate } from "react-router-dom";

interface OnboardingChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingChecklist({ open, onOpenChange }: OnboardingChecklistProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Prepare user data for the checklist
  const userData = {
    name: currentUser?.name || "",
    visaType: currentUser?.visaType || "F1",
    university: currentUser?.university || "",
    fieldOfStudy: currentUser?.fieldOfStudy || "",
    employer: currentUser?.employerName || currentUser?.employer || "",
  };

  // Handle continue to dashboard
  const handleContinue = () => {
    // Clear the flag so it doesn't show again
    localStorage.removeItem('show_onboarding_checklist');
    onOpenChange(false);
  };

  return (
    <ComplianceChecklist 
      open={open} 
      onOpenChange={onOpenChange} 
      userData={userData}
      onContinue={handleContinue}
    />
  );
}

export default OnboardingChecklist;
