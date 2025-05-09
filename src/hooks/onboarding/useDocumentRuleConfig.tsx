
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { currentUser, dsoProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentRuleData, setDocumentRuleData] = useState<DocumentRuleConfigFormData>({
    visaType: 'F1',
    documentRequirements: []
  });
  
  // Handle visa type change
  const handleVisaTypeChange = (visaType: string) => {
    setDocumentRuleData(prev => ({
      ...prev,
      visaType
    }));
  };
  
  // Get default documents for a visa type
  const getDefaultDocuments = (visaType: string): DocumentRequirement[] => {
    // Default document requirements based on visa type
    switch (visaType) {
      case 'F1':
        return [
          { id: "passport", name: "Passport", required: true, description: "Valid passport with expiration date" },
          { id: "visa", name: "F-1 Visa", required: true, description: "Valid F-1 student visa" },
          { id: "i20", name: "I-20 Form", required: true, description: "Form I-20 issued by university" },
          { id: "i94", name: "I-94 Record", required: true, description: "Arrival/Departure record" }
        ];
      case 'OPT':
        return [
          { id: "ead", name: "EAD Card", required: true, description: "Employment Authorization Document" },
          { id: "i20", name: "I-20 with OPT Endorsement", required: true, description: "I-20 showing OPT approval" },
          { id: "i765_receipt", name: "I-765 Receipt", required: false, description: "Receipt notice for I-765 application" }
        ];
      case 'CPT':
        return [
          { id: "i20_cpt", name: "I-20 with CPT Authorization", required: true, description: "I-20 showing CPT approval" },
          { id: "offer_letter", name: "Employment Offer Letter", required: true, description: "Offer letter from employer" },
          { id: "course_enrollment", name: "Course Enrollment Proof", required: true, description: "Proof of enrollment in related course" }
        ];
      case 'STEM_OPT':
        return [
          { id: "ead_stem", name: "STEM OPT EAD Card", required: true, description: "STEM OPT Employment Authorization Document" },
          { id: "i20_stem", name: "I-20 with STEM OPT Endorsement", required: true, description: "I-20 showing STEM OPT approval" },
          { id: "i983", name: "Form I-983", required: true, description: "Training Plan for STEM OPT" }
        ];
      case 'J1':
        return [
          { id: "ds2019", name: "DS-2019 Form", required: true, description: "Certificate of Eligibility for Exchange Visitor Status" },
          { id: "j1_visa", name: "J-1 Visa", required: true, description: "Valid J-1 exchange visitor visa" },
          { id: "insurance", name: "Health Insurance", required: true, description: "Proof of health insurance coverage" }
        ];
      case 'H1B':
        return [
          { id: "i797", name: "I-797 Approval Notice", required: true, description: "H-1B approval notice" },
          { id: "lca", name: "Labor Condition Application", required: false, description: "Approved LCA for position" }
        ];
      default:
        return [
          { id: "passport", name: "Passport", required: true, description: "Valid passport" },
          { id: "visa", name: "Visa Document", required: true, description: "Valid visa document" }
        ];
    }
  };
  
  // Handle document rule configuration
  const handleDocumentRuleConfig = async (data: DocumentRuleConfigFormData): Promise<boolean> => {
    setDocumentRuleData(data);
    setIsSubmitting(true);
    
    try {
      if (!dsoProfile || !dsoProfile.university_id) {
        throw new Error("University information not found");
      }
      
      // We need to use fetch API directly as university_document_rules is not in the types
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dmmyriqbltjrtvvpllmz.supabase.co';
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbXlyaXFibHRqcnR2dnBsbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzY2OTAsImV4cCI6MjA2MjE1MjY5MH0.xw4zI0aDw9tYU7cJwSa9RcaE2nhl-juZpXTcnbsgfrU';
      
      // Check if a rule already exists for this visa type
      const checkResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/university_document_rules?university_id=eq.${dsoProfile.university_id}&visa_type=eq.${data.visaType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      
      const existingRules = await checkResponse.json();
      
      if (existingRules && existingRules.length > 0) {
        // Update existing rule
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/university_document_rules?id=eq.${existingRules[0].id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              document_requirements: data.documentRequirements,
              updated_at: new Date().toISOString()
            })
          }
        );
        
        if (!updateResponse.ok) {
          throw new Error(`Failed to update document rules: ${updateResponse.statusText}`);
        }
      } else {
        // Create new rule
        const createResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/university_document_rules`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              university_id: dsoProfile.university_id,
              visa_type: data.visaType,
              document_requirements: data.documentRequirements,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        );
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create document rules: ${createResponse.statusText}`);
        }
      }
      
      toast.success("Document requirements updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Failed to configure document rules:", error);
      toast.error(`Failed to configure document rules: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    documentRuleData,
    setDocumentRuleData,
    handleDocumentRuleConfig,
    handleVisaTypeChange,
    getDefaultDocuments,
    isSubmitting
  };
}
