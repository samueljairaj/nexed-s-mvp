
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UniversityInfoFormData } from "@/components/onboarding/UniversityInfoStep";

export function useUniversityInfo() {
  const { currentUser, updateProfile } = useAuth();
  const [universityData, setUniversityData] = useState<Partial<UniversityInfoFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle university information setup
  const handleUniversityInfoSetup = async (data: UniversityInfoFormData): Promise<boolean> => {
    if (!currentUser) {
      toast.error("No user is currently logged in");
      return false;
    }

    setIsSubmitting(true);
    setUniversityData(data);

    try {
      // First, check if university already exists
      const { data: existingUniversity, error: searchError } = await supabase
        .from('universities')
        .select('id')
        .eq('name', data.universityName)
        .eq('country', data.country)
        .maybeSingle();

      // If there was an error searching for the university
      if (searchError) {
        console.error("Error checking university:", searchError);
        toast.error("Failed to process university information");
        return false;
      }

      let universityId = existingUniversity?.id;

      // If university doesn't exist, create it
      if (!universityId) {
        const { data: newUniversity, error: createError } = await supabase
          .from('universities')
          .insert({
            name: data.universityName,
            country: data.country,
            sevis_id: data.sevisId,
            website: data.universityWebsite || null
          })
          .select('id')
          .single();

        if (createError) {
          console.error("Error creating university:", createError);
          toast.error("Failed to create university record");
          return false;
        }

        universityId = newUniversity.id;
      }

      // Update user profile with university ID
      await updateProfile({
        universityId,
        university: data.universityName,
      });

      // Update or create DSO profile
      const dsoProfileData = {
        id: currentUser.id,
        title: data.primaryDsoTitle,
        department: "International Student Services",
        office_location: data.internationalOfficeLocation,
        office_hours: data.officeHours,
        contact_email: data.primaryDsoEmail,
        contact_phone: data.primaryDsoPhone
      };

      // Check if DSO profile exists
      const { data: existingProfile } = await supabase
        .from('dso_profiles')
        .select('id')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('dso_profiles')
          .update(dsoProfileData)
          .eq('id', currentUser.id);

        if (updateError) {
          console.error("Error updating DSO profile:", updateError);
          toast.error("Failed to update DSO profile");
          return false;
        }
      } else {
        // Create new DSO profile
        const { error: insertError } = await supabase
          .from('dso_profiles')
          .insert([dsoProfileData]);

        if (insertError) {
          console.error("Error creating DSO profile:", insertError);
          toast.error("Failed to create DSO profile");
          return false;
        }
      }

      toast.success("University information saved successfully");
      return true;
    } catch (error: any) {
      console.error("Error in university info setup:", error);
      toast.error(`Failed to save university information: ${error.message}`);
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
