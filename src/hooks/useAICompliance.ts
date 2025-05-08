
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentCategory } from "@/types/document";
import { getBaselineChecklist, baselineItemsToAITasks } from "@/utils/baselineChecklists";
import { Task } from "@/hooks/useComplianceTasks";

// Use the same Task type as imported from useComplianceTasks
export type AITask = Task;

// Define a comprehensive interface for user profile data
interface EnhancedUserData {
  name?: string;
  email?: string;
  country?: string;
  visaType?: string;
  university?: string;
  courseStartDate?: string | null;
  usEntryDate?: string | null;
  employmentStartDate?: string | null;
  employmentStatus?: string;
  hasTransferred?: boolean;
  previousUniversity?: string;
  transferDate?: string;
  fieldOfStudy?: string;
  employer?: string;
  employerName?: string;
  optType?: string;
  graduationDate?: string;
}

export function useAICompliance() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentUser } = useAuth();

  const generateCompliance = async (userData?: EnhancedUserData) => {
    setIsGenerating(true);
    
    try {
      // Combine current user data with any additional data provided
      const userProfile = {
        ...currentUser,
        ...userData
      };
      
      // Step 1: Generate baseline checklist based on visa type
      const visaType = userProfile.visaType || "F1";
      const employmentStatus = mapEmploymentStatus(userProfile);
      
      // Determine the appropriate phase
      let phase = "F1";
      if (employmentStatus === "OPT") {
        phase = "OPT";
      } else if (employmentStatus === "STEM OPT Extension") {
        phase = "STEM OPT";
      } else if (visaType === "J1") {
        phase = "J1";
      } else if (visaType === "H1B") {
        phase = "H1B";
      }
      
      // Get baseline checklist items
      const baselineItems = getBaselineChecklist(visaType, phase);
      
      // Convert baseline items to AITask format
      const baselineTasks = baselineItemsToAITasks(baselineItems);
      
      // If there are no items in the baseline, return an empty array early
      if (baselineItems.length === 0) {
        setIsGenerating(false);
        return [];
      }
      
      // Include additional fields needed for rules evaluation
      const enhancedUserData = {
        name: userProfile.name,
        email: userProfile.email,
        country: userProfile.country,
        visaType: userProfile.visaType,
        university: userProfile.university || "",
        courseStartDate: userProfile.courseStartDate ? new Date(userProfile.courseStartDate).toISOString() : null,
        usEntryDate: userProfile.usEntryDate ? new Date(userProfile.usEntryDate).toISOString() : null,
        employmentStartDate: userProfile.employmentStartDate ? new Date(userProfile.employmentStartDate).toISOString() : null,
        // Additional fields for rules engine
        employmentStatus: employmentStatus,
        hasTransferred: Boolean(userProfile.previousUniversity || userProfile.transferDate),
        fieldOfStudy: userProfile.fieldOfStudy || "",
        employer: userProfile.employer || userProfile.employerName || "",
        optType: userProfile.optType || "",
        graduationDate: userProfile.graduationDate ? new Date(userProfile.graduationDate).toISOString() : null
      };

      // Step 2: Use AI to enhance the baseline checklist
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-compliance', {
        body: { 
          userData: enhancedUserData,
          baselineTasks: baselineTasks  // Pass the baseline checklist to the AI
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate compliance checklist');
      }

      if (!data || !data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid response from compliance service');
      }

      toast.success("Personalized compliance checklist generated");
      return data.tasks as AITask[];
    } catch (error) {
      console.error('Error generating compliance checklist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate compliance checklist');
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to map user's employment status to standardized values
  function mapEmploymentStatus(userProfile: any): string {
    if (!userProfile) return "Unknown";
    
    const visaType = userProfile.visaType?.toLowerCase();
    const employmentStatus = userProfile.employmentStatus?.toLowerCase();
    const optType = userProfile.optType?.toLowerCase();
    
    // STEM OPT cases
    if (
      (visaType === 'f1' && optType === 'stem') || 
      (employmentStatus?.includes('stem')) ||
      (userProfile.hasOwnProperty('isStemOpt') && userProfile.isStemOpt === true)
    ) {
      return "STEM OPT Extension";
    }
    
    // Regular OPT cases
    if (
      (visaType === 'f1' && employmentStatus?.includes('opt')) ||
      (optType === 'regular') ||
      (userProfile.hasOwnProperty('isOpt') && userProfile.isOpt === true)
    ) {
      return "OPT";
    }
    
    // CPT cases
    if (
      (visaType === 'f1' && employmentStatus?.includes('cpt')) ||
      (userProfile.hasOwnProperty('isCpt') && userProfile.isCpt === true)
    ) {
      return "CPT";
    }
    
    // H1B cases
    if (visaType === 'h1b') {
      return "H1B Employment";
    }
    
    // Unemployed students
    if (
      (visaType === 'f1' || visaType === 'j1') && 
      (!userProfile.employer && !userProfile.employerName)
    ) {
      return "Unemployed Student";
    }
    
    // Default employed cases
    if (userProfile.employer || userProfile.employerName) {
      return "Employed";
    }
    
    return "Unknown";
  }

  return {
    generateCompliance,
    isGenerating
  };
}
