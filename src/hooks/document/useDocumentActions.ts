import { Document, DocumentCategory, DocumentVersion, DocumentFolder, DocumentPacket } from "@/types/document";
import { toast } from "sonner";
import { getDocumentStatus, detectDocumentType, suggestDocumentTags } from "@/utils/documentUtils";
import { formatFileSize } from "@/utils/documentUtilsLocal";
import { generateMockDocuments } from "@/utils/mockDocuments";
import { mockFolders, mockPackets } from "@/utils/mockDocumentsData";

// All arguments and return types are unchanged for compatibility.

export function getDocumentActions({
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
  selectedDocuments,
  setSelectedDocuments,
  processDocuments
}: any) {

  // Toggle document selection for multi-select
  const toggleDocumentSelection = (doc: Document) => {
    setSelectedDocuments((prev: Document[]) => {
      const isSelected = prev.some(d => d.id === doc.id);
      if (isSelected) {
        return prev.filter(d => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  // Add document
  const handleAddDocument = async (files: FileList, category: DocumentCategory, expiryDate?: string) => {
    try {
      const newDocs: Document[] = Array.from(files).map((file, index) => {
        const detectedType = detectDocumentType(file.name);
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
          detected_type: detectedType || undefined,
          tags: suggestedTags
        };
      });

      for (const doc of newDocs) {
        const dbId = await saveDocumentToDatabase(doc);
        if (dbId) {
          doc.id = dbId;
          const initialVersion: DocumentVersion = {
            id: `version-${Date.now()}-1`,
            fileUrl: doc.fileUrl,
            uploadDate: doc.uploadDate,
            size: doc.size,
            versionNumber: 1
          };
          await saveDocumentVersionToDatabase(doc.id, initialVersion);
          doc.versions = [initialVersion];
        }
      }

      setDocuments((prev: Document[]) => [...processDocuments(newDocs), ...prev]);
      toast.success(`${files.length} document${files.length !== 1 ? 's' : ''} uploaded successfully.`);
      const expiringDocs = newDocs.filter(doc => doc.expiryDate && getDocumentStatus(doc.expiryDate) !== "valid");
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

  // Create folder
  const handleCreateFolder = (name: string, category: DocumentCategory) => {
    const newFolder: DocumentFolder = {
      id: `folder-${Date.now()}`,
      name,
      category
    };
    setFolders((prev: DocumentFolder[]) => [newFolder, ...prev]);
    toast.success("Folder created successfully");
    return newFolder;
  };

  // Delete document
  const handleDeleteDocument = async (id: string) => {
    const success = await deleteDocumentFromDatabase(id);
    setDocuments((prev: Document[]) => prev.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) setSelectedDocument(null);
    setSelectedDocuments((prev: Document[]) => prev.filter(doc => doc.id !== id));
    if (success) {
      toast.success("Document deleted successfully");
    } else {
      toast.warning("Document deleted locally but sync failed");
    }
  };

  // Rename document
  const handleRenameDocument = async (id: string, newName: string) => {
    const success = await updateDocumentInDatabase(id, { name: newName });
    setDocuments((prev: Document[]) => prev.map(d => d.id === id ? { ...d, name: newName } : d));
    if (selectedDocument?.id === id) setSelectedDocument((prev: Document | null) => prev ? { ...prev, name: newName } : null);
    setSelectedDocuments((prev: Document[]) => prev.map(d => d.id === id ? { ...d, name: newName } : d));
    if (success) {
      toast.success(`Renamed to "${newName}"`);
    } else {
      toast.warning(`Renamed locally but sync failed`);
    }
  };

  // Toggle required
  const handleToggleRequired = async (id: string) => {
    setDocuments((prev: Document[]) => 
      prev.map(doc => doc.id === id ? { ...doc, required: !doc.required } : doc)
    );
    // Find the updated document in the *new state* to get latest `required` value
    let newRequired = false;
    let docName = "";
    setDocuments((prev: Document[]) => {
      const updatedDocs = prev.map(doc => {
        if (doc.id === id) {
          newRequired = !doc.required;
          docName = doc.name;
          return { ...doc, required: newRequired };
        }
        return doc;
      });
      return updatedDocs;
    });
    const success = await updateDocumentInDatabase(id, { required: newRequired });
    if (success) {
      toast.success(newRequired ? "Marked as Required" : "Marked as Optional", {
        description: docName
      });
    } else {
      toast.warning(newRequired ? "Marked as Required locally but sync failed" : "Marked as Optional locally but sync failed");
    }
  };

  // Update expiry date
  const handleUpdateExpiry = async (id: string, expiryDate: string) => {
    const updatedStatus = getDocumentStatus(expiryDate);
    const success = await updateDocumentInDatabase(id, { expiryDate, status: updatedStatus });
    setDocuments((prev: Document[]) =>
      prev.map(doc =>
        doc.id === id
          ? { ...doc, expiryDate, status: updatedStatus }
          : doc
      )
    );
    if (selectedDocument?.id === id) setSelectedDocument((prev: Document | null) =>
      prev ? { ...prev, expiryDate, status: updatedStatus } : null
    );
    setSelectedDocuments((prev: Document[]) => prev.map(doc => 
      doc.id === id ? { ...doc, expiryDate, status: updatedStatus } : doc
    ));
    if (success) {
      if (updatedStatus === "expired") {
        toast.warning(`Document has expired as of ${new Date(expiryDate).toLocaleDateString()}`);
      } else if (updatedStatus === "expiring") {
        toast.info(`Document will expire soon on ${new Date(expiryDate).toLocaleDateString()}`);
      } else {
        toast.success(`Expiry date updated to ${new Date(expiryDate).toLocaleDateString()}`);
      }
    } else {
      toast.warning(`Expiry date updated locally but sync failed`);
    }
  };

  // Add document version
  const handleAddVersion = async (documentId: string, files: FileList, notes?: string) => {
    try {
      const docs = typeof setDocuments === "function" ? setDocuments : [];
      const doc = docs?.find((d: Document) => d.id === documentId);
      if (!doc) {
        toast.error("Document not found");
        return null;
      }
      const file = files[0];
      if (!file) {
        toast.error("No file selected");
        return null;
      }
      const currentVersions = doc.versions || [];
      const nextVersionNumber = currentVersions.length + 1;
      const newVersion: DocumentVersion = {
        id: `version-${Date.now()}-${nextVersionNumber}`,
        fileUrl: URL.createObjectURL(file),
        uploadDate: new Date().toLocaleDateString(),
        size: formatFileSize(file.size),
        versionNumber: nextVersionNumber,
        notes
      };
      const versionId = await saveDocumentVersionToDatabase(documentId, newVersion);
      if (versionId) {
        newVersion.id = versionId;
        const updatedVersions = [...currentVersions, newVersion];
        setDocuments((prev: Document[]) => 
          prev.map(d => d.id === documentId ? {
            ...d,
            versions: updatedVersions,
            fileUrl: newVersion.fileUrl
          } : d)
        );
        if (selectedDocument?.id === documentId)
          setSelectedDocument((prev: Document | null) =>
            prev ? { ...prev, versions: updatedVersions, fileUrl: newVersion.fileUrl } : null
          );
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

  // Create packet
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
    setSelectedDocuments([]);
    toast.success("Document packet created", {
      description: "You can now share the packet with others."
    });
    return newPacket;
  };

  return {
    toggleDocumentSelection,
    handleAddDocument,
    handleCreateFolder,
    handleDeleteDocument,
    handleRenameDocument,
    handleToggleRequired,
    handleUpdateExpiry,
    handleAddVersion,
    handleCreatePacket
  };
}
