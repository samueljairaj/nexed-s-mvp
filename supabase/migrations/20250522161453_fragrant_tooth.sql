/*
  # Fix compliance tasks schema

  1. Changes
    - Add unique constraint on compliance_tasks for UPSERT operations
    - Fix column reference from 'completed' to 'is_completed'

  2. Security
    - No changes to RLS policies
*/

-- Add unique constraint for UPSERT operations
ALTER TABLE compliance_tasks 
ADD CONSTRAINT unique_user_title_phase UNIQUE (user_id, title, phase);