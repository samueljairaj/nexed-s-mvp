
import { DocumentStatus } from "@/types/document";

/**
 * Get the status of a document based on its expiry date
 * @param expiryDate The expiry date string in ISO format
 * @returns "valid", "expiring", or "expired"
 */
export function getDocumentStatus(expiryDate: string): DocumentStatus {
  if (!expiryDate) return "valid";
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  if (expiry < today) {
    return "expired";
  } else if (expiry <= thirtyDaysFromNow) {
    return "expiring";
  } else {
    return "valid";
  }
}

/**
 * Format a date string to a readable format
 * @param dateString The date string in ISO format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Get tailwind color class based on document status
 * @param status Document status
 * @returns Tailwind color class
 */
export function getStatusColor(status: DocumentStatus | string): string {
  switch (status) {
    case "expired":
      return "bg-red-100 text-red-800";
    case "expiring":
      return "bg-amber-100 text-amber-800";
    case "valid":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Detect document type from filename
 * @param filename The filename to analyze
 * @returns Detected document type or undefined
 */
export function detectDocumentType(filename: string): string | undefined {
  filename = filename.toLowerCase();
  
  if (filename.includes("passport")) return "passport";
  if (filename.includes("visa") || filename.includes("f1") || filename.includes("f-1")) return "visa";
  if (filename.includes("i20") || filename.includes("i-20")) return "i20";
  if (filename.includes("transcript")) return "transcript";
  if (filename.includes("diploma") || filename.includes("degree")) return "degree";
  if (filename.includes("offer") || filename.includes("job")) return "job_offer";
  if (filename.includes("lease") || filename.includes("rent")) return "lease";
  if (filename.includes("bank") || filename.includes("statement")) return "bank_statement";
  if (filename.includes("tax")) return "tax";
  if (filename.includes("license") || filename.includes("driver")) return "license";
  if (filename.includes("insurance")) return "insurance";
  
  return undefined;
}

/**
 * Suggest tags for a document based on filename and category
 * @param filename The filename to analyze
 * @param category The document category
 * @returns Array of suggested tags
 */
export function suggestDocumentTags(filename: string, category: string): string[] {
  const tags: string[] = [];
  filename = filename.toLowerCase();
  
  // Add category as a tag
  tags.push(category);
  
  // Add document type tags
  if (filename.includes("passport")) tags.push("passport", "identification");
  if (filename.includes("visa")) tags.push("visa");
  if (filename.includes("f1") || filename.includes("f-1")) tags.push("F1");
  if (filename.includes("j1") || filename.includes("j-1")) tags.push("J1");
  if (filename.includes("h1b") || filename.includes("h-1b")) tags.push("H1B");
  if (filename.includes("i20") || filename.includes("i-20")) tags.push("I-20", "SEVIS");
  if (filename.includes("ead")) tags.push("EAD", "work authorization");
  if (filename.includes("opt")) tags.push("OPT");
  if (filename.includes("cpt")) tags.push("CPT");
  if (filename.includes("stem")) tags.push("STEM");
  
  // Academic document tags
  if (filename.includes("transcript")) tags.push("transcript", "grades", "academic");
  if (filename.includes("diploma") || filename.includes("degree") || filename.includes("certificate")) 
    tags.push("degree", "graduation");
  if (filename.includes("admission") || filename.includes("acceptance")) 
    tags.push("admission", "university");
  
  // Employment document tags
  if (filename.includes("offer") || filename.includes("job")) 
    tags.push("job offer", "employment");
  if (filename.includes("verification")) 
    tags.push("verification");
  if (filename.includes("cv") || filename.includes("resume")) 
    tags.push("resume", "application");
  
  // Financial document tags
  if (filename.includes("bank") || filename.includes("statement")) 
    tags.push("bank", "statement");
  if (filename.includes("tax")) 
    tags.push("tax", "IRS");
  if (filename.includes("affidavit")) 
    tags.push("affidavit", "financial support");
  
  // Personal document tags
  if (filename.includes("license") || filename.includes("driver")) 
    tags.push("license", "identification", "driving");
  if (filename.includes("lease") || filename.includes("rent")) 
    tags.push("housing", "rental");
  if (filename.includes("insurance")) 
    tags.push("insurance");
  
  // Remove duplicates
  return [...new Set(tags)];
}
