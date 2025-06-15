
-- PHASE 2: Data Integrity & Performance for neXed compliance platform

-- 1. Add performance indexes for fast queries on key columns

-- Documents table
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Compliance tasks table
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_user_id ON compliance_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_due_date ON compliance_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_created_at ON compliance_tasks(created_at);

-- Student notes table
CREATE INDEX IF NOT EXISTS idx_student_notes_student_id ON student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_author_id ON student_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_created_at ON student_notes(created_at);

-- Document versions table
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_upload_date ON document_versions(upload_date);

-- Audit logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 2. Data constraints and integrity enhancements

-- Ensure critical fields are always filled in (NOT NULL)—skip fields already not null
ALTER TABLE documents ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN title SET NOT NULL;
ALTER TABLE documents ALTER COLUMN file_url SET NOT NULL;
ALTER TABLE documents ALTER COLUMN category SET NOT NULL;
ALTER TABLE compliance_tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE compliance_tasks ALTER COLUMN title SET NOT NULL;
ALTER TABLE compliance_tasks ALTER COLUMN priority SET NOT NULL;

-- 3. Cleanup: Enforce foreign key integrity where possible
-- Link documents.user_id to profiles.id if not already
ALTER TABLE documents
  ADD CONSTRAINT fk_documents_user
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE compliance_tasks
  ADD CONSTRAINT fk_compliance_tasks_user
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Add similar foreign key for student_notes
ALTER TABLE student_notes
  ADD CONSTRAINT fk_student_notes_student
  FOREIGN KEY (student_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_student_notes_author
  FOREIGN KEY (author_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- 4. Add a trigger for automatic updated_at management (Best Practice)

-- First, create a generic function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Documents updated_at trigger
DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- Compliance tasks updated_at trigger
DROP TRIGGER IF EXISTS trg_compliance_tasks_updated_at ON compliance_tasks;
CREATE TRIGGER trg_compliance_tasks_updated_at
BEFORE UPDATE ON compliance_tasks
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- Student notes updated_at trigger
DROP TRIGGER IF EXISTS trg_student_notes_updated_at ON student_notes;
CREATE TRIGGER trg_student_notes_updated_at
BEFORE UPDATE ON student_notes
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- DSO profiles updated_at trigger
DROP TRIGGER IF EXISTS trg_dso_profiles_updated_at ON dso_profiles;
CREATE TRIGGER trg_dso_profiles_updated_at
BEFORE UPDATE ON dso_profiles
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- Profiles updated_at trigger
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- 5. ENUM data integrity is automatically enforced by Postgres -- no change needed

-- END: Phase 2 data performance and integrity enhancements
