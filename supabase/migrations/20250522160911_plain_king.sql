/*
  # Add recurring fields to compliance tasks

  1. Changes
    - Add `is_recurring` boolean field to compliance_tasks table
    - Add `recurring_interval` text field to compliance_tasks table
    
  2. Purpose
    - Support recurring tasks like annual document renewals
    - Allow tracking of recurring task intervals (daily, weekly, monthly, yearly)
*/

-- Add is_recurring column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'compliance_tasks' AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE compliance_tasks ADD COLUMN is_recurring BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add recurring_interval column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'compliance_tasks' AND column_name = 'recurring_interval'
  ) THEN
    ALTER TABLE compliance_tasks ADD COLUMN recurring_interval TEXT;
  END IF;
END $$;

-- Add comment to explain the fields
COMMENT ON COLUMN compliance_tasks.is_recurring IS 'Indicates if this task repeats on a schedule';
COMMENT ON COLUMN compliance_tasks.recurring_interval IS 'Frequency of recurrence (daily, weekly, monthly, yearly)';