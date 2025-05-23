
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ComplianceChecklist } from "@/components/onboarding/ComplianceChecklist";
import { useNavigate } from "react-router-dom";
import { useAICompliance } from "@/hooks/useAICompliance";
import { toast } from "sonner";

interface OnboardingChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingChecklist({ open, onOpenChange }: OnboardingChecklistProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { generateCompliance, isGenerating } = useAICompliance();
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  
  // Prepare user data for the checklist
  const userData = {
    name: currentUser?.name || "",
    visaType: currentUser?.visaType || "F1",
    university: currentUser?.university || "",
    fieldOfStudy: currentUser?.fieldOfStudy || "",
    employer: currentUser?.employerName || currentUser?.employer || "",
    email: currentUser?.email || "",
    country: currentUser?.country || "",
    courseStartDate: currentUser?.courseStartDate || null,
    usEntryDate: currentUser?.usEntryDate || null,
    employmentStartDate: currentUser?.employmentStartDate || null,
    employmentStatus: currentUser?.employmentStatus || "Unemployed Student",
    optType: currentUser?.authType || "",
    graduationDate: currentUser?.graduationDate || null
  };

  // Handle continue to dashboard
  const handleContinue = async () => {
    try {
      setIsGeneratingTasks(true);
      
      // Generate personalized compliance tasks based on user data
      if (currentUser) {
        // Convert Date objects to strings before passing to generateCompliance
        const stringifiedUserData = {
          ...userData,
          courseStartDate: userData.courseStartDate ? String(userData.courseStartDate) : null,
          usEntryDate: userData.usEntryDate ? String(userData.usEntryDate) : null,
          employmentStartDate: userData.employmentStartDate ? String(userData.employmentStartDate) : null,
          graduationDate: userData.graduationDate ? String(userData.graduationDate) : null
        };
        
        await generateCompliance(stringifiedUserData);
      }
      
      // Close dialog and clear flag
      localStorage.removeItem('show_onboarding_checklist');
      onOpenChange(false);
      
      // Show success toast
      toast.success("Welcome to your personalized dashboard!");
    } catch (error) {
      console.error("Error in onboarding continuation:", error);
      toast.error("There was a problem setting up your dashboard. Please try again.");
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Generate sections to display in the checklist
  const getSections = () => {
    const sections = [];
    
    // Personal info section
    sections.push({
      title: "Personal Information",
      items: [
        { label: "Name", value: userData.name, complete: !!userData.name },
        { label: "Email", value: currentUser?.email, complete: !!currentUser?.email },
        { label: "Country of origin", value: userData.country, complete: !!userData.country }
      ]
    });
    
    // Visa info section
    sections.push({
      title: "Visa Information",
      items: [
        { label: "Visa type", value: userData.visaType, complete: !!userData.visaType },
        { label: "Entry date", value: userData.usEntryDate, complete: !!userData.usEntryDate },
      ]
    });
    
    // Academic info section
    if (userData.visaType === "F1" || userData.visaType === "J1") {
      sections.push({
        title: "Academic Information",
        items: [
          { label: "University", value: userData.university, complete: !!userData.university },
          { label: "Field of study", value: userData.fieldOfStudy, complete: !!userData.fieldOfStudy },
          { label: "Start date", value: userData.courseStartDate, complete: !!userData.courseStartDate }
        ]
      });
    }
    
    // Employment info section
    if (userData.employmentStatus === "Employed" || userData.optType) {
      sections.push({
        title: "Employment Information",
        items: [
          { label: "Employer", value: userData.employer, complete: !!userData.employer },
          { label: "Employment start", value: userData.employmentStartDate, complete: !!userData.employmentStartDate },
          { label: "Authorization type", value: userData.optType || "N/A", complete: true }
        ]
      });
    }
    
    return sections;
  };

  return (
    <ComplianceChecklist 
      open={open} 
      onOpenChange={onOpenChange} 
      userData={userData}
      onContinue={handleContinue}
      isGenerating={isGeneratingTasks || isGenerating}
      sections={getSections()}
    />
  );
}

export default OnboardingChecklist;
