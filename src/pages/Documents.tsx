
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DocumentCategory, Document as DocType } from "@/types/document";
import { useDocumentVault } from "@/hooks/useDocumentVault";
import { useAICompliance } from "@/hooks/useAICompliance";

import {
  Upload,
  Search,
  FolderPlus,
  Share,
  X,
  ArrowDownUp,
  FileText,
  Calendar,
  Clock
} from "lucide-react";

import { DocumentUploader } from "@/components/document-vault/DocumentUploader";
import { CategoryView } from "@/components/document-vault/CategoryView";
import { DocumentGrid } from "@/components/document-vault/DocumentGrid";
import { DocumentList } from "@/components/document-vault/DocumentList";
import { DocumentSidebar } from "@/components/document-vault/DocumentSidebar";
import { DocumentPacketModal } from "@/components/document-vault/DocumentPacketModal";
import { FolderCreationDialog } from "@/components/document-vault/FolderCreationDialog";

// Mock categories and their descriptions
const categories = [
  { 
    id: "immigration" as DocumentCategory, 
    name: "Immigration", 
    description: "Visa, passport, I-20, and other immigration documents",
    icon: <FileText className="h-5 w-5 text-red-500" />,
    color: "bg-red-50 border-red-200" 
  },
  { 
    id: "education" as DocumentCategory, 
    name: "Education", 
    description: "Admission letter, transcripts, degree certificates",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    color: "bg-blue-50 border-blue-200" 
  },
  { 
    id: "employment" as DocumentCategory, 
    name: "Employment", 
    description: "Offer letters, EAD card, employment verification",
    icon: <FileText className="h-5 w-5 text-green-500" />,
    color: "bg-green-50 border-green-200" 
  },
  { 
    id: "personal" as DocumentCategory, 
    name: "Personal", 
    description: "ID cards, driver's license, lease agreements",
    icon: <FileText className="h-5 w-5 text-amber-500" />,
    color: "bg-amber-50 border-amber-200" 
  },
  { 
    id: "financial" as DocumentCategory, 
    name: "Financial", 
    description: "Bank statements, credit reports, tax documents",
    icon: <FileText className="h-5 w-5 text-purple-500" />,
    color: "bg-purple-50 border-purple-200" 
  },
  { 
    id: "other" as DocumentCategory, 
    name: "Other", 
    description: "Miscellaneous documents that don't fit other categories",
    icon: <FileText className="h-5 w-5 text-gray-500" />,
    color: "bg-gray-50 border-gray-200" 
  },
];

const Documents = () => {
  const {
    documents,
    folders,
    packets,
    filteredDocuments,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
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
    handleCreatePacket,
  } = useDocumentVault();

  const { generateCompliance } = useAICompliance();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isPacketDialogOpen, setIsPacketDialogOpen] = useState(false);
  const [isUpdateExpiryDialogOpen, setIsUpdateExpiryDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [sortOption, setSortOption] = useState<"name" | "date" | "status">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectionMode, setSelectionMode] = useState(false);

  // Handle document upload
  const handleUpload = (files: FileList, category: DocumentCategory, expiryDate?: string) => {
    handleAddDocument(files, category, expiryDate);
  };

  // Handle folder creation
  const handleOpenFolderDialog = () => {
    setIsFolderDialogOpen(true);
  };

  const handleFolderCreation = (name: string, category: DocumentCategory) => {
    handleCreateFolder(name, category);
  };

  // Handle document rename
  const handleRenameDialogOpen = (doc: DocType) => {
    setSelectedDocument(doc);
    setNewFileName(doc.name);
    setIsRenameDialogOpen(true);
  };

  const handleDocumentRename = () => {
    if (!selectedDocument || !newFileName.trim()) return;
    
    // Fix: Pass the ID and new name instead of the Document object
    handleRenameDocument(selectedDocument.id, newFileName);
    setIsRenameDialogOpen(false);
    setNewFileName("");
  };

  // Handle expiry date update
  const handleExpiryDialogOpen = () => {
    if (!selectedDocument) return;
    setNewExpiryDate(selectedDocument.expiryDate || "");
    setIsUpdateExpiryDialogOpen(true);
  };

  const handleExpiryUpdate = () => {
    if (!selectedDocument) return;
    handleUpdateExpiry(selectedDocument.id, newExpiryDate);
    setIsUpdateExpiryDialogOpen(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
    setSortOption("date");
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Exit selection mode
      setSelectedDocuments([]);
    }
  };

  // Create document packet
  const createPacket = () => {
    if (selectedDocuments.length === 0) return;
    setIsPacketDialogOpen(true);
  };

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "status": {
        // Sort by status priority: expired, expiring, valid, null
        const statusA = a.status || "valid";
        const statusB = b.status || "valid";
        const statusOrder = { expired: 0, expiring: 1, valid: 2 } as const;
        return (
          (statusOrder[statusA as keyof typeof statusOrder] ?? 3) -
          (statusOrder[statusB as keyof typeof statusOrder] ?? 3)
        );
      }
      case "date":
      default:
        // Sort by upload date (newest first)
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
  });

  // Generate compliance report
  const updateComplianceChecklist = async () => {
    // Find all required documents
    const requiredDocs = documents.filter(doc => doc.required);
    const missingTypes = ["passport", "visa", "i20"].filter(type => 
      !requiredDocs.some(doc => doc.name.toLowerCase().includes(type))
    );
    
    if (missingTypes.length > 0) {
      // Generate compliance alerts
      const result = await generateCompliance();
      if (result.length > 0) {
        // Process completed tasks based on uploaded required documents
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Document Vault</h1>
            <p className="text-gray-600 mt-2">
              Securely store and manage your important documents
            </p>
          </div>
          <div className="flex space-x-2">
            {selectionMode ? (
              <>
                <Button variant="outline" onClick={toggleSelectionMode} className="gap-2">
                  <X size={16} />
                  Cancel
                </Button>
                <Button 
                  onClick={createPacket}
                  disabled={selectedDocuments.length === 0}
                  className="nexed-gradient gap-2"
                >
                  <Share size={16} />
                  Create Packet ({selectedDocuments.length})
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Upload size={16} />
                  Upload
                </Button>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleOpenFolderDialog}
                >
                  <FolderPlus size={16} />
                  New Folder
                </Button>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={toggleSelectionMode}
                >
                  <Share size={16} />
                  Select Files
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search documents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(searchQuery || activeCategory || sortOption !== "date") && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 text-gray-400 hover:text-gray-600"
              onClick={clearFilters}
            >
              <X size={16} />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort:</span>
          <select
            className="text-sm border rounded p-1"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as "name" | "date" | "status")}
          >
            <option value="date">Date (newest)</option>
            <option value="name">Name (A-Z)</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Document Categories */}
      <CategoryView
        categories={categories}
        documents={documents}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />

      {/* Document List */}
      <Card className="nexed-card flex-1 flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                {activeCategory
                  ? categories.find(c => c.id === activeCategory)?.name
                  : "All Documents"}
              </CardTitle>
              <CardDescription>
                {activeCategory
                  ? categories.find(c => c.id === activeCategory)?.description
                  : "All your uploaded documents"}
              </CardDescription>
            </div>
            {activeCategory && (
              <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)}>
                <X size={16} className="mr-2" /> Clear filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="flex-1 flex flex-col">
            <div className="px-6 pt-2 pb-0 flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-sm text-gray-500">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                </span>
              </div>
              <TabsList className="grid grid-cols-2 w-[160px]">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 flex">
              <TabsContent value="grid" className="m-0 flex-1 overflow-hidden">
                <DocumentGrid
                  documents={sortedDocuments}
                  onSelectDocument={(doc: DocType) => {
                    if (selectionMode) {
                      toggleDocumentSelection(doc);
                    } else {
                      setSelectedDocument(doc);
                      setIsPreviewOpen(true);
                    }
                  }}
                  onDeleteDocument={handleDeleteDocument}
                  onRenameDocument={handleRenameDialogOpen}
                  onToggleRequired={handleToggleRequired}
                  emptyMessage={searchQuery ? "No documents match your search" : "Start by uploading your first document"}
                />
              </TabsContent>

              <TabsContent value="list" className="m-0 flex-1 overflow-hidden">
                <DocumentList
                  documents={sortedDocuments}
                  onSelectDocument={(doc: DocType) => {
                    if (selectionMode) {
                      toggleDocumentSelection(doc);
                    } else {
                      setSelectedDocument(doc);
                      setIsPreviewOpen(true);
                    }
                  }}
                  onDeleteDocument={handleDeleteDocument}
                  onRenameDocument={handleRenameDialogOpen}
                  onToggleRequired={handleToggleRequired}
                  emptyMessage={searchQuery ? "No documents match your search" : "Start by uploading your first document"}
                />
              </TabsContent>

              {/* Document Sidebar (Preview/Details) */}
              {isPreviewOpen && selectedDocument && (
                <div className="flex-shrink-0">
                  <DocumentSidebar 
                    document={selectedDocument} 
                    onClose={() => setIsPreviewOpen(false)}
                    onUpdateExpiry={handleExpiryDialogOpen}
                    onShare={() => {
                      setSelectedDocuments([selectedDocument]);
                      setIsPacketDialogOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <DocumentUploader 
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUpload}
        defaultCategory={activeCategory || undefined}
      />

      {/* Folder Creation Dialog */}
      <FolderCreationDialog
        isOpen={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onCreateFolder={handleFolderCreation}
        defaultCategory={activeCategory || undefined}
      />

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDocumentRename} 
              disabled={!newFileName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Expiry Dialog */}
      <Dialog open={isUpdateExpiryDialogOpen} onOpenChange={setIsUpdateExpiryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Expiry Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label htmlFor="expiry-date" className="text-sm font-medium">
                  Document Expiry Date
                </label>
              </div>
              <Input
                id="expiry-date"
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Setting an expiry date helps track document status
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateExpiryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExpiryUpdate} 
              disabled={!newExpiryDate}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Packet Creation Dialog */}
      <DocumentPacketModal
        isOpen={isPacketDialogOpen}
        onClose={() => setIsPacketDialogOpen(false)}
        selectedDocuments={selectedDocuments}
        onCreatePacket={handleCreatePacket}
      />
    </div>
  );
};

export default Documents;
