
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Document, DocumentCategory } from "@/types/document";
import { DocumentService } from "@/services/documentService";
import { toast } from "sonner";

export function useDocumentData() {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }

    fetchDocuments();
  }, [currentUser?.id]);

  const fetchDocuments = async () => {
    if (!currentUser?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedDocuments = await DocumentService.fetchDocuments(currentUser.id);
      setDocuments(fetchedDocuments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(errorMessage);
      console.error('Error fetching documents:', err);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const addDocument = async (file: File, category: DocumentCategory, expiryDate?: string) => {
    if (!currentUser?.id) return null;

    try {
      // In a real implementation, you'd upload the file to storage first
      const fileUrl = URL.createObjectURL(file);
      
      const newDocument = await DocumentService.createDocument({
        user_id: currentUser.id,
        title: file.name,
        category,
        file_url: fileUrl,
        file_type: file.type,
        is_required: false,
        expiry_date: expiryDate
      });

      setDocuments(prev => [newDocument, ...prev]);
      toast.success('Document uploaded successfully');
      return newDocument;
    } catch (err) {
      console.error('Error adding document:', err);
      toast.error('Failed to upload document');
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const updatedDocument = await DocumentService.updateDocument(id, {
        title: updates.name,
        is_required: updates.required,
        expiry_date: updates.expiryDate
      });

      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );

      toast.success('Document updated successfully');
    } catch (err) {
      console.error('Error updating document:', err);
      toast.error('Failed to update document');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await DocumentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
    }
  };

  const refreshDocuments = () => {
    fetchDocuments();
  };

  return {
    documents,
    isLoading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments
  };
}
