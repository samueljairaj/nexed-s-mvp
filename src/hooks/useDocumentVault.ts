
import { useState, useEffect } from "react";
import { Document, DocumentCategory, DocumentStatus, DocumentPacket } from "@/types/document";
import { toast } from "sonner";
import { getDocumentStatus } from "@/utils/documentUtils";
import { useAuth } from "@/contexts/AuthContext";

export function useDocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [packets, setPackets] = useState<DocumentPacket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  
  const { currentUser } = useAuth();

  // Process documents to add status based on expiry date
  const processDocuments = (docs: Document[]) => {
    return docs.map(doc => ({
      ...doc,
      status: doc.expiryDate ? getDocumentStatus(doc.expiryDate) : undefined
    }));
  };

  // Load documents
  useEffect(() => {
    // Simulate API call to get documents
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call to fetch documents
        setTimeout(() => {
          const mockDocs = mockDocuments.map(doc => ({
            ...doc,
            status: doc.expiryDate ? getDocumentStatus(doc.expiryDate) : undefined
          }));
          setDocuments(mockDocs);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error loading documents:", error);
        toast.error("Failed to load documents");
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Filter documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? doc.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Document actions
  const handleAddDocument = async (files: FileList, category: DocumentCategory, expiryDate?: string) => {
    try {
      // Simulate upload to server
      const newDocs: Document[] = Array.from(files).map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        category: category,
        uploadDate: new Date().toLocaleDateString(),
        size: formatFileSize(file.size),
        required: false,
        fileUrl: URL.createObjectURL(file),
        expiryDate,
        status: expiryDate ? getDocumentStatus(expiryDate) : undefined
      }));

      setDocuments(prev => [...processDocuments(newDocs), ...prev]);
      toast.success(`${files.length} document${files.length !== 1 ? 's' : ''} uploaded successfully.`);
      
      // If any document has an expiry date, check if it needs attention
      const expiringDocs = newDocs.filter(doc => 
        doc.expiryDate && getDocumentStatus(doc.expiryDate) !== "valid"
      );
      
      if (expiringDocs.length > 0) {
        toast(`${expiringDocs.length} document${expiringDocs.length !== 1 ? 's' : ''} need${expiringDocs.length === 1 ? 's' : ''} attention.`, {
          description: "Some documents are expired or will expire soon.",
          duration: 5000,
        });
      }
      
      return newDocs;
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
      return [];
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success("Document deleted successfully");
  };

  const handleRenameDocument = (id: string, newName: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, name: newName } : doc
      )
    );
    
    if (selectedDocument?.id === id) {
      setSelectedDocument(prev => prev ? { ...prev, name: newName } : null);
    }
    
    setSelectedDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, name: newName } : doc
      )
    );
    
    toast.success(`Renamed to "${newName}"`);
  };

  const handleToggleRequired = (id: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, required: !doc.required } : doc
      )
    );
    
    if (selectedDocument?.id === id) {
      setSelectedDocument(prev => 
        prev ? { ...prev, required: !prev.required } : null
      );
    }
    
    setSelectedDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, required: !doc.required } : doc
      )
    );
    
    const doc = documents.find(d => d.id === id);
    const newStatus = !doc?.required;
    
    toast({
      title: newStatus ? "Marked as Required" : "Marked as Optional",
      description: doc?.name,
    });
  };

  const handleUpdateExpiry = (id: string, expiryDate: string) => {
    const updatedStatus = getDocumentStatus(expiryDate);
    
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
    
    toast.success(`Expiry date updated`);
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

  return {
    documents,
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
    handleDeleteDocument,
    handleRenameDocument,
    handleToggleRequired,
    handleUpdateExpiry,
    handleCreatePacket,
  };
}

// Mock documents data with added expiry dates and versions
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Passport.pdf",
    type: "application/pdf",
    category: "immigration",
    uploadDate: "May 5, 2025",
    size: "2.4 MB",
    required: true,
    fileUrl: "/placeholder.svg",
    expiryDate: "2026-05-05",
    versions: [
      {
        id: "v1-doc-1",
        fileUrl: "/placeholder.svg",
        uploadDate: "May 5, 2025",
        size: "2.4 MB",
        versionNumber: 1
      }
    ]
  },
  {
    id: "doc-2",
    name: "I-20.pdf",
    type: "application/pdf",
    category: "immigration",
    uploadDate: "May 2, 2025",
    size: "1.2 MB",
    required: true,
    fileUrl: "/placeholder.svg",
    expiryDate: "2025-06-15",
    versions: [
      {
        id: "v1-doc-2",
        fileUrl: "/placeholder.svg",
        uploadDate: "Jan 5, 2025",
        size: "1.1 MB",
        versionNumber: 1
      },
      {
        id: "v2-doc-2",
        fileUrl: "/placeholder.svg",
        uploadDate: "May 2, 2025",
        size: "1.2 MB",
        versionNumber: 2
      }
    ]
  },
  {
    id: "doc-3",
    name: "University Admission Letter.pdf",
    type: "application/pdf",
    category: "education",
    uploadDate: "Apr 28, 2025",
    size: "543 KB",
    required: false,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-4",
    name: "Transcript.pdf",
    type: "application/pdf",
    category: "education",
    uploadDate: "Apr 25, 2025",
    size: "1.8 MB",
    required: false,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-5",
    name: "Employment Offer Letter.pdf",
    type: "application/pdf",
    category: "employment",
    uploadDate: "Apr 20, 2025",
    size: "378 KB",
    required: true,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-6",
    name: "Driver's License.jpg",
    type: "image/jpeg",
    category: "personal",
    uploadDate: "Apr 15, 2025",
    size: "1.1 MB",
    required: false,
    fileUrl: "/placeholder.svg",
    expiryDate: "2025-05-30"
  },
  {
    id: "doc-7",
    name: "Apartment Lease.pdf",
    type: "application/pdf",
    category: "personal",
    uploadDate: "Apr 10, 2025",
    size: "2.3 MB",
    required: false,
    fileUrl: "/placeholder.svg",
    expiryDate: "2026-04-10"
  },
  {
    id: "doc-8",
    name: "Health Insurance.pdf",
    type: "application/pdf",
    category: "personal",
    uploadDate: "Apr 5, 2025",
    size: "980 KB",
    required: true,
    fileUrl: "/placeholder.svg",
    expiryDate: "2025-05-01"
  },
  {
    id: "doc-9",
    name: "Bank Statement.pdf",
    type: "application/pdf",
    category: "financial",
    uploadDate: "Apr 2, 2025",
    size: "1.5 MB",
    required: false,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-10",
    name: "Credit Card Statement.pdf",
    type: "application/pdf",
    category: "financial",
    uploadDate: "Mar 28, 2025",
    size: "1.2 MB",
    required: false,
    fileUrl: "/placeholder.svg"
  }
];
