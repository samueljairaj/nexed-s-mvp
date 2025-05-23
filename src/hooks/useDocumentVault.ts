
import { Document, DocumentCategory, DocumentStatus, DocumentPacket, DocumentFolder, DocumentVersion } from "@/types/document";
import { useDocuments } from "./document/useDocuments";
import { useDocumentFilters } from "./document/useDocumentFilters";
import { getDocumentStatus } from "@/utils/documentUtils";

export function useDocumentVault() {
  const {
    documents,
    folders,
    packets,
    isLoading,
    selectedDocument,
    setSelectedDocument,
    selectedDocuments,
    setSelectedDocuments,
    toggleDocumentSelection,
    handleAddDocument,
    handleCreateFolder,
    handleDeleteDocument,
    handleRenameDocument,
    handleToggleRequired,
    handleUpdateExpiry,
    handleAddVersion,
    handleCreatePacket,
    syncDocuments
  } = useDocuments();

  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    sortedDocuments,
    filteredDocuments,
    clearFilters
  } = useDocumentFilters(documents);

  // Get documents that are expiring soon (within 30 days)
  const expiringDocuments = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    
    const status = getDocumentStatus(doc.expiryDate);
    return status === 'expiring';
  });

  // Get documents that are expired
  const expiredDocuments = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    
    const status = getDocumentStatus(doc.expiryDate);
    return status === 'expired';
  });

  return {
    documents,
    folders,
    packets,
    filteredDocuments,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    isLoading,
    selectedDocument,
    setSelectedDocument,
    selectedDocuments,
    setSelectedDocuments,
    toggleDocumentSelection,
    handleAddDocument,
    handleCreateFolder,
    handleDeleteDocument,
    handleRenameDocument,
    handleToggleRequired,
    handleUpdateExpiry,
    handleAddVersion,
    handleCreatePacket,
    sortedDocuments,
    expiringDocuments,
    expiredDocuments,
    clearFilters,
    syncDocuments
  };
}
