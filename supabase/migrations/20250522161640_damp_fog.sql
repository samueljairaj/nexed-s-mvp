/*
  # Add unique constraint for compliance tasks
  
  1. Changes
    - Removes duplicate entries from compliance_tasks table
    - Adds a unique constraint on (user_id, title, phase) to support UPSERT operations
*/

-- First, create a temporary table to identify duplicates
CREATE TEMP TABLE duplicate_tasks AS
WITH duplicates AS (
  SELECT 
    id,
    user_id, 
    title, 
    phase,
    ROW_NUMBER() OVER (PARTITION BY user_id, title, phase ORDER BY created_at DESC) as row_num
  FROM compliance_tasks
)
SELECT id FROM duplicates WHERE row_num > 1;

-- Delete the duplicates (keeping the most recent one for each group)
DELETE FROM compliance_tasks
WHERE id IN (SELECT id FROM duplicate_tasks);

-- Now add the unique constraint
ALTER TABLE compliance_tasks 
ADD CONSTRAINT unique_user_title_phase UNIQUE (user_id, title, phase);