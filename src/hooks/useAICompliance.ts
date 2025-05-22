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
        courseStartDate: userProfile.courseStartDate ? new Date(userProfile.courseStartDate).toISOString() : null,
        usEntryDate: userProfile.usEntryDate ? new Date(userProfile.usEntryDate).toISOString() : null,
        employmentStartDate: userProfile.employmentStartDate ? new Date(userProfile.employmentStartDate).toISOString() : null,
        employmentStatus: employmentStatus,
        hasTransferred: Boolean(userProfile.previousUniversity || userProfile.transferDate),
        fieldOfStudy: userProfile.fieldOfStudy || "",
        employer: userProfile.employer || userProfile.employerName || "",
        optType: userProfile.optType || "",
        graduationDate: userProfile.graduationDate ? new Date(userProfile.graduationDate).toISOString() : null
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

      // Transform tasks to match database schema
      const transformedTasks = data.tasks.map((task: AITask) => ({
        user_id: currentUser.id,
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        is_completed: task.completed || false, // Use is_completed instead of completed
        category: task.category,
        phase: task.phase || 'general',
        priority: task.priority || 'medium',
        visa_type: visaType
      }));

      // Insert new tasks with UPSERT
      const { error: insertError } = await supabase
        .from('compliance_tasks')
        .upsert(transformedTasks, {
          onConflict: 'user_id,title,phase'
        });

      if (insertError) {
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