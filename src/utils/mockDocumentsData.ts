
import { DocumentFolder, DocumentPacket } from "@/types/document";

// Mock folders
export const mockFolders: DocumentFolder[] = [
  {
    id: "folder-1",
    name: "Important Documents",
    category: "immigration"
  },
  {
    id: "folder-2",
    name: "School Records",
    category: "education"
  },
  {
    id: "folder-3",
    name: "Work Documents",
    category: "employment"
  },
  {
    id: "folder-4",
    name: "Financial Records",
    category: "financial" 
  },
  {
    id: "folder-5",
    name: "Personal IDs",
    category: "personal"
  }
];

// Mock document packets
export const mockPackets: DocumentPacket[] = [
  {
    id: "packet-1",
    name: "University Application Documents",
    documentIds: ["doc-1", "doc-3", "doc-5"],
    shareLink: "https://nexed.app/share/abc123",
    shareExpiry: "2025-07-15",
    accessType: "view",
    createdAt: "2025-05-01T10:30:00Z"
  },
  {
    id: "packet-2",
    name: "OPT Application Package",
    documentIds: ["doc-2", "doc-6", "doc-8"],
    shareLink: "https://nexed.app/share/def456",
    shareExpiry: "2025-06-30",
    sharePassword: "optdocs2025",
    accessType: "view",
    createdAt: "2025-05-10T14:45:00Z"
  }
];
