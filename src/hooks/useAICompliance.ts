
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

export function useAICompliance() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentUser } = useAuth();

  const generateCompliance = async (userData?: Record<string, any>) => {
    setIsGenerating(true);
    
    try {
      // Combine current user data with any additional data provided
      const userProfile = {
        ...currentUser,
        ...userData
      };
      
      // Remove sensitive or unnecessary information
      const sanitizedUserData = {
        name: userProfile.name,
        email: userProfile.email,
        country: userProfile.country,
        visaType: userProfile.visaType,
        university: userProfile.university,
        fieldOfStudy: userProfile.fieldOfStudy || "",
        employer: userProfile.employer || "",
        courseStartDate: userProfile.courseStartDate ? new Date(userProfile.courseStartDate).toISOString() : null,
        usEntryDate: userProfile.usEntryDate ? new Date(userProfile.usEntryDate).toISOString() : null,
        employmentStartDate: userProfile.employmentStartDate ? new Date(userProfile.employmentStartDate).toISOString() : null,
      };

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-compliance', {
        body: { userData: sanitizedUserData }
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

  return {
    generateCompliance,
    isGenerating
  };
}
