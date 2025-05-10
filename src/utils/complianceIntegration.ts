
import { AITask } from "@/hooks/useAICompliance";
import { Document, DocumentStatus } from "@/types/document";
import { toast } from "sonner";
import { logDsoAccess } from "./accessControl";
import { supabase } from "@/integrations/supabase/client";

// Interface to track document compliance requirements
interface DocumentRequirement {
  documentType: string;
  taskId: string;
  status: "missing" | "present" | "expired";
  matchingDocumentId?: string;
}

// Check if uploaded documents satisfy compliance requirements
export const checkDocumentCompliance = async (
  tasks: AITask[],
  documents: Document[]
): Promise<DocumentRequirement[]> => {
  const documentRequirements: DocumentRequirement[] = [];
  
  // Keywords to identify document types in task descriptions
  const documentTypes = [
    { type: "passport", keywords: ["passport"] },
    { type: "visa", keywords: ["visa", "f1", "j1", "h1b"] },
    { type: "i20", keywords: ["i-20", "i20", "sevis"] },
    { type: "ead", keywords: ["ead", "employment authorization"] },
    { type: "admission", keywords: ["admission letter", "acceptance"] },
    { type: "lease", keywords: ["lease", "rental agreement"] },
    { type: "insurance", keywords: ["insurance"] }
  ];
  
  // Extract document requirements from compliance tasks
  tasks.forEach(task => {
    // Look for document-related tasks
    const lowerDesc = task.description.toLowerCase();
    
    documentTypes.forEach(docType => {
      if (docType.keywords.some(keyword => lowerDesc.includes(keyword))) {
        // Check if any uploaded document matches this requirement
        const matchingDoc = documents.find(doc => 
          docType.keywords.some(keyword => doc.name.toLowerCase().includes(keyword))
        );
        
        if (matchingDoc) {
          // Log access if the current user is a DSO
          if (matchingDoc.user_id) {
            try {
              // Just check if current user is a DSO
              supabase.rpc('is_dso')
                .then(({ data: isDso }) => {
                  if (isDso) {
                    // Log the access
                    logDsoAccess('document', matchingDoc.id);
                  }
                });
            } catch (error) {
              // Silently continue if access check fails
              console.error("Error checking DSO status:", error);
            }
          }
          
          const status = matchingDoc.status === "expired" ? "expired" : "present";
          documentRequirements.push({
            documentType: docType.type,
            taskId: task.id,
            status: status,
            matchingDocumentId: matchingDoc.id
          });
        } else {
          documentRequirements.push({
            documentType: docType.type,
            taskId: task.id,
            status: "missing"
          });
        }
      }
    });
  });
  
  return documentRequirements;
};

// Update compliance tasks based on uploaded documents
export const updateComplianceTasks = (
  tasks: AITask[],
  documentRequirements: DocumentRequirement[]
): AITask[] => {
  return tasks.map(task => {
    // Find if this task has document requirements
    const relatedRequirement = documentRequirements.find(req => req.taskId === task.id);
    
    if (relatedRequirement) {
      if (relatedRequirement.status === "present") {
        // Mark task as completed
        return { ...task, completed: true };
      } else if (relatedRequirement.status === "expired") {
        // Keep task incomplete but highlight that document is expired
        return { 
          ...task, 
          completed: false, 
          description: `${task.description} (Document is expired)`
        };
      }
    }
    
    return task;
  });
};

// Check for document-related compliance issues
export const getDocumentComplianceIssues = (
  documents: Document[]
): string[] => {
  const issues: string[] = [];
  
  // Check for expired documents
  const expiredDocs = documents.filter(doc => doc.status === "expired" && doc.required);
  if (expiredDocs.length > 0) {
    issues.push(`${expiredDocs.length} required document(s) are expired`);
  }
  
  // Check for soon-to-expire documents
  const expiringDocs = documents.filter(doc => doc.status === "expiring" && doc.required);
  if (expiringDocs.length > 0) {
    issues.push(`${expiringDocs.length} required document(s) are expiring soon`);
  }
  
  // Check for missing required document types (basic check)
  const criticalDocTypes = ["passport", "visa", "i20"];
  criticalDocTypes.forEach(docType => {
    if (!documents.some(doc => doc.name.toLowerCase().includes(docType) && doc.required)) {
      issues.push(`Missing required ${docType} document`);
    }
  });
  
  return issues;
};

// Notify users of compliance issues - Fixed to use plain text instead of JSX
export const notifyComplianceIssues = (issues: string[]): void => {
  if (issues.length > 0) {
    toast("Document compliance issues detected", {
      description: issues.join('\n'),
      duration: 7000,
    });
  }
};
