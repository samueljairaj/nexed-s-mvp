
import { useState, useMemo } from "react";
import { Document, DocumentCategory } from "@/types/document";

export function useDocumentFilters(documents: Document[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | null>(null);
  const [sortOption, setSortOption] = useState<"name" | "date" | "status">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Sort documents
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          // Sort by status priority: expired, expiring, valid, null
          const statusA = a.status || "valid";
          const statusB = b.status || "valid";
          const statusOrder: Record<string, number> = { "expired": 0, "expiring": 1, "valid": 2 };
          return (statusOrder[statusA] || 3) - (statusOrder[statusB] || 3);
        case "date":
        default:
          // Sort by upload date (newest first)
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });
  }, [documents, sortOption]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return sortedDocuments.filter(doc => {
      // Filter by search query
      const matchesQuery = !searchQuery || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Filter by category
      const matchesCategory = !activeCategory || doc.category === activeCategory;
      
      return matchesQuery && matchesCategory;
    });
  }, [sortedDocuments, searchQuery, activeCategory]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
    setSortOption("date");
  };

  return {
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
  };
}
