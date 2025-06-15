
-- Add is_deleted for soft deletes in documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Add is_deleted for soft deletes in compliance_tasks
ALTER TABLE public.compliance_tasks ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Make sure all queries, RLS, and application logic can rely on this field for soft deletes.
