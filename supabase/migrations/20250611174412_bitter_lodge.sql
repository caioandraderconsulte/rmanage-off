/*
  # Add missing company columns

  1. Changes
    - Add `cb_project` column to companies table (maps to cbProject in frontend)
    - Add `central_model` column to companies table (maps to centralModel in frontend)
    - These columns are referenced in the frontend but missing from the database schema

  2. Security
    - No RLS changes needed as the table already has proper policies
*/

-- Add missing columns to companies table
DO $$
BEGIN
  -- Add cb_project column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'cb_project'
  ) THEN
    ALTER TABLE companies ADD COLUMN cb_project text;
  END IF;

  -- Add central_model column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'central_model'
  ) THEN
    ALTER TABLE companies ADD COLUMN central_model text;
  END IF;
END $$;