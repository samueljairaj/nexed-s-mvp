
import { Document, DocumentCategory, DocumentStatus, DocumentPacket, DocumentFolder, DocumentVersion } from "@/types/document";
import { useDocuments } from "./document/useDocuments";
import { useDocumentFilters } from "./document/useDocumentFilters";

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
    clearFilters
  };
}
