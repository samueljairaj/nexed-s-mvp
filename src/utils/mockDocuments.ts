
import { Document, DocumentCategory, DocumentStatus, DocumentVersion } from "@/types/document";
import { getDocumentStatus } from "./documentUtils";

/**
 * Generate a set of mock documents for the Document Vault
 */
export function generateMockDocuments(): Document[] {
  return [
    // Immigration Documents
    {
      id: "doc-1",
      name: "Passport Copy.pdf",
      type: "application/pdf",
      category: "immigration",
      uploadDate: "2025-03-15",
      size: "1.2 MB",
      required: true,
      fileUrl: "/mockdocs/passport.pdf",
      expiryDate: "2030-03-14",
      status: "valid",
      detected_type: "passport",
      tags: ["identification", "travel", "government-issued"],
      versions: [
        {
          id: "v-doc-1-1",
          fileUrl: "/mockdocs/passport.pdf",
          uploadDate: "2025-03-15",
          size: "1.2 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-2",
      name: "F-1 Visa.pdf",
      type: "application/pdf",
      category: "immigration",
      uploadDate: "2025-02-10",
      size: "890 KB",
      required: true,
      fileUrl: "/mockdocs/f1visa.pdf",
      expiryDate: "2025-06-30",
      status: "expiring",
      detected_type: "visa",
      tags: ["F1", "visa", "USCIS"],
      versions: [
        {
          id: "v-doc-2-1",
          fileUrl: "/mockdocs/f1visa-old.pdf",
          uploadDate: "2024-08-10",
          size: "850 KB",
          versionNumber: 1,
          is_current: false
        },
        {
          id: "v-doc-2-2",
          fileUrl: "/mockdocs/f1visa.pdf",
          uploadDate: "2025-02-10",
          size: "890 KB",
          versionNumber: 2,
          is_current: true
        }
      ]
    },
    {
      id: "doc-3",
      name: "I-20 Form.pdf",
      type: "application/pdf",
      category: "immigration",
      uploadDate: "2025-01-25",
      size: "750 KB",
      required: true,
      fileUrl: "/mockdocs/i20.pdf",
      expiryDate: "2026-05-15",
      status: "valid",
      detected_type: "i20",
      tags: ["SEVIS", "student", "F1"],
      versions: [
        {
          id: "v-doc-3-1",
          fileUrl: "/mockdocs/i20.pdf",
          uploadDate: "2025-01-25",
          size: "750 KB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-4",
      name: "OPT EAD Card.jpg",
      type: "image/jpeg",
      category: "immigration",
      uploadDate: "2024-12-10",
      size: "2.5 MB",
      required: true,
      fileUrl: "/mockdocs/eadcard.jpg",
      expiryDate: "2025-05-15",
      status: "expired",
      detected_type: "ead",
      tags: ["work authorization", "OPT", "employment"],
      versions: [
        {
          id: "v-doc-4-1",
          fileUrl: "/mockdocs/eadcard.jpg",
          uploadDate: "2024-12-10",
          size: "2.5 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    
    // Education Documents
    {
      id: "doc-5",
      name: "Transcript - Spring 2025.pdf",
      type: "application/pdf",
      category: "education",
      uploadDate: "2025-05-01",
      size: "1.8 MB",
      required: false,
      fileUrl: "/mockdocs/transcript.pdf",
      tags: ["academic", "grades", "university"],
      versions: [
        {
          id: "v-doc-5-1",
          fileUrl: "/mockdocs/transcript.pdf",
          uploadDate: "2025-05-01",
          size: "1.8 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-6",
      name: "Admission Letter.pdf",
      type: "application/pdf",
      category: "education",
      uploadDate: "2024-08-15",
      size: "950 KB",
      required: false,
      fileUrl: "/mockdocs/admission.pdf",
      tags: ["university", "acceptance", "enrollment"],
      versions: [
        {
          id: "v-doc-6-1",
          fileUrl: "/mockdocs/admission.pdf",
          uploadDate: "2024-08-15",
          size: "950 KB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-7",
      name: "Degree Certificate.pdf",
      type: "application/pdf",
      category: "education",
      uploadDate: "2024-06-30",
      size: "1.4 MB",
      required: false,
      fileUrl: "/mockdocs/degree.pdf",
      tags: ["graduation", "diploma", "bachelor"],
      versions: [
        {
          id: "v-doc-7-1",
          fileUrl: "/mockdocs/degree.pdf",
          uploadDate: "2024-06-30",
          size: "1.4 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    
    // Employment Documents
    {
      id: "doc-8",
      name: "Job Offer - Tech Startup Inc.pdf",
      type: "application/pdf",
      category: "employment",
      uploadDate: "2025-04-15",
      size: "1.1 MB",
      required: true,
      fileUrl: "/mockdocs/joboffer.pdf",
      expiryDate: "2025-05-30",
      status: "expiring",
      tags: ["job", "offer", "employment"],
      versions: [
        {
          id: "v-doc-8-1",
          fileUrl: "/mockdocs/joboffer.pdf",
          uploadDate: "2025-04-15",
          size: "1.1 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-9",
      name: "Employment Verification.pdf",
      type: "application/pdf",
      category: "employment",
      uploadDate: "2025-04-20",
      size: "980 KB",
      required: false,
      fileUrl: "/mockdocs/employment-verification.pdf",
      tags: ["verification", "employer", "HR"],
      versions: [
        {
          id: "v-doc-9-1",
          fileUrl: "/mockdocs/employment-verification.pdf",
          uploadDate: "2025-04-20",
          size: "980 KB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    
    // Personal Documents
    {
      id: "doc-10",
      name: "Driver's License.jpg",
      type: "image/jpeg",
      category: "personal",
      uploadDate: "2025-01-05",
      size: "3.2 MB",
      required: false,
      fileUrl: "/mockdocs/license.jpg",
      expiryDate: "2029-01-04",
      status: "valid",
      tags: ["identification", "driving", "state ID"],
      versions: [
        {
          id: "v-doc-10-1",
          fileUrl: "/mockdocs/license.jpg",
          uploadDate: "2025-01-05",
          size: "3.2 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-11",
      name: "Apartment Lease.pdf",
      type: "application/pdf",
      category: "personal",
      uploadDate: "2024-12-01",
      size: "2.3 MB",
      required: true,
      fileUrl: "/mockdocs/lease.pdf",
      expiryDate: "2025-12-01",
      status: "valid",
      tags: ["housing", "lease", "rental"],
      versions: [
        {
          id: "v-doc-11-1",
          fileUrl: "/mockdocs/lease-old.pdf",
          uploadDate: "2023-12-01",
          size: "2.1 MB",
          versionNumber: 1,
          is_current: false
        },
        {
          id: "v-doc-11-2",
          fileUrl: "/mockdocs/lease.pdf",
          uploadDate: "2024-12-01",
          size: "2.3 MB",
          versionNumber: 2,
          is_current: true,
          notes: "Renewed for another year"
        }
      ]
    },
    
    // Financial Documents
    {
      id: "doc-12",
      name: "Bank Statement - April 2025.pdf",
      type: "application/pdf",
      category: "financial",
      uploadDate: "2025-05-05",
      size: "1.5 MB",
      required: false,
      fileUrl: "/mockdocs/bank-statement.pdf",
      tags: ["bank", "statement", "financial"],
      versions: [
        {
          id: "v-doc-12-1",
          fileUrl: "/mockdocs/bank-statement.pdf",
          uploadDate: "2025-05-05",
          size: "1.5 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-13",
      name: "Financial Affidavit.pdf",
      type: "application/pdf",
      category: "financial",
      uploadDate: "2024-07-20",
      size: "1.2 MB",
      required: true,
      fileUrl: "/mockdocs/financial-affidavit.pdf",
      tags: ["affidavit", "sponsor", "financial support"],
      versions: [
        {
          id: "v-doc-13-1",
          fileUrl: "/mockdocs/financial-affidavit.pdf",
          uploadDate: "2024-07-20",
          size: "1.2 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    {
      id: "doc-14",
      name: "Tax Return 2024.pdf",
      type: "application/pdf",
      category: "financial",
      uploadDate: "2025-04-10",
      size: "3.5 MB",
      required: false,
      fileUrl: "/mockdocs/tax-return.pdf",
      tags: ["tax", "IRS", "annual"],
      versions: [
        {
          id: "v-doc-14-1",
          fileUrl: "/mockdocs/tax-return.pdf",
          uploadDate: "2025-04-10",
          size: "3.5 MB",
          versionNumber: 1,
          is_current: true
        }
      ]
    },
    
    // Academic Documents
    {
      id: "doc-15",
      name: "Research Paper - ML Applications.pdf",
      type: "application/pdf",
      category: "academic",
      uploadDate: "2025-03-25",
      size: "4.2 MB",
      required: false,
      fileUrl: "/mockdocs/research-paper.pdf",
      tags: ["research", "academic", "publication"],
      versions: [
        {
          id: "v-doc-15-1",
          fileUrl: "/mockdocs/research-paper-draft.pdf",
          uploadDate: "2025-02-15",
          size: "3.8 MB",
          versionNumber: 1,
          is_current: false,
          notes: "Initial draft"
        },
        {
          id: "v-doc-15-2",
          fileUrl: "/mockdocs/research-paper.pdf",
          uploadDate: "2025-03-25",
          size: "4.2 MB",
          versionNumber: 2,
          is_current: true,
          notes: "Final version with professor feedback"
        }
      ]
    },
    {
      id: "doc-16",
      name: "Course Registration - Fall 2025.pdf",
      type: "application/pdf",
      category: "academic",
      uploadDate: "2025-04-30",
      size: "780 KB",
      required: true,
      fileUrl: "/mockdocs/course-registration.pdf",
      tags: ["registration", "courses", "schedule"],
      versions: [
        {
          id: "v-doc-16-1",
          fileUrl: "/mockdocs/course-registration.pdf",
          uploadDate: "2025-04-30",
          size: "780 KB",
          versionNumber: 1,
          is_current: true
        }
      ]
    }
  ];
}
