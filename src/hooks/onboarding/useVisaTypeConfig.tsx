
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface VisaTypeConfigFormData {
  visaTypes: string[];
}

export function useVisaTypeConfig() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visaConfigData, setVisaConfigData] = useState<VisaTypeConfigFormData>({
    visaTypes: ['F1']
  });
  
  const handleVisaTypeConfig = async (data: VisaTypeConfigFormData): Promise<boolean> => {
    setVisaConfigData(data);
    setIsSubmitting(true);
    
    try {
      // Get DSO profile to get university_id
      const { data: dsoProfile, error: dsoError } = await supabase
        .from('dso_profiles')
        .select('university_id')
        .eq('id', currentUser?.id)
        .single();
      
      if (dsoError) throw dsoError;
      
      // Update university config
      const { error: configError } = await supabase
        .from('university_configs')
        .update({ 
          visa_types_supported: data.visaTypes 
        })
        .eq('id', dsoProfile.university_id);
      
      if (configError) throw configError;
      
      toast.success("Visa types updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Failed to update visa types:", error);
      toast.error(`Failed to update visa types: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    visaConfigData,
    setVisaConfigData,
    handleVisaTypeConfig,
    isSubmitting
  };
}
