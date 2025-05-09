
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMemberInvite {
  email: string;
  role: "dso_admin" | "dso_viewer";
}

export interface TeamInviteFormData {
  invites: TeamMemberInvite[];
}

export function useDsoTeamInvite() {
  const { currentUser, dsoProfile } = useAuth();
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
  
  // Handle team invites submission
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
      // Use university_id from the currentUser if available
      const universityId = dsoProfile?.university_id || null;
      
      if (!universityId) {
        throw new Error("University information missing. Please set up university information first.");
      }
      
      // Process each invitation
      const invitePromises = data.invites.map(async (invite) => {
        try {
          // We need to use fetch API directly as dso_invites may not be in the generated types
          const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dmmyriqbltjrtvvpllmz.supabase.co';
          const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbXlyaXFibHRqcnR2dnBsbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzY2OTAsImV4cCI6MjA2MjE1MjY5MH0.xw4zI0aDw9tYU7cJwSa9RcaE2nhl-juZpXTcnbsgfrU';
          
          // Create the invitation
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/dso_invites`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                email: invite.email,
                role: invite.role,
                inviter_id: currentUser?.id,
                university_id: universityId,
                status: "pending",
                created_at: new Date().toISOString()
              })
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to create invitation: ${response.statusText}`);
          }
          
          return true;
        } catch (error: any) {
          console.error(`Error inviting ${invite.email}:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(invitePromises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount === 0) {
        toast.error("Failed to send any invitations");
        return false;
      } else if (successCount < data.invites.length) {
        toast.warning(`Sent ${successCount} of ${data.invites.length} invitations. Some failed.`);
        return true; // Return true to allow continuing the flow
      } else {
        toast.success(`Successfully sent ${successCount} invitations`);
        return true;
      }
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
