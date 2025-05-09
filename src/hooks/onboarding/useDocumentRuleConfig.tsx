
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentRequirement {
  id: string;
  name: string;
  required: boolean;
  description?: string;
}

export interface DocumentRuleConfigFormData {
  visaType: string;
  documentRequirements: DocumentRequirement[];
}

export function useDocumentRuleConfig() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentRuleData, setDocumentRuleData] = useState<DocumentRuleConfigFormData>({
    visaType: 'F1',
    documentRequirements: []
  });
  
  // Common document types by visa category
  const getDefaultDocuments = (visaType: string): DocumentRequirement[] => {
    const commonDocs = [
      { id: 'passport', name: 'Passport', required: true, description: 'Valid passport' },
      { id: 'visa', name: 'Visa Stamp', required: true, description: 'Valid visa stamp' }
    ];
    
    switch(visaType) {
      case 'F1':
        return [
          ...commonDocs,
          { id: 'i20', name: 'I-20', required: true, description: 'Form I-20' },
          { id: 'i94', name: 'I-94', required: true, description: 'Arrival/Departure Record' }
        ];
      case 'OPT':
        return [
          ...commonDocs,
          { id: 'i20', name: 'I-20 with OPT Endorsement', required: true },
          { id: 'ead', name: 'EAD Card', required: true },
          { id: 'i765', name: 'I-765 Approval Notice', required: false }
        ];
      case 'STEM_OPT':
        return [
          ...commonDocs,
          { id: 'i20', name: 'I-20 with STEM OPT Endorsement', required: true },
          { id: 'i983', name: 'Form I-983', required: true },
          { id: 'ead', name: 'EAD Card', required: true }
        ];
      case 'CPT':
        return [
          ...commonDocs,
          { id: 'i20', name: 'I-20 with CPT Authorization', required: true },
          { id: 'offer_letter', name: 'Employer Offer Letter', required: true }
        ];
      case 'H1B':
        return [
          ...commonDocs,
          { id: 'i797', name: 'I-797 Approval Notice', required: true },
          { id: 'lca', name: 'Labor Condition Application', required: false }
        ];
      default:
        return commonDocs;
    }
  };
  
  const handleVisaTypeChange = (visaType: string) => {
    setDocumentRuleData(prev => ({
      visaType,
      documentRequirements: getDefaultDocuments(visaType)
    }));
  };
  
  const handleDocumentRuleConfig = async (data: DocumentRuleConfigFormData): Promise<boolean> => {
    setDocumentRuleData(data);
    setIsSubmitting(true);
    
    try {
      // Get DSO profile to get university_id
      const { data: dsoProfile, error: dsoError } = await supabase
        .from('dso_profiles')
        .select('*')
        .eq('id', currentUser?.id)
        .single();
      
      if (dsoError) throw dsoError;
      
      if (!dsoProfile || !dsoProfile.university_id) {
        throw new Error("University ID not found in DSO profile");
      }
      
      const documentRequirements = data.documentRequirements.reduce((acc: Record<string, any>, doc) => {
        acc[doc.id] = {
          name: doc.name,
          required: doc.required,
          description: doc.description || ''
        };
        return acc;
      }, {});
      
      // We need to use a customized approach since university_document_rules isn't in the types yet
      // Check if rule exists first
      const { data: existingRules, error: queryError } = await fetch(
        `${supabase.supabaseUrl}/rest/v1/university_document_rules?university_id=eq.${dsoProfile.university_id}&visa_type=eq.${data.visaType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          }
        }
      ).then(res => res.json());
      
      if (queryError) throw queryError;
      
      if (existingRules && existingRules.length > 0) {
        // Update existing rule
        const response = await fetch(
          `${supabase.supabaseUrl}/rest/v1/university_document_rules?id=eq.${existingRules[0].id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${supabase.supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
              document_requirements: documentRequirements 
            })
          }
        );
        
        if (!response.ok) throw new Error('Failed to update document requirements');
      } else {
        // Create new rule
        const response = await fetch(
          `${supabase.supabaseUrl}/rest/v1/university_document_rules`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${supabase.supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
              university_id: dsoProfile.university_id,
              visa_type: data.visaType,
              document_requirements: documentRequirements
            })
          }
        );
        
        if (!response.ok) throw new Error('Failed to create document requirements');
      }
      
      toast.success("Document requirements updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Failed to update document requirements:", error);
      toast.error(`Failed to update document requirements: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    documentRuleData,
    setDocumentRuleData,
    handleVisaTypeChange,
    handleDocumentRuleConfig,
    getDefaultDocuments,
    isSubmitting
  };
}
