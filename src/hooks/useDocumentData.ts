
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
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to fetch documents";
      
      console.error('Error fetching documents:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addDocument = async (file: File, category: DocumentCategory, expiryDate?: string) => {
    if (!currentUser?.id) return null;

    try {
      const fileUrl = URL.createObjectURL(file);
      const newDocument = await DocumentService.createDocument({
        user_id: currentUser.id,
        title: file.name,
        category,
        file_url: fileUrl,
        file_type: file.type,
        is_required: false,
        expiry_date: expiryDate,
        is_deleted: false,
      });

      setDocuments(prev => [newDocument, ...prev]);
      toast.success('Document uploaded successfully');
      return newDocument;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to upload document";
      
      console.error('Error adding document:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const updatedDocument = await DocumentService.updateDocument(id, {
        title: updates.name,
        is_required: updates.required,
        expiry_date: updates.expiryDate,
        ...(updates.category && { category: updates.category }),
        ...(updates.status && { status: updates.status })
      });

      setDocuments(prev =>
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );

      toast.success('Document updated successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to update document";
      
      console.error('Error updating document:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await DocumentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to delete document";
      
      console.error('Error deleting document:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const restoreDocument = async (id: string) => {
    try {
      const restoredDocument = await DocumentService.restoreDocument(id);
      setDocuments(prev => [restoredDocument, ...prev]);
      toast.success("Document restored successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to restore document";
      
      console.error('Error restoring document:', err);
      setError(errorMessage);
      toast.error(errorMessage);
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
    restoreDocument,
    refreshDocuments
  };
}

