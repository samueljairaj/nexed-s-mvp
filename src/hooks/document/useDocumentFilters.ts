
import { useState, useMemo } from "react";
import { Document, DocumentCategory } from "@/types/document";

export function useDocumentFilters(documents: Document[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | null>(null);
  const [sortOption, setSortOption] = useState<"name" | "date" | "status">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter documents based on search and category
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? doc.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, activeCategory]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          // Sort by status priority: expired, expiring, valid, null
          const statusA = a.status || "valid";
          const statusB = b.status || "valid";
          const statusOrder = { "expired": 0, "expiring": 1, "valid": 2 };
          return (statusOrder[statusA as keyof typeof statusOrder] || 3) - 
                 (statusOrder[statusB as keyof typeof statusOrder] || 3);
        case "date":
        default:
          // Sort by upload date (newest first)
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });
  }, [filteredDocuments, sortOption]);

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
    filteredDocuments,
    sortedDocuments,
    clearFilters
  };
}
