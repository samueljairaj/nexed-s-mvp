import { useState } from "react";
import { Document, DocumentCategory, DocumentFolder, DocumentPacket, DocumentStatus, DocumentVersion } from "@/types/document";
import { toast } from "sonner";
import { getDocumentStatus, detectDocumentType, suggestDocumentTags } from "@/utils/documentUtils";
import { useDocumentSync } from "./useDocumentSync";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [packets, setPackets] = useState<DocumentPacket[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    saveDocumentToDatabase, 
    updateDocumentInDatabase, 
    deleteDocumentFromDatabase,
    syncDocuments,
    saveDocumentVersionToDatabase
  } = useDocumentSync(setDocuments, setFolders, setIsLoading);

  // Toggle document selection for multi-select operations
  const toggleDocumentSelection = (doc: Document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(d => d.id === doc.id);
      if (isSelected) {
        return prev.filter(d => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Document actions
  const handleAddDocument = async (files: FileList, category: DocumentCategory, expiryDate?: string) => {
    try {
      // Simulate upload to server
      const newDocs: Document[] = Array.from(files).map((file, index) => {
        // Smart categorization: detect document type from filename
        const detectedType = detectDocumentType(file.name);
        
        // Generate suggested tags
        const suggestedTags = suggestDocumentTags(file.name, category);
        
        return {
          id: `doc-${Date.now()}-${index}`,
          name: file.name,
          type: file.type,
          category: category,
          uploadDate: new Date().toLocaleDateString(),
          size: formatFileSize(file.size),
          required: false,
          fileUrl: URL.createObjectURL(file),
          expiryDate,
          status: expiryDate ? getDocumentStatus(expiryDate) : undefined,
          
          // Add smart categorization fields
          detected_type: detectedType || undefined,
          tags: suggestedTags
        };
      });

      // Create initial version for each document
      for (const doc of newDocs) {
        const dbId = await saveDocumentToDatabase(doc);
        if (dbId) {
          // Update the document ID with the one from the database
          doc.id = dbId;
          
          // Create initial version
          const initialVersion: DocumentVersion = {
            id: `version-${Date.now()}-1`,
            fileUrl: doc.fileUrl,
            uploadDate: doc.uploadDate,
            size: doc.size,
            versionNumber: 1
          };
          
          // Save version to database
          await saveDocumentVersionToDatabase(doc.id, initialVersion);
          
          // Update document with versions
          doc.versions = [initialVersion];
        }
      }

      setDocuments(prev => [...processDocuments(newDocs), ...prev]);
      toast.success(`${files.length} document${files.length !== 1 ? 's' : ''} uploaded successfully.`);
      
      // If any document has an expiry date, check if it needs attention
      const expiringDocs = newDocs.filter(doc => 
        doc.expiryDate && getDocumentStatus(doc.expiryDate) !== "valid"
      );
      
      if (expiringDocs.length > 0) {
        toast(`${expiringDocs.length} document${expiringDocs.length !== 1 ? 's' : ''} need${expiringDocs.length === 1 ? 's' : ''} attention.`, {
          description: "Some documents are expired or will expire soon."
        });
      }
      
      return newDocs;
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
      return [];
    }
  };

  const handleCreateFolder = (name: string, category: DocumentCategory) => {
    const newFolder: DocumentFolder = {
      id: `folder-${Date.now()}`,
      name,
      category
    };
    
    setFolders(prev => [newFolder, ...prev]);
    toast.success("Folder created successfully");
    return newFolder;
  };

  const handleDeleteDocument = async (id: string) => {
    // Delete from database first
    const success = await deleteDocumentFromDatabase(id);
    
    if (success) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Document deleted successfully");
    } else {
      // If database delete fails, still update UI but show warning
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.warning("Document deleted locally but sync failed");
    }
  };

  const handleRenameDocument = async (id: string, newName: string) => {
    // Update in database first
    const success = await updateDocumentInDatabase(id, { name: newName });
    
    if (success) {
      setDocuments(prev => 
        prev.map(d => 
          d.id === id ? { ...d, name: newName } : d
        )
      );
      
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => prev ? { ...prev, name: newName } : null);
      }
      
      setSelectedDocuments(prev => 
        prev.map(d => 
          d.id === id ? { ...d, name: newName } : d
        )
      );
      
      toast.success(`Renamed to "${newName}"`);
    } else {
      // If database update fails, still update UI but show warning
      setDocuments(prev => 
        prev.map(d => 
          d.id === id ? { ...d, name: newName } : d
        )
      );
      
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => prev ? { ...prev, name: newName } : null);
      }
      
      setSelectedDocuments(prev => 
        prev.map(d => 
          d.id === id ? { ...d, name: newName } : d
        )
      );
      
      toast.warning(`Renamed locally but sync failed`);
    }
  };

  const handleToggleRequired = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    
    const newRequired = !doc.required;
    
    // Update in database first
    const success = await updateDocumentInDatabase(id, { required: newRequired });
    
    if (success) {
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { ...doc, required: newRequired } : doc
        )
      );
      
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => 
          prev ? { ...prev, required: newRequired } : null
        );
      }
      
      setSelectedDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { ...doc, required: newRequired } : doc
        )
      );
      
      toast.success(newRequired ? "Marked as Required" : "Marked as Optional", {
        description: doc.name
      });
    } else {
      // If database update fails, still update UI but show warning
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { ...doc, required: newRequired } : doc
        )
      );
      
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => 
          prev ? { ...prev, required: newRequired } : null
        );
      }
      
      setSelectedDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { ...doc, required: newRequired } : doc
        )
      );
      
      toast.warning(newRequired ? "Marked as Required locally but sync failed" : "Marked as Optional locally but sync failed");
    }
  };

  const handleUpdateExpiry = async (id: string, expiryDate: string) => {
    const updatedStatus = getDocumentStatus(expiryDate);
    
    // Update in database first
    const success = await updateDocumentInDatabase(id, { 
      expiryDate, 
      status: updatedStatus 
    });
    
    if (success) {
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { 
            ...doc, 
            expiryDate, 
            status: updatedStatus 
          } : doc
        )
      );
      
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => 
          prev ? { 
            ...prev, 
            expiryDate, 
            status: updatedStatus 
          } : null
        );
      }
      
      setSelectedDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { 
            ...doc, 
            expiryDate, 
            status: updatedStatus 
          } : doc
        )
      );
      
      // Show different toast based on status
      if (updatedStatus === "expired") {
        toast.warning(`Document has expired as of ${new Date(expiryDate).toLocaleDateString()}`);
      } else if (updatedStatus === "expiring") {
        toast.info(`Document will expire soon on ${new Date(expiryDate).toLocaleDateString()}`);
      } else {
        toast.success(`Expiry date updated to ${new Date(expiryDate).toLocaleDateString()}`);
      }
    } else {
      // If database update fails, still update UI but show warning
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { 
            ...doc, 
            expiryDate, 
            status: updatedStatus 
          } : doc
        )
      );
      
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => 
          prev ? { 
            ...prev, 
            expiryDate, 
            status: updatedStatus 
          } : null
        );
      }
      
      setSelectedDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { 
            ...doc, 
            expiryDate, 
            status: updatedStatus 
          } : doc
        )
      );
      
      toast.warning(`Expiry date updated locally but sync failed`);
    }
  };

  const handleAddVersion = async (documentId: string, files: FileList, notes?: string) => {
    try {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) {
        toast.error("Document not found");
        return null;
      }
      
      // Get the file
      const file = files[0];
      if (!file) {
        toast.error("No file selected");
        return null;
      }
      
      // Get current versions
      const currentVersions = doc.versions || [];
      const nextVersionNumber = currentVersions.length + 1;
      
      // Create new version
      const newVersion: DocumentVersion = {
        id: `version-${Date.now()}-${nextVersionNumber}`,
        fileUrl: URL.createObjectURL(file),
        uploadDate: new Date().toLocaleDateString(),
        size: formatFileSize(file.size),
        versionNumber: nextVersionNumber,
        notes
      };
      
      // Save version to database
      const versionId = await saveDocumentVersionToDatabase(documentId, newVersion);
      
      if (versionId) {
        newVersion.id = versionId;
        
        // Update document with new version
        const updatedVersions = [...currentVersions, newVersion];
        
        setDocuments(prev => 
          prev.map(d => 
            d.id === documentId ? {
              ...d,
              versions: updatedVersions,
              fileUrl: newVersion.fileUrl // Update to use the latest version
            } : d
          )
        );
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(prev => 
            prev ? {
              ...prev,
              versions: updatedVersions,
              fileUrl: newVersion.fileUrl
            } : null
          );
        }
        
        toast.success(`Version ${nextVersionNumber} uploaded successfully`);
        return newVersion;
      }
      
      return null;
    } catch (error) {
      console.error("Error adding document version:", error);
      toast.error("Failed to add document version");
      return null;
    }
  };

  const handleCreatePacket = (packet: Partial<DocumentPacket>) => {
    const newPacket: DocumentPacket = {
      id: `packet-${Date.now()}`,
      name: packet.name || "Untitled Packet",
      documentIds: packet.documentIds || [],
      accessType: packet.accessType || "view",
      createdAt: new Date().toISOString(),
      shareLink: `https://nexed.app/share/${Date.now().toString(36)}`,
      shareExpiry: packet.shareExpiry,
      sharePassword: packet.sharePassword
    };

    setPackets(prev => [newPacket, ...prev]);
    
    toast.success("Document packet created", {
      description: "You can now share the packet with others."
    });
    
    // Clear selected documents
    setSelectedDocuments([]);
    
    return newPacket;
  };

  // Process documents to add status based on expiry date
  const processDocuments = (docs: Document[]) => {
    return docs.map(doc => ({
      ...doc,
      status: doc.expiryDate ? getDocumentStatus(doc.expiryDate) : undefined
    }));
  };

  return {
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
    syncDocuments,
    processDocuments,
  };
}

// Mock folders - moved to this file since they're only used here
const mockFolders: DocumentFolder[] = [
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
  }
];
