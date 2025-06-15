
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentCategory, DocumentStatus } from "@/types/document";

export interface DocumentData {
  id: string;
  user_id: string;
  title: string;
  category: DocumentCategory;
  file_url: string;
  file_type?: string;
  is_required: boolean;
  expiry_date?: string;
  detected_type?: string;
  tags?: string[];
  status?: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export class DocumentService {
  static async fetchDocuments(userId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDocumentFromDB);
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async createDocument(document: Partial<DocumentData>): Promise<Document> {
    try {
      const documentData = {
        user_id: document.user_id!,
        title: document.title!,
        category: document.category! as DocumentCategory,
        file_url: document.file_url!,
        file_type: document.file_type,
        is_required: !!document.is_required,
        expiry_date: document.expiry_date,
        detected_type: document.detected_type,
        tags: document.tags,
        status: (document.status || 'pending') as DocumentStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
        .single();

      if (error) throw error;

      return this.mapDocumentFromDB(data);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  static async updateDocument(id: string, updates: Partial<DocumentData>): Promise<Document> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        // Ensure that updated category and status use the correct DB enum values
        ...(updates.category && { category: updates.category as DocumentCategory }),
        ...(updates.status && { status: updates.status as DocumentStatus }),
      };

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapDocumentFromDB(data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  private static mapDocumentFromDB(dbDoc: any): Document {
    return {
      id: dbDoc.id,
      name: dbDoc.title,
      type: dbDoc.file_type || 'application/octet-stream',
      category: dbDoc.category as DocumentCategory,
      uploadDate: new Date(dbDoc.created_at).toLocaleDateString(),
      size: '0 KB', // This would need to be calculated from the actual file
      required: !!dbDoc.is_required,
      fileUrl: dbDoc.file_url,
      expiryDate: dbDoc.expiry_date,
      status: dbDoc.status as DocumentStatus,
      detected_type: dbDoc.detected_type,
      tags: dbDoc.tags,
      user_id: dbDoc.user_id
    };
  }
}
