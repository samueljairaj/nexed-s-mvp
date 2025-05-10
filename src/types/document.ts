
export type DocumentCategory = "immigration" | "education" | "employment" | "personal" | "financial" | "other" | "academic";

export type DocumentStatus = "valid" | "expiring" | "expired";

export interface DocumentVersion {
  id: string;
  fileUrl: string;
  uploadDate: string;
  size: string;
  versionNumber: number;
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
  user_id?: string; // Added user_id field
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
