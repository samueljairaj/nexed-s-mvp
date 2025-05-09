
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface UniversityInfoFormData {
  action: "create" | "join";
  name: string;
  location: string;
  sevisId: string;
  existingUniversityId?: string;
}

export function useUniversityInfo() {
  const { currentUser, updateProfile, isDSO, dsoProfile, updateDSOProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universityData, setUniversityData] = useState<Partial<UniversityInfoFormData>>({
    action: "create",
    name: "",
    location: "",
    sevisId: ""
  });

  const handleUniversityInfoSetup = async (data: UniversityInfoFormData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Joining an existing university
      if (data.action === "join" && data.existingUniversityId) {
        // First update profile with university_id
        if (!isDSO) {
          // For student users
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              university_id: data.existingUniversityId,
              university: data.name // Store university name for display purposes
            })
            .eq('id', currentUser?.id);
            
          if (profileError) {
            throw profileError;
          }
        } else {
          // For DSO users, update the DSO profile
          const { error: dsoProfileError } = await supabase
            .from('dso_profiles')
            .update({
              university_id: data.existingUniversityId
            })
            .eq('id', currentUser?.id);
            
          if (dsoProfileError) {
            throw dsoProfileError;
          }
        }
        
        // Since university_join_requests table doesn't exist in our schema,
        // we'll create an entry in the existing tables
        if (isDSO) {
          // For DSOs, update their profiles directly since they would typically be approved automatically
          await updateDSOProfile({ 
            university_id: data.existingUniversityId 
          });
        }
        
        toast.success("University join request submitted successfully!");
        setUniversityData(data);
        return true;
      } 
      // Creating a new university
      else if (data.action === "create") {
        // Create new university
        const { data: newUniversity, error: universityError } = await supabase
          .from('universities')
          .insert({
            name: data.name,
            country: data.location,
            sevis_id: data.sevisId
          })
          .select()
          .single();
          
        if (universityError) {
          throw universityError;
        }
        
        // Update the user profile with the new university
        if (isDSO) {
          // For DSO, update the DSO profile
          await updateDSOProfile({ 
            university_id: newUniversity.id 
          });
        } else {
          // For student
          await updateProfile({
            university_id: newUniversity.id,
            university: data.name
          });
        }
        
        toast.success("University created successfully!");
        setUniversityData(data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error with university setup:", error);
      toast.error("University setup failed. Please try again.");
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
