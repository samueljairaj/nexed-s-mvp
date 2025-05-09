
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
      case 'STEM OPT':
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
        .select('university_id')
        .eq('id', currentUser?.id)
        .single();
      
      if (dsoError) throw dsoError;
      
      // Check if rule exists first
      const { data: existingRules } = await supabase
        .from('university_document_rules')
        .select('id')
        .eq('university_id', dsoProfile.university_id)
        .eq('visa_type', data.visaType);
      
      const documentRequirements = data.documentRequirements.reduce((acc: Record<string, any>, doc) => {
        acc[doc.id] = {
          name: doc.name,
          required: doc.required,
          description: doc.description || ''
        };
        return acc;
      }, {});
      
      if (existingRules && existingRules.length > 0) {
        // Update existing rule
        const { error } = await supabase
          .from('university_document_rules')
          .update({ 
            document_requirements: documentRequirements 
          })
          .eq('id', existingRules[0].id);
        
        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('university_document_rules')
          .insert({ 
            university_id: dsoProfile.university_id,
            visa_type: data.visaType,
            document_requirements: documentRequirements
          });
        
        if (error) throw error;
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
