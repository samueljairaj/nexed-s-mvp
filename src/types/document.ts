
// Document category and status enums now reflect Supabase enum values

export type DocumentCategory =
  | "immigration"
  | "education"
  | "employment"
  | "personal"
  | "financial"
  | "other"
  | "academic"; // (as now enforced by DB)

export type DocumentStatus =
  | "valid"
  | "expiring"
  | "expired"
  | "pending"
  | "rejected"
  | "approved"; // Extended according to DB enum

export interface DocumentVersion {
  id: string;
  fileUrl: string;
  uploadDate: string;
  size: string;
  versionNumber: number;
  notes?: string;
  is_current?: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: DocumentCategory;
  uploadDate: string;
  size: string;
  required: boolean;
  fileUrl: string;
  expiryDate?: string;
  status?: DocumentStatus;
  versions?: DocumentVersion[];
  folderId?: string;
  user_id?: string;

  detected_type?: string;
  tags?: string[];
  latest_version_id?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  category?: DocumentCategory;
  parentId?: string;
}

export interface DocumentPacket {
  id: string;
  name: string;
  documentIds: string[];
  shareLink?: string;
  shareExpiry?: string;
  sharePassword?: string;
  accessType: "view" | "edit";
  createdAt: string;
}
