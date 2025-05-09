
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface TeamMemberInvite {
  email: string;
  role: Database["public"]["Enums"]["dso_role"];
}

export interface TeamInviteFormData {
  invites: TeamMemberInvite[];
}

export function useDsoTeamInvite() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamInviteData, setTeamInviteData] = useState<TeamInviteFormData>({
    invites: [{ email: '', role: 'dso_viewer' }]
  });
  
  const handleTeamInvites = async (data: TeamInviteFormData): Promise<boolean> => {
    // Filter out empty emails
    const validInvites = data.invites.filter(invite => invite.email.trim() !== '');
    
    if (validInvites.length === 0) {
      // Skip if no valid invites
      return true;
    }
    
    setTeamInviteData({ invites: validInvites });
    setIsSubmitting(true);
    
    try {
      // This would typically send emails to invite team members
      // For now, just show success message and log the invites
      
      console.log("Team invites:", validInvites);
      
      // In a real implementation, you would:
      // 1. Send emails with invitation links
      // 2. Store the invitations in a database table
      // 3. Handle invitation acceptance flow
      
      toast.success(`Invitations sent to ${validInvites.length} team members!`);
      return true;
    } catch (error: any) {
      console.error("Failed to send team invites:", error);
      toast.error(`Failed to send invitations: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addInviteField = () => {
    setTeamInviteData(prev => ({
      invites: [...prev.invites, { email: '', role: 'dso_viewer' }]
    }));
  };
  
  const removeInviteField = (index: number) => {
    if (teamInviteData.invites.length <= 1) return;
    
    setTeamInviteData(prev => ({
      invites: prev.invites.filter((_, i) => i !== index)
    }));
  };
  
  const updateInviteField = (index: number, field: keyof TeamMemberInvite, value: any) => {
    setTeamInviteData(prev => {
      const newInvites = [...prev.invites];
      newInvites[index] = { ...newInvites[index], [field]: value };
      return { invites: newInvites };
    });
  };

  return {
    teamInviteData,
    setTeamInviteData,
    handleTeamInvites,
    addInviteField,
    removeInviteField,
    updateInviteField,
    isSubmitting
  };
}
