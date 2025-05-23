import { Document, DocumentStatus } from "@/types/document";

// Calculate document status based on expiry date
export const getDocumentStatus = (expiryDate: string): "valid" | "expiring" | "expired" => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  
  // If expiry date is in the past, document is expired
  if (expiry < now) {
    return "expired";
  }
  
  // If expiry date is within 30 days, document is expiring soon
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  if (expiry <= thirtyDaysFromNow) {
    return "expiring";
  }
  
  // Otherwise document is valid
  return "valid";
};

// Get status badge color based on status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "valid":
      return "bg-green-100 text-green-700";
    case "expiring":
      return "bg-amber-100 text-amber-700";
    case "expired":
      return "bg-red-100 text-red-700";
    case "verified":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Format date in a human-readable format
export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric", 
      month: "short", 
      day: "numeric"
    });
  } catch (e) {
    return "Invalid Date";
  }
};

// Convert a list of documents to a folder structure
export const organizeDocumentsIntoFolders = (documents: Document[]): { folders: Record<string, Document[]>, rootDocuments: Document[] } => {
  const folders: Record<string, Document[]> = {};
  const rootDocuments: Document[] = [];
  
  documents.forEach(doc => {
    if (doc.folderId) {
      if (!folders[doc.folderId]) {
        folders[doc.folderId] = [];
      }
      folders[doc.folderId].push(doc);
    } else {
      rootDocuments.push(doc);
    }
  });
  
  return { folders, rootDocuments };
};

// Detect document type based on filename and content
export const detectDocumentType = (fileName: string): string | null => {
  fileName = fileName.toLowerCase();
  
  if (fileName.includes("passport")) return "Passport";
  if (fileName.includes("i-20") || fileName.includes("i20")) return "I-20";
  if (fileName.includes("i-94") || fileName.includes("i94")) return "I-94";
  if (fileName.includes("visa")) return "Visa";
  if (fileName.includes("insurance")) return "Insurance";
  if (fileName.includes("transcript")) return "Transcript";
  if (fileName.includes("diploma")) return "Diploma";
  if (fileName.includes("offer") || fileName.includes("employment")) return "Employment";
  if (fileName.includes("lease") || fileName.includes("rental")) return "Housing";
  if (fileName.includes("bank") || fileName.includes("statement")) return "Financial";
  if (fileName.includes("driver") || fileName.includes("license")) return "ID";
  
  return null;
};

// Suggest tags based on document name and category
export const suggestDocumentTags = (name: string, category: string): string[] => {
  const nameLower = name.toLowerCase();
  const tags: string[] = [];
  
  // Add category as a tag
  tags.push(category);
  
  // Document type specific tags
  if (nameLower.includes("passport")) tags.push("identification");
  if (nameLower.includes("visa")) tags.push("immigration");
  if (nameLower.includes("i-20") || nameLower.includes("i20")) tags.push("sevis", "immigration");
  if (nameLower.includes("insurance")) tags.push("health");
  
  // Time-based tags
  if (nameLower.includes("2023")) tags.push("2023");
  if (nameLower.includes("2024")) tags.push("2024");
  if (nameLower.includes("2025")) tags.push("2025");
  
  return tags.slice(0, 5); // Limit to 5 tags
};

// Check if document is expiring soon
export const isDocumentExpiring = (expiryDate?: string, daysThreshold = 30): boolean => {
  if (!expiryDate) return false;
  
  try {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 && diffDays <= daysThreshold;
  } catch (e) {
    return false;
  }
};
