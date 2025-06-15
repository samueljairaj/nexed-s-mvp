
-- Critical Database Health Improvements for neXed Platform

-- Step 1: Add missing foreign key constraints for data integrity
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS fk_documents_user;

ALTER TABLE public.documents
ADD CONSTRAINT fk_documents_user
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.compliance_tasks
DROP CONSTRAINT IF EXISTS fk_compliance_tasks_user;

ALTER TABLE public.compliance_tasks
ADD CONSTRAINT fk_compliance_tasks_user
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 2: Implement comprehensive RLS policies for security

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
CREATE POLICY "Users can view and update their own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "DSOs can view profiles of their students" ON public.profiles;
CREATE POLICY "DSOs can view profiles of their students" 
ON public.profiles FOR SELECT 
USING (public.is_my_student(id));

-- Documents table policies
DROP POLICY IF EXISTS "Users can manage their own documents" ON public.documents;
CREATE POLICY "Users can manage their own documents" 
ON public.documents FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "DSOs can manage documents of their students" ON public.documents;
CREATE POLICY "DSOs can manage documents of their students" 
ON public.documents FOR ALL 
USING (public.is_my_student(user_id));

-- Compliance tasks table policies
DROP POLICY IF EXISTS "Users can manage their own compliance tasks" ON public.compliance_tasks;
CREATE POLICY "Users can manage their own compliance tasks" 
ON public.compliance_tasks FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "DSOs can manage tasks for their students" ON public.compliance_tasks;
CREATE POLICY "DSOs can manage tasks for their students" 
ON public.compliance_tasks FOR ALL 
USING (public.is_my_student(user_id));

-- Document versions table policies
DROP POLICY IF EXISTS "Users can manage their own document versions" ON public.document_versions;
CREATE POLICY "Users can manage their own document versions" 
ON public.document_versions FOR ALL 
USING ((SELECT user_id FROM public.documents WHERE id = document_id) = auth.uid());

DROP POLICY IF EXISTS "DSOs can manage versions for their students' documents" ON public.document_versions;
CREATE POLICY "DSOs can manage versions for their students' documents" 
ON public.document_versions FOR ALL 
USING (public.is_my_student((SELECT user_id FROM public.documents WHERE id = document_id)));

-- Student notes table policies
DROP POLICY IF EXISTS "DSOs can manage notes for their students" ON public.student_notes;
CREATE POLICY "DSOs can manage notes for their students" 
ON public.student_notes FOR ALL 
USING (public.is_my_student(student_id) AND public.is_dso() AND auth.uid() = author_id);

-- Audit logs table policies
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "DSOs can view audit logs of their students" ON public.audit_logs;
CREATE POLICY "DSOs can view audit logs of their students" 
ON public.audit_logs FOR SELECT 
USING (public.is_my_student(user_id));

-- Step 3: Add performance indexes for critical queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id_deleted ON public.documents(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_user_id_deleted ON public.compliance_tasks(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_due_date ON public.compliance_tasks(due_date) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_entity ON public.audit_logs(user_id, entity_type, entity_id);

-- Step 4: Ensure proper auth trigger exists for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
