
import { useState } from "react";
import { Document, DocumentCategory, DocumentFolder, DocumentPacket } from "@/types/document";
import { useDocumentSync } from "./useDocumentSync";
import { generateMockDocuments } from "@/utils/mockDocuments";
import { getDocumentActions } from "./useDocumentActions";
import { mockFolders, mockPackets } from "@/utils/mockDocumentsData";
import { getDocumentStatus } from "@/utils/documentUtils";

// Process documents to add status based on expiry date
const processDocuments = (docs: Document[]) => {
  return docs.map(doc => ({
    ...doc,
    status: doc.expiryDate ? getDocumentStatus(doc.expiryDate) : undefined
  }));
};

// UseDocuments hook is now orchestrating state and actions.
export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>(generateMockDocuments());
  const [folders, setFolders] = useState<DocumentFolder[]>(mockFolders);
  const [packets, setPackets] = useState<DocumentPacket[]>(mockPackets);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    saveDocumentToDatabase,
    updateDocumentInDatabase,
    deleteDocumentFromDatabase,
    syncDocuments,
    saveDocumentVersionToDatabase
  } = useDocumentSync(setDocuments, setFolders, setIsLoading);

  // Handler wrapper functions exposed to the rest of the app.
  const {
    toggleDocumentSelection,
    handleAddDocument,
    handleCreateFolder,
    handleDeleteDocument,
    handleRenameDocument,
    handleToggleRequired,
    handleUpdateExpiry,
    handleAddVersion,
    handleCreatePacket,
  } = getDocumentActions({
    saveDocumentToDatabase,
    updateDocumentInDatabase,
    deleteDocumentFromDatabase,
    syncDocuments,
    saveDocumentVersionToDatabase,
    setDocuments,
    setFolders,
    setIsLoading,
    selectedDocument,
    setSelectedDocument,
    setSelectedDocuments,
    processDocuments,
  });

  return {
    documents,
    folders,
    packets,
    isLoading,
    selectedDocument,
    setSelectedDocument,
    selectedDocuments,
    setSelectedDocuments,
    toggleDocumentSelection: (doc: Document) =>
      toggleDocumentSelection(doc, selectedDocuments, setSelectedDocuments),
    handleAddDocument,
    handleCreateFolder,
    handleDeleteDocument,
    handleRenameDocument,
    handleToggleRequired,
    handleUpdateExpiry,
    handleAddVersion,
    handleCreatePacket,
    syncDocuments,
    processDocuments,
  };
}
