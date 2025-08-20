
-- Phase 1: Critical Security & Data Integrity Fixes (Corrected v3)

-- Step 1: Create Enum Types for data consistency (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_category_enum') THEN
        CREATE TYPE public.document_category_enum AS ENUM ('immigration', 'education', 'employment', 'personal', 'financial', 'other', 'academic');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status_enum') THEN
        CREATE TYPE public.document_status_enum AS ENUM ('valid', 'expiring', 'expired', 'pending', 'rejected', 'approved');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority_enum') THEN
        CREATE TYPE public.task_priority_enum AS ENUM ('low', 'medium', 'high');
    END IF;
END$$;

-- Step 2: Alter tables using a safe temporary column method
-- For `documents.category`
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS category_new public.document_category_enum;
UPDATE public.documents SET category_new = category::text::document_category_enum WHERE category_new IS NULL;
ALTER TABLE public.documents DROP COLUMN IF EXISTS category;
ALTER TABLE public.documents RENAME COLUMN category_new TO category;
ALTER TABLE public.documents ALTER COLUMN category SET NOT NULL;

-- For `documents.status`
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS status_new public.document_status_enum;
UPDATE public.documents SET status_new = status::text::document_status_enum WHERE status_new IS NULL;
ALTER TABLE public.documents DROP COLUMN IF EXISTS status;
ALTER TABLE public.documents RENAME COLUMN status_new TO status;
ALTER TABLE public.documents ALTER COLUMN status SET DEFAULT 'pending'::public.document_status_enum;

-- For `compliance_tasks.priority`
ALTER TABLE public.compliance_tasks ADD COLUMN IF NOT EXISTS priority_new public.task_priority_enum;
UPDATE public.compliance_tasks SET priority_new = priority::text::task_priority_enum WHERE priority_new IS NULL;
ALTER TABLE public.compliance_tasks DROP COLUMN IF EXISTS priority;
ALTER TABLE public.compliance_tasks RENAME COLUMN priority_new TO priority;
ALTER TABLE public.compliance_tasks ALTER COLUMN priority SET NOT NULL;
ALTER TABLE public.compliance_tasks ALTER COLUMN priority SET DEFAULT 'medium'::public.task_priority_enum;

-- Step 3: Add Foreign Key Constraints (Idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_user_id_fkey') THEN
        ALTER TABLE public.documents ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compliance_tasks_user_id_fkey') THEN
        ALTER TABLE public.compliance_tasks ADD CONSTRAINT compliance_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey') THEN
        ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_versions_uploaded_by_fkey') THEN
        ALTER TABLE public.document_versions ADD CONSTRAINT document_versions_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 4: Enable Row Level Security (RLS) on all user-data tables (Idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies (Idempotent)
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
CREATE POLICY "Users can view and update their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "DSOs can view profiles of their students" ON public.profiles;
CREATE POLICY "DSOs can view profiles of their students" ON public.profiles FOR SELECT USING (public.is_my_student(id));

DROP POLICY IF EXISTS "Users can manage their own documents" ON public.documents;
CREATE POLICY "Users can manage their own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "DSOs can manage documents of their students" ON public.documents;
CREATE POLICY "DSOs can manage documents of their students" ON public.documents FOR ALL USING (public.is_my_student(user_id));

DROP POLICY IF EXISTS "Users can manage their own document versions" ON public.document_versions;
CREATE POLICY "Users can manage their own document versions" ON public.document_versions FOR ALL USING ((SELECT user_id FROM public.documents WHERE id = document_id) = auth.uid());

DROP POLICY IF EXISTS "DSOs can manage versions for their students' documents" ON public.document_versions;
CREATE POLICY "DSOs can manage versions for their students' documents" ON public.document_versions FOR ALL USING (public.is_my_student((SELECT user_id FROM public.documents WHERE id = document_id)));

DROP POLICY IF EXISTS "Users can manage their own compliance tasks" ON public.compliance_tasks;
CREATE POLICY "Users can manage their own compliance tasks" ON public.compliance_tasks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "DSOs can manage tasks for their students" ON public.compliance_tasks;
CREATE POLICY "DSOs can manage tasks for their students" ON public.compliance_tasks FOR ALL USING (public.is_my_student(user_id));

DROP POLICY IF EXISTS "DSOs can manage notes for their students" ON public.student_notes;
CREATE POLICY "DSOs can manage notes for their students" ON public.student_notes FOR ALL USING (public.is_my_student(student_id) AND public.is_dso() AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "DSOs can view audit logs of their students" ON public.audit_logs;
CREATE POLICY "DSOs can view audit logs of their students" ON public.audit_logs FOR SELECT USING (public.is_my_student(user_id));
