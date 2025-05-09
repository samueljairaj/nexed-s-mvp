
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
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamInviteData, setTeamInviteData] = useState<TeamInviteFormData>({
    invites: [{ email: "", role: "dso_viewer" }]
  });
  
  // Add a new invite field to the form
  const addInviteField = () => {
    setTeamInviteData(prev => ({
      invites: [...prev.invites, { email: "", role: "dso_viewer" }]
    }));
  };
  
  // Remove an invite field from the form
  const removeInviteField = (index: number) => {
    setTeamInviteData(prev => ({
      invites: prev.invites.filter((_, i) => i !== index)
    }));
  };
  
  // Update an invite field value
  const updateInviteField = (index: number, field: keyof TeamMemberInvite, value: string) => {
    setTeamInviteData(prev => {
      const newInvites = [...prev.invites];
      newInvites[index] = { 
        ...newInvites[index], 
        [field]: value 
      };
      return { invites: newInvites };
    });
  };
  
  // Handle team invites submission
  const handleTeamInvites = async (data: TeamInviteFormData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Filter out empty email invites
      const validInvites = data.invites.filter(invite => invite.email.trim() !== '');
      
      if (validInvites.length === 0) {
        // No invites to send, but this is ok
        toast.success("Team setup complete!");
        return true;
      }
      
      // Get the DSO's university_id to associate with invites
      const { data: dsoProfile, error: dsoError } = await supabase
        .from('dso_profiles')
        .select('university_id')
        .eq('id', currentUser?.id)
        .single();
      
      if (dsoError || !dsoProfile?.university_id) {
        throw new Error("Could not find your university information");
      }
      
      // Process each invite
      const invitePromises = validInvites.map(async (invite) => {
        // Check if the user already exists
        const { data: existingUsers, error: userError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', invite.email.toLowerCase());
        
        if (userError) throw userError;
        
        let userId;
        
        if (existingUsers && existingUsers.length > 0) {
          // User exists, use their ID
          userId = existingUsers[0].id;
          
          // Check if they already have a DSO profile
          const { data: existingDsoProfile } = await supabase
            .from('dso_profiles')
            .select('id')
            .eq('id', userId);
            
          if (existingDsoProfile && existingDsoProfile.length > 0) {
            return { email: invite.email, status: 'already_dso', userId };
          }
          
          // Create DSO profile for existing user
          await supabase
            .from('dso_profiles')
            .insert({
              id: userId,
              role: invite.role,
              university_id: dsoProfile.university_id
            });
          
          // Update their profile to have DSO role
          await supabase
            .from('profiles')
            .update({ role: 'dso' })
            .eq('id', userId);
            
          return { email: invite.email, status: 'profile_created', userId };
        } else {
          // Create a join request using fetch API directly
          const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dmmyriqbltjrtvvpllmz.supabase.co';
          const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbXlyaXFibHRqcnR2dnBsbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzY2OTAsImV4cCI6MjA2MjE1MjY5MH0.xw4zI0aDw9tYU7cJwSa9RcaE2nhl-juZpXTcnbsgfrU';

          const createResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/university_join_requests`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                user_id: currentUser?.id, // This is the inviter's ID
                university_id: dsoProfile.university_id,
                requested_role: invite.role,
                status: 'pending',
                invitee_email: invite.email.toLowerCase() // Store the invitee's email
              })
            }
          );
          
          if (!createResponse.ok) {
            throw new Error(`Failed to create invite: ${createResponse.statusText}`);
          }
          
          return { email: invite.email, status: 'invited' };
        }
      });
      
      // Wait for all invites to process
      const results = await Promise.all(invitePromises);
      
      // Show summary toast
      const created = results.filter(r => r.status === 'profile_created').length;
      const invited = results.filter(r => r.status === 'invited').length;
      const existing = results.filter(r => r.status === 'already_dso').length;
      
      let message = "Team setup complete! ";
      if (created > 0) message += `${created} team member(s) added. `;
      if (invited > 0) message += `${invited} invitation(s) sent. `;
      if (existing > 0) message += `${existing} already team members.`;
      
      toast.success(message);
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
