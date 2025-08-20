
-- Remove the failed constraint (if present)
ALTER TABLE document_versions
DROP CONSTRAINT IF EXISTS document_versions_one_current_per_doc;

-- Enforce only one current version per document using btree
ALTER TABLE document_versions
ADD CONSTRAINT document_versions_one_current_per_doc
EXCLUDE USING btree (
  document_id WITH =,
  is_current WITH =
)
WHERE (is_current = TRUE);

-- The rest of the migration (previously approved) proceeds as before.
