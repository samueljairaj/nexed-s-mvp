import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, FileCheck, Upload, User, Briefcase, GraduationCap, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAICompliance, AITask } from "@/hooks/useAICompliance";
import { DocumentCategory } from "@/types/onboarding";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { dateUtils } from "@/lib/date-utils";

interface ComplianceChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    name?: string;
    visaType?: string;
    university?: string;
    fieldOfStudy?: string;
    employer?: string;
  };
  onContinue: () => void;
}

interface GroupedDocuments {
  immigration: AITask[];
  employment: AITask[];
  educational: AITask[];
  personal: AITask[];
}

type DatabaseVisaType = "F1" | "OPT" | "H1B" | "Other";

export function ComplianceChecklist({ open, onOpenChange, userData, onContinue }: ComplianceChecklistProps) {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("all-documents");
  const { generateCompliance, isGenerating } = useAICompliance();
  const [documents, setDocuments] = useState<GroupedDocuments>({
    immigration: [],
    employment: [],
    educational: [],
    personal: []
  });
  const [phaseGroups, setPhaseGroups] = useState<{[key: string]: AITask[]}>({});
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const mergedUserData = {
    name: userData.name || currentUser?.name || "",
    visaType: userData.visaType || currentUser?.visaType || "F1",
    university: userData.university || currentUser?.university || "",
    fieldOfStudy: userData.fieldOfStudy || currentUser?.fieldOfStudy || "",
    employer: userData.employer || currentUser?.employerName || currentUser?.employer || ""
  };
  
  const [studentInfo, setStudentInfo] = useState({
    university: mergedUserData.university || "Not provided",
    program: mergedUserData.fieldOfStudy || "Not provided",
    optStartDate: currentUser?.courseStartDate ? formatDateDisplay(currentUser.courseStartDate) : "Not provided",
    optEndDate: "Not provided",
    recentUSEntry: currentUser?.usEntryDate ? formatDateDisplay(currentUser.usEntryDate) : "Not provided",
    i20EndDate: "Not provided",
    visaExpiration: currentUser?.visa_expiry_date ? formatDateDisplay(currentUser.visa_expiry_date) : "Not provided",
    employer: mergedUserData.employer || "Not provided",
  });
  
  function formatDateDisplay(dateString: string | Date | null | undefined): string {
    if (!dateString) return "Not provided";
    
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return String(dateString);
    }
  }
  
  const normalizeVisaType = (visaType: string | undefined): DatabaseVisaType => {
    if (!visaType) return "Other";
    
    const upperVisaType = visaType.toUpperCase();
    if (upperVisaType === "F1" || upperVisaType === "F-1") return "F1";
    if (upperVisaType === "OPT") return "OPT";
    if (upperVisaType === "H1B" || upperVisaType === "H-1B") return "H1B";
    if (upperVisaType === "J1" || upperVisaType === "J-1") return "Other";
    return "Other";
  };
  
  const saveGeneratedTasksToDatabase = async (tasks: AITask[]) => {
    if (!currentUser?.id) return;
    
    try {
      const dbTasks = tasks.map(task => {
        return {
          user_id: currentUser.id,
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          is_completed: task.completed || false,
          category: task.category as DocumentCategory,
          phase: task.phase || 'general',
          priority: task.priority || 'medium',
          visa_type: normalizeVisaType(currentUser.visaType)
        };
      });
      
      const { error } = await supabase
        .from('compliance_tasks')
        .upsert(dbTasks, {
          onConflict: 'user_id,title,phase'
        });
        
      if (error) {
        console.error('Error saving compliance tasks to database:', error);
        return false;
      }
      
      console.log('Successfully saved compliance tasks to database');
      return true;
    } catch (error) {
      console.error('Failed to save compliance tasks:', error);
      return false;
    }
  };

  // Rest of the component implementation remains unchanged...
  
  return (
    // Rest of the JSX remains unchanged...
  );
}