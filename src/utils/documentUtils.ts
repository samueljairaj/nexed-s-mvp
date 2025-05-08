
import { Document, DocumentStatus } from "@/types/document";

// Calculate document status based on expiry date
export const getDocumentStatus = (expiryDate?: string): DocumentStatus => {
  if (!expiryDate) return "valid";
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  if (expiry < today) {
    return "expired";
  }
  
  // Calculate days until expiry
  const diffTime = Math.abs(expiry.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) {
    return "expiring";
  }
  
  return "valid";
};

// Get status badge color based on status
export const getStatusColor = (status: DocumentStatus): string => {
  switch (status) {
    case "valid":
      return "bg-green-100 text-green-800 border-green-200";
    case "expiring":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "expired":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Format date in a human-readable format
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
