-- Phase 2: Add performance indexes and storage bucket

-- Performance indexes (without CONCURRENTLY to avoid transaction issues)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_university_id ON public.profiles (university_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Documents table indexes  
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents (expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_not_deleted ON public.documents (user_id, is_deleted);

-- Compliance tasks indexes
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_user_id ON public.compliance_tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_due_date ON public.compliance_tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_not_deleted ON public.compliance_tasks (user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_priority ON public.compliance_tasks (priority);

-- Document versions indexes
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions (document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_current ON public.document_versions (document_id, is_current);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at);

-- DSO profiles indexes
CREATE INDEX IF NOT EXISTS idx_dso_profiles_approval_status ON public.dso_profiles (approval_status);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for documents bucket
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DSOs can manage documents for their students
CREATE POLICY "DSOs can manage their students' documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' AND 
  is_my_student((storage.foldername(name))[1]::uuid)
);