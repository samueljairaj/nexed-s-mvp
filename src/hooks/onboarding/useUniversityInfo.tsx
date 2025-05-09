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
  const { currentUser, updateProfile, updateDSOProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universityData, setUniversityData] = useState<UniversityInfoFormData>({
    name: "",
    country: "",
    website: "",
    sevisId: "",
  });

  const handleUniversityInfoSetup = async (data: UniversityInfoFormData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // First, create or get the university record
      let universityId: string;
      
      // Check if the university already exists
      const { data: existingUniversity, error: existingError } = await supabase
        .from('universities')
        .select('id')
        .eq('name', data.name)
        .single();
        
      if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw existingError;
      }
      
      if (existingUniversity) {
        // University already exists, use its ID
        universityId = existingUniversity.id;
      } else {
        // Create a new university record
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
          
        if (createError) throw createError;
        universityId = newUniversity.id;
      }
      
      // Update the user's profile with the university information
      await updateProfile({
        university: data.name,
        university_id: universityId
      });
      
      // If the user is a DSO, update their DSO profile as well
      // We won't add university_id to DSO profile as it doesn't have that column
      await updateDSOProfile({
        // No university_id field in the DSO profile
      });
      
      // Update state
      setUniversityData(data);
      toast.success("University information saved successfully!");
      return true;
    } catch (error) {
      console.error("Error in university info setup:", error);
      toast.error("Failed to set up university information");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    universityData,
    handleUniversityInfoSetup,
    isSubmitting,
  };
}
