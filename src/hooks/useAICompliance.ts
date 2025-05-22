
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentCategory } from "@/types/document";
import { getBaselineChecklist, baselineItemsToAITasks } from "@/utils/baselineChecklists";
import { Task } from "@/hooks/useComplianceTasks";

export type AITask = Task;

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

  // Helper function to ensure valid date format or provide a default
  const formatDateOrDefault = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '2025-06-30'; // Default date if none provided
    
    try {
      // Try to convert to a valid date string
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '2025-06-30'; // Invalid date
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (e) {
      console.error('Error formatting date:', e);
      return '2025-06-30'; // Default fallback
    }
  };

  // Helper to ensure we always pass a string to formatDateOrDefault
  const ensureString = (value: string | Date | null | undefined): string | null | undefined => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  };

  const generateCompliance = async (userData?: EnhancedUserData) => {
    setIsGenerating(true);
    
    try {
      const userProfile = {
        ...currentUser,
        ...userData
      };
      
      const visaType = userProfile.visaType || "F1";
      const employmentStatus = mapEmploymentStatus(userProfile);
      
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
      
      const baselineItems = getBaselineChecklist(visaType, phase);
      const baselineTasks = baselineItemsToAITasks(baselineItems);
      
      if (baselineItems.length === 0) {
        setIsGenerating(false);
        return [];
      }
      
      const enhancedUserData = {
        name: userProfile.name,
        email: userProfile.email,
        country: userProfile.country,
        visaType: userProfile.visaType,
        university: userProfile.university || "",
        courseStartDate: userProfile.courseStartDate ? formatDateOrDefault(ensureString(userProfile.courseStartDate)) : null,
        usEntryDate: userProfile.usEntryDate ? formatDateOrDefault(ensureString(userProfile.usEntryDate)) : null,
        employmentStartDate: userProfile.employmentStartDate ? formatDateOrDefault(ensureString(userProfile.employmentStartDate)) : null,
        employmentStatus: employmentStatus,
        hasTransferred: Boolean(userProfile.previousUniversity || userProfile.transferDate),
        fieldOfStudy: userProfile.fieldOfStudy || "",
        employer: userProfile.employer || userProfile.employerName || "",
        optType: userProfile.optType || "",
        graduationDate: userProfile.graduationDate ? formatDateOrDefault(ensureString(userProfile.graduationDate)) : null
      };

      const { data, error } = await supabase.functions.invoke('generate-compliance', {
        body: { 
          userData: enhancedUserData,
          baselineTasks: baselineTasks
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate compliance checklist');
      }

      if (!data || !data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid response from compliance service');
      }

      // Transform tasks to match database schema and ensure valid dates
      const transformedTasks = data.tasks.map((task: AITask) => {
        // Ensure we have a valid due date
        const dueDate = task.dueDate ? formatDateOrDefault(ensureString(task.dueDate)) : '2025-06-30';
        
        return {
          user_id: currentUser.id,
          title: task.title,
          description: task.description,
          due_date: dueDate,
          is_completed: task.completed || false,
          category: task.category,
          phase: task.phase || 'general',
          priority: task.priority || 'medium',
          visa_type: visaType
        };
      });

      // Insert new tasks with UPSERT
      const { error: insertError } = await supabase
        .from('compliance_tasks')
        .upsert(transformedTasks, {
          onConflict: 'user_id,title,phase'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Failed to save generated tasks');
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

  function mapEmploymentStatus(userProfile: any): string {
    if (!userProfile) return "Unknown";
    
    const visaType = userProfile.visaType?.toLowerCase();
    const employmentStatus = userProfile.employmentStatus?.toLowerCase();
    const optType = userProfile.optType?.toLowerCase();
    
    if (
      (visaType === 'f1' && optType === 'stem') || 
      (employmentStatus?.includes('stem')) ||
      (userProfile.hasOwnProperty('isStemOpt') && userProfile.isStemOpt === true)
    ) {
      return "STEM OPT Extension";
    }
    
    if (
      (visaType === 'f1' && employmentStatus?.includes('opt')) ||
      (optType === 'regular') ||
      (userProfile.hasOwnProperty('isOpt') && userProfile.isOpt === true)
    ) {
      return "OPT";
    }
    
    if (
      (visaType === 'f1' && employmentStatus?.includes('cpt')) ||
      (userProfile.hasOwnProperty('isCpt') && userProfile.isCpt === true)
    ) {
      return "CPT";
    }
    
    if (visaType === 'h1b') {
      return "H1B Employment";
    }
    
    if (
      (visaType === 'f1' || visaType === 'j1') && 
      (!userProfile.employer && !userProfile.employerName)
    ) {
      return "Unemployed Student";
    }
    
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
