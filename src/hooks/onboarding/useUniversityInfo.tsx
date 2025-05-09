
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface UniversityInfoFormData {
  name: string;
  country: string;
  website?: string;
  sevisId?: string;
}

export function useUniversityInfo() {
  const { currentUser, updateProfile, dsoProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universityData, setUniversityData] = useState<Partial<UniversityInfoFormData>>({
    name: "",
    country: "United States",
    website: "",
    sevisId: ""
  });
  
  const handleUniversityInfoSetup = async (data: UniversityInfoFormData): Promise<boolean> => {
    setUniversityData(data);
    setIsSubmitting(true);
    
    try {
      // First check if the university already exists by name
      const { data: existingUniversities, error: searchError } = await supabase
        .from('universities')
        .select('*')
        .ilike('name', data.name)
        .limit(1);
        
      if (searchError) {
        throw searchError;
      }
      
      let universityId;
      
      if (existingUniversities && existingUniversities.length > 0) {
        // University exists, use the existing ID
        universityId = existingUniversities[0].id;
      } else {
        // Create a new university
        const { data: newUniversity, error: createError } = await supabase
          .from('universities')
          .insert({
            name: data.name,
            country: data.country,
            website: data.website,
            sevis_id: data.sevisId
          })
          .select('id')
          .single();
          
        if (createError) {
          throw createError;
        }
        
        universityId = newUniversity.id;
      }
      
      // Update the user's profile with the university ID and name
      await updateProfile({
        university: data.name,
        university_id: universityId
      });
      
      // If we couldn't establish a direct connection, send a request to admins
      if (dsoProfile) {
        // Directly use fetch API as university_join_requests table may not be in the types
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dmmyriqbltjrtvvpllmz.supabase.co';
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbXlyaXFibHRqcnR2dnBsbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzY2OTAsImV4cCI6MjA2MjE1MjY5MH0.xw4zI0aDw9tYU7cJwSa9RcaE2nhl-juZpXTcnbsgfrU';
      
        // This is a fallback for tables that might not be in the schema yet
        try {
          await fetch(
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
                user_id: currentUser?.id,
                university_id: universityId,
                status: 'pending',
                created_at: new Date().toISOString()
              })
            }
          );
        } catch (fetchError) {
          console.warn("Could not create university join request:", fetchError);
          // Non-critical error, continue
        }
      }
      
      toast.success(`Successfully set up university information for ${data.name}`);
      return true;
    } catch (error: any) {
      console.error("Failed to set up university information:", error);
      toast.error(`Failed to set up university information: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    universityData,
    setUniversityData,
    handleUniversityInfoSetup,
    isSubmitting
  };
}
