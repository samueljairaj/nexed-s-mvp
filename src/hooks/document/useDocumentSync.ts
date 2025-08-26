
import { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
import { Document, DocumentCategory, DocumentFolder, DocumentVersion } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-hooks";
import { getDocumentStatus, detectDocumentType, suggestDocumentTags } from "@/utils/documentUtils";

// Define the database document type to match what Supabase returns
interface DatabaseDocument {
  id: string;
  title: string;
  file_type?: string;
  category: string;
  created_at: string;
  is_required: boolean;
  file_url: string;
  expiry_date?: string;
  user_id: string;
  status?: string;
  review_comment?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  updated_at: string;
  detected_type?: string;
  tags?: string[];
  latest_version_id?: string;
}

// Define the database document version type
interface DatabaseDocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_url: string;
  upload_date: string;
  size: string;
  uploaded_by?: string;
  notes?: string;
  is_current: boolean;
}

export function useDocumentSync(
  setDocuments: Dispatch<SetStateAction<Document[]>>,
  setFolders: Dispatch<SetStateAction<DocumentFolder[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  const [realtimeSubscription, setRealtimeSubscription] = useState<{ documentChannel: { unsubscribe: () => void }; versionChannel: { unsubscribe: () => void } } | null>(null);
  const { currentUser } = useAuth();

  // Set up Supabase realtime subscription
  useEffect(() => {
    if (!currentUser?.id) return;

    // Clean up any existing subscription
    if (realtimeSubscription) {
      realtimeSubscription.documentChannel.unsubscribe();
      realtimeSubscription.versionChannel.unsubscribe();
    }

    // Set up a new subscription for documents
    const documentChannel = supabase
      .channel('document-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        console.log('Realtime document update received:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          setDocuments(prev => {
            // Check if document already exists to avoid duplicates
            if (prev.some(doc => doc.id === payload.new.id)) {
              return prev;
            }
            
            // Convert database document to our Document format
            const newDoc: Document = {
              id: payload.new.id,
              name: payload.new.title,
              type: payload.new.file_type || 'application/pdf',
              category: payload.new.category as DocumentCategory,
              uploadDate: new Date(payload.new.created_at).toLocaleDateString(),
              size: '1.2 MB', // This would need to be stored in the database
              required: payload.new.is_required || false,
              fileUrl: payload.new.file_url,
              // Check if expiry_date exists in the payload
              expiryDate: payload.new.expiry_date || undefined,
              status: payload.new.expiry_date ? getDocumentStatus(payload.new.expiry_date) : undefined,
              user_id: payload.new.user_id
            };
            
            return [...prev, newDoc];
          });
        } else if (payload.eventType === 'UPDATE') {
          setDocuments(prev => prev.map(doc => {
            if (doc.id === payload.new.id) {
              return {
                ...doc,
                name: payload.new.title,
                type: payload.new.file_type || doc.type,
                category: payload.new.category as DocumentCategory,
                required: payload.new.is_required,
                fileUrl: payload.new.file_url,
                expiryDate: payload.new.expiry_date || undefined,
                status: payload.new.expiry_date ? getDocumentStatus(payload.new.expiry_date) : doc.status
              };
            }
            return doc;
          }));
        } else if (payload.eventType === 'DELETE') {
          setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
        }
      })
      .subscribe();

    // Set up a new subscription for document versions
    const versionChannel = supabase
      .channel('document-version-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'document_versions'
      }, async (payload) => {
        console.log('Realtime document version update received:', payload);
        
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // Get the document ID
          const documentId = payload.new.document_id;
          
          // Check if this document belongs to the current user
          const { data: docData } = await supabase
            .from('documents')
            .select('user_id')
            .eq('id', documentId)
            .single();
            
          if (docData && docData.user_id === currentUser.id) {
            // Fetch all versions for this document
            const { data: versions } = await supabase
              .from('document_versions')
              .select('*')
              .eq('document_id', documentId)
              .order('version_number', { ascending: false });
              
            if (versions) {
              // Transform versions to our format
              const transformedVersions: DocumentVersion[] = versions.map((v: DatabaseDocumentVersion) => ({
                id: v.id,
                fileUrl: v.file_url,
                uploadDate: new Date(v.upload_date).toLocaleDateString(),
                size: v.size,
                versionNumber: v.version_number,
                notes: v.notes,
                is_current: v.is_current
              }));
              
              // Update the document with the versions
              setDocuments(prev => 
                prev.map(doc => 
                  doc.id === documentId ? {
                    ...doc,
                    versions: transformedVersions,
                    // Update fileUrl with the latest version if it's current
                    fileUrl: transformedVersions.find(v => v.is_current)?.fileUrl || doc.fileUrl
                  } : doc
                )
              );
            }
          }
        }
      })
      .subscribe();

    setRealtimeSubscription({ documentChannel, versionChannel });

    // Clean up subscription on unmount
    return () => {
      documentChannel.unsubscribe();
      versionChannel.unsubscribe();
    };
  }, [currentUser?.id, setDocuments]);

  // Load documents from Supabase
  const syncDocuments = useCallback(async () => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch documents from Supabase
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (documentsError) throw documentsError;
      
      let transformedDocs: Document[] = [];
      
      if (documents && documents.length > 0) {
        // Get document IDs
        const documentIds = documents.map((doc: DatabaseDocument) => doc.id);
        
        // Fetch document versions
        const { data: versions, error: versionsError } = await supabase
          .from('document_versions')
          .select('*')
          .in('document_id', documentIds);
          
        if (versionsError) throw versionsError;
        
        // Group versions by document ID
        const versionsByDocId: Record<string, DocumentVersion[]> = {};
        if (versions) {
          versions.forEach((version: DatabaseDocumentVersion) => {
            if (!versionsByDocId[version.document_id]) {
              versionsByDocId[version.document_id] = [];
            }
            versionsByDocId[version.document_id].push({
              id: version.id,
              fileUrl: version.file_url,
              uploadDate: new Date(version.upload_date).toLocaleDateString(),
              size: version.size,
              versionNumber: version.version_number,
              notes: version.notes,
              is_current: version.is_current
            });
          });
        }
        
        // Transform database format to our Document format
        transformedDocs = documents.map((doc: DatabaseDocument) => ({
          id: doc.id,
          name: doc.title,
          type: doc.file_type || 'application/pdf',
          category: doc.category as DocumentCategory,
          uploadDate: new Date(doc.created_at).toLocaleDateString(),
          size: '1.2 MB', // This would need to be stored in the database
          required: doc.is_required || false,
          fileUrl: doc.file_url,
          expiryDate: doc.expiry_date || undefined,
          status: doc.expiry_date ? getDocumentStatus(doc.expiry_date) : undefined,
          user_id: doc.user_id,
          detected_type: doc.detected_type,
          tags: doc.tags,
          latest_version_id: doc.latest_version_id,
          versions: versionsByDocId[doc.id] || []
        }));
        
        setDocuments(transformedDocs);
      } else {
        // If no documents found, use mock data for now
        setDocuments(processMockDocuments(mockDocuments));
      }
      
      // Fetch folders if you have a folders table
      setFolders(mockFolders);
      
    } catch (error) {
      console.error("Error loading documents:", error);
      // Fallback to mock data
      setDocuments(processMockDocuments(mockDocuments));
      setFolders(mockFolders);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, setDocuments, setFolders]);

  // Process mock documents to add status based on expiry date
  const processMockDocuments = (docs: Document[]) => {
    return docs.map(doc => {
      // Add smart categorization fields to mock data
      const detectedType = detectDocumentType(doc.name);
      const suggestedTags = suggestDocumentTags(doc.name, doc.category);
      
      return {
        ...doc,
        status: doc.expiryDate ? getDocumentStatus(doc.expiryDate) : undefined,
        detected_type: detectedType,
        tags: suggestedTags
      };
    });
  };

  // Load documents on component mount
  useEffect(() => {
    syncDocuments();
  }, [currentUser?.id, syncDocuments]);

  // Save document to Supabase
  const saveDocumentToDatabase = async (doc: Document) => {
    if (!currentUser?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          id: doc.id,
          title: doc.name,
          file_type: doc.type,
          category: doc.category,
          file_url: doc.fileUrl,
          is_required: doc.required,
          expiry_date: doc.expiryDate,
          user_id: currentUser.id,
          detected_type: doc.detected_type,
          tags: doc.tags
        })
        .select();
        
      if (error) throw error;
      
      return data?.[0]?.id || null;
    } catch (error) {
      console.error("Error saving document to database:", error);
      return null;
    }
  };

  // Save document version to Supabase
  const saveDocumentVersionToDatabase = async (documentId: string, version: DocumentVersion) => {
    if (!currentUser?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: version.versionNumber,
          file_url: version.fileUrl,
          size: version.size,
          uploaded_by: currentUser.id,
          notes: version.notes
        })
        .select();
        
      if (error) throw error;
      
      return data?.[0]?.id || null;
    } catch (error) {
      console.error("Error saving document version to database:", error);
      return null;
    }
  };

  // Update document in Supabase
  const updateDocumentInDatabase = async (id: string, updates: Partial<Document>) => {
    if (!currentUser?.id) return false;
    
    try {
      // Convert Document fields to database column names
      const dbUpdates: Record<string, string | boolean | undefined> = {};
      
      if (updates.name !== undefined) dbUpdates.title = updates.name;
      if (updates.type !== undefined) dbUpdates.file_type = updates.type;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.fileUrl !== undefined) dbUpdates.file_url = updates.fileUrl;
      if (updates.required !== undefined) dbUpdates.is_required = updates.required;
      if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
      
      const { error } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error updating document in database:", error);
      return false;
    }
  };

  // Delete document from Supabase
  const deleteDocumentFromDatabase = async (id: string) => {
    if (!currentUser?.id) return false;
    
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error deleting document from database:", error);
      return false;
    }
  };

  return {
    saveDocumentToDatabase,
    updateDocumentInDatabase,
    deleteDocumentFromDatabase,
    saveDocumentVersionToDatabase,
    syncDocuments
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

// Mock folders
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
