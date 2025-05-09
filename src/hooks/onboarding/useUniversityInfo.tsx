
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface UniversityFormData {
  name: string;
  location: string;
  sevisId: string;
  action: "create" | "join";
  existingUniversityId?: string;
}

export function useUniversityInfo() {
  const { currentUser, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [universityData, setUniversityData] = useState<Partial<UniversityFormData>>({
    name: "",
    location: "",
    sevisId: "",
    action: "create"
  });
  
  // Fetch existing universities
  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name, country, sevis_id');
      
      if (error) throw error;
      setUniversities(data || []);
      return data;
    } catch (error: any) {
      console.error("Error fetching universities:", error);
      return [];
    }
  };

  // Handle university setup - either create new or join existing
  const handleUniversityInfoSetup = async (data: UniversityFormData): Promise<boolean> => {
    setUniversityData(data);
    setIsSubmitting(true);
    
    try {
      let universityId: string;
      
      // Create or join university based on action
      if (data.action === "create") {
        // Create new university
        const { data: newUniversity, error } = await supabase
          .from('universities')
          .insert({
            name: data.name,
            country: data.location,
            sevis_id: data.sevisId
          })
          .select('id')
          .single();
        
        if (error) throw error;
        universityId = newUniversity.id;
        
        // Create university config
        await supabase
          .from('university_configs')
          .insert({
            id: universityId,
            visa_types_supported: ['F1']
          });
          
      } else {
        // Join existing university
        universityId = data.existingUniversityId || '';
        
        // Create join request if not admin
        await supabase
          .from('university_join_requests')
          .insert({
            university_id: universityId,
            user_id: currentUser?.id || '',
            requested_role: 'dso_viewer',
            status: 'pending'
          });
      }
      
      // Update DSO profile with university_id
      const { error: profileError } = await supabase
        .from('dso_profiles')
        .update({ 
          university_id: universityId,
          role: 'dso_admin' // First user for a university is always admin
        })
        .eq('id', currentUser?.id);
      
      if (profileError) throw profileError;
      
      // Update user profile
      await updateProfile({ university: data.name });
      
      toast.success(data.action === "create" 
        ? "University created successfully!" 
        : "University join request submitted!");
      
      return true;
    } catch (error: any) {
      console.error("Failed to setup university:", error);
      toast.error(`Failed to ${data.action} university: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    universityData,
    setUniversityData,
    handleUniversityInfoSetup,
    fetchUniversities,
    universities,
    isSubmitting
  };
}
