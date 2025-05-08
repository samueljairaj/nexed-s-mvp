
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface AITask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: "immigration" | "academic" | "employment" | "personal";
  completed: boolean;
  priority: "low" | "medium" | "high";
}

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
        employmentStatus: mapEmploymentStatus(userProfile),
        hasTransferred: Boolean(userProfile.previousUniversity || userProfile.transferDate),
        fieldOfStudy: userProfile.fieldOfStudy || "",
        employer: userProfile.employer || userProfile.employerName || "",
        optType: userProfile.optType || "",
        graduationDate: userProfile.graduationDate ? new Date(userProfile.graduationDate).toISOString() : null
      };

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-compliance', {
        body: { userData: enhancedUserData }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate compliance checklist');
      }

      if (!data || !data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid response from AI service');
      }

      toast.success("Personalized compliance checklist generated");
      return data.tasks as AITask[];
    } catch (error) {
      console.error('Error generating AI compliance checklist:', error);
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
