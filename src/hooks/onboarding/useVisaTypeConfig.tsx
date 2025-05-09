
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
    visaTypes: ["F1", "J1", "H1B", "CPT", "OPT", "STEM_OPT"]
  });

  const handleVisaTypeConfig = async (data: VisaTypeConfigFormData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Since university_configs doesn't exist in our tables list,
      // we'll use compliance_rules table to store this configuration
      const visaTypesSupported = data.visaTypes.join(',');
      
      // Create a university config entry in compliance_rules
      const { error } = await supabase
        .from('compliance_rules')
        .insert({
          name: 'University Visa Types Configuration',
          group_name: 'university_config',
          description: 'Supported visa types for this university',
          condition_logic: `visa_type IN (${visaTypesSupported})`,
          required_documents: JSON.stringify(data.visaTypes)
        });
      
      if (error) {
        console.error("Error saving visa types configuration:", error);
        toast.error("Failed to save visa types configuration");
        return false;
      }

      // Update state
      setVisaConfigData(data);
      toast.success("Visa types configuration saved successfully!");
      return true;
    } catch (error) {
      console.error("Error in visa type config:", error);
      toast.error("Failed to update visa types");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    visaConfigData,
    handleVisaTypeConfig,
    isSubmitting
  };
}
