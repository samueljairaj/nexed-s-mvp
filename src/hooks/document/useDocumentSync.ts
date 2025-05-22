
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Document, DocumentCategory, DocumentFolder } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDocumentStatus } from "@/utils/documentUtils";

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
}

export function useDocumentSync(
  setDocuments: Dispatch<SetStateAction<Document[]>>,
  setFolders: Dispatch<SetStateAction<DocumentFolder[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);
  const { currentUser } = useAuth();

  // Set up Supabase realtime subscription
  useEffect(() => {
    if (!currentUser?.id) return;

    // Clean up any existing subscription
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }

    // Set up a new subscription
    const subscription = supabase
      .channel('document-vault-changes')
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

    setRealtimeSubscription(subscription);

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id, setDocuments]);

  // Load documents from Supabase
  const syncDocuments = async () => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch documents from Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform database format to our Document format
        const transformedDocs: Document[] = data.map((doc: DatabaseDocument) => ({
          id: doc.id,
          name: doc.title,
          type: doc.file_type || 'application/pdf',
          category: doc.category as DocumentCategory,
          uploadDate: new Date(doc.created_at).toLocaleDateString(),
          size: '1.2 MB', // This would need to be stored in the database
          required: doc.is_required || false,
          fileUrl: doc.file_url,
          // Handle case where expiry_date might not exist in database schema
          expiryDate: doc.expiry_date || undefined,
          status: doc.expiry_date ? getDocumentStatus(doc.expiry_date) : undefined,
          user_id: doc.user_id
        }));
        
        setDocuments(transformedDocs);
      } else {
        // If no documents found, use mock data for now
        // In a production app, you'd start with an empty array
        setDocuments(processMockDocuments(mockDocuments));
      }
      
      // Fetch folders if you have a folders table
      // For now, use mock folders
      setFolders(mockFolders);
      
    } catch (error) {
      console.error("Error loading documents:", error);
      // Fallback to mock data
      setDocuments(processMockDocuments(mockDocuments));
      setFolders(mockFolders);
    } finally {
      setIsLoading(false);
    }
  };

  // Process mock documents to add status based on expiry date
  const processMockDocuments = (docs: Document[]) => {
    return docs.map(doc => ({
      ...doc,
      status: doc.expiryDate ? getDocumentStatus(doc.expiryDate) : undefined
    }));
  };

  // Load documents on component mount
  useEffect(() => {
    syncDocuments();
  }, [currentUser?.id]);

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
          user_id: currentUser.id
        })
        .select();
        
      if (error) throw error;
      
      return data?.[0]?.id || null;
    } catch (error) {
      console.error("Error saving document to database:", error);
      return null;
    }
  };

  // Update document in Supabase
  const updateDocumentInDatabase = async (id: string, updates: Partial<Document>) => {
    if (!currentUser?.id) return false;
    
    try {
      // Convert Document fields to database column names
      const dbUpdates: any = {};
      
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
