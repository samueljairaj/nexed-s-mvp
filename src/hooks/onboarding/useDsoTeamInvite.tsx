
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TeamMemberInvite {
  email: string;
  role: "dso_admin" | "dso_viewer";
}

export interface TeamInviteFormData {
  invites: TeamMemberInvite[];
}

export function useDsoTeamInvite() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamInviteData, setTeamInviteData] = useState<TeamInviteFormData>({
    invites: [{ email: "", role: "dso_viewer" }]
  });
  
  // Helper to add new invite fields
  const addInviteField = () => {
    setTeamInviteData(prev => ({
      ...prev,
      invites: [...prev.invites, { email: "", role: "dso_viewer" }]
    }));
  };
  
  // Helper to remove invite fields
  const removeInviteField = (index: number) => {
    if (teamInviteData.invites.length <= 1) return;
    
    const updatedInvites = teamInviteData.invites.filter((_, i) => i !== index);
    setTeamInviteData({ invites: updatedInvites });
  };
  
  // Helper to update a specific invite field
  const updateInviteField = (index: number, field: keyof TeamMemberInvite, value: string) => {
    const updatedInvites = [...teamInviteData.invites];
    if (field === 'role') {
      updatedInvites[index] = {
        ...updatedInvites[index],
        [field]: value as "dso_admin" | "dso_viewer"
      };
    } else {
      updatedInvites[index] = {
        ...updatedInvites[index],
        [field]: value
      };
    }
    
    setTeamInviteData({ invites: updatedInvites });
  };
  
  // Handle team invites submission - simplified version without DSO functionality
  const handleTeamInvites = async (data: TeamInviteFormData): Promise<boolean> => {
    // First, validate that all emails are provided
    const invalidEmails = data.invites.filter(invite => !invite.email.trim());
    if (invalidEmails.length > 0) {
      toast.error("Please provide email addresses for all team members");
      return false;
    }
    
    setTeamInviteData(data);
    setIsSubmitting(true);
    
    try {
      // Since we've removed DSO functionality, we'll simplify this function
      // Just simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Team invitations simulated successfully");
      return true;
    } catch (error: any) {
      console.error("Failed to process team invites:", error);
      toast.error(`Failed to process team invites: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
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
