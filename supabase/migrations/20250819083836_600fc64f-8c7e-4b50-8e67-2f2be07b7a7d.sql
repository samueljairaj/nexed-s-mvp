-- Phase 1: Critical Fixes - Add missing triggers and harden security

-- 1. Fix search_path security in existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile for all users
  INSERT INTO public.profiles (
    id, 
    email, 
    role,
    name
  ) VALUES (
    NEW.id, 
    NEW.email,
    -- Extract role from user metadata or default to 'student'
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    -- Extract name from metadata if available
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  
  -- If this is a DSO user, also create a DSO profile
  IF (NEW.raw_user_meta_data->>'role') = 'dso' THEN
    INSERT INTO public.dso_profiles (
      id,
      contact_email
    ) VALUES (
      NEW.id,
      NEW.email
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Ensure the trigger exists for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Add updated_at triggers where missing
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables that have updated_at but no trigger
DO $$
BEGIN
  -- profiles table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_profiles') THEN
    CREATE TRIGGER set_updated_at_profiles
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  -- universities table  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_universities') THEN
    CREATE TRIGGER set_updated_at_universities
      BEFORE UPDATE ON public.universities
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  -- dso_profiles table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_dso_profiles') THEN
    CREATE TRIGGER set_updated_at_dso_profiles
      BEFORE UPDATE ON public.dso_profiles
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  -- compliance_tasks table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_compliance_tasks') THEN
    CREATE TRIGGER set_updated_at_compliance_tasks
      BEFORE UPDATE ON public.compliance_tasks
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  -- documents table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_documents') THEN
    CREATE TRIGGER set_updated_at_documents
      BEFORE UPDATE ON public.documents
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  -- student_notes table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_student_notes') THEN
    CREATE TRIGGER set_updated_at_student_notes
      BEFORE UPDATE ON public.student_notes
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 4. Fix document versioning trigger security
CREATE OR REPLACE FUNCTION public.update_document_latest_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Set all versions of this document to not current
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.document_versions 
    SET is_current = FALSE 
    WHERE document_id = NEW.document_id;
    
    -- Set the new/updated version to current
    NEW.is_current := TRUE;
    
    -- Update the parent document's latest_version_id
    UPDATE public.documents 
    SET latest_version_id = NEW.id 
    WHERE id = NEW.document_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure document versioning trigger exists
DROP TRIGGER IF EXISTS update_document_latest_version_trigger ON public.document_versions;
CREATE TRIGGER update_document_latest_version_trigger
  BEFORE INSERT OR UPDATE ON public.document_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_document_latest_version();

-- Phase 2: Performance Indexes
-- Add indexes for common query patterns

-- Profiles table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_university_id ON public.profiles (university_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Documents table indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_id ON public.documents (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_category ON public.documents (category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_status ON public.documents (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_expiry_date ON public.documents (expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_not_deleted ON public.documents (user_id, is_deleted) WHERE is_deleted = false;

-- Compliance tasks indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_user_id ON public.compliance_tasks (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_due_date ON public.compliance_tasks (due_date) WHERE due_date IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_not_deleted ON public.compliance_tasks (user_id, is_deleted) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_priority ON public.compliance_tasks (priority);

-- Document versions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_versions_document_id ON public.document_versions (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_versions_current ON public.document_versions (document_id, is_current) WHERE is_current = true;

-- Audit logs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at);

-- DSO profiles indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dso_profiles_approval_status ON public.dso_profiles (approval_status);

-- Phase 3: Create storage bucket for file uploads
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

-- Phase 4: Harden existing functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_dso()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN (SELECT role = 'dso' FROM public.profiles WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.is_same_university(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_uni_id UUID;
  auth_uni_id UUID;
BEGIN
  SELECT university_id INTO user_uni_id FROM public.profiles WHERE id = user_id;
  SELECT university_id INTO auth_uni_id FROM public.profiles WHERE id = auth.uid();
  
  RETURN user_uni_id = auth_uni_id AND auth_uni_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_my_student(student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN public.is_dso() AND public.is_same_university(student_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_university_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN (SELECT university_id FROM public.profiles WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.log_audit_event(entity_type text, entity_id uuid, action text, details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, details)
  VALUES (auth.uid(), entity_type, entity_id, action, details);
END;
$$;