/*
  # Fix missing vmc_power column in construction_forms table

  1. Changes
    - Remove vmc_power column constraint
    - Add vmc_needed column for VMC requirements
  
  2. Security
    - Maintain existing RLS policies
*/

-- Remove vmc_power column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'construction_forms' 
    AND column_name = 'vmc_power'
  ) THEN
    ALTER TABLE construction_forms DROP COLUMN vmc_power;
  END IF;
END $$;

-- Add vmc_needed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'construction_forms' 
    AND column_name = 'vmc_needed'
  ) THEN
    ALTER TABLE construction_forms ADD COLUMN vmc_needed text NOT NULL DEFAULT 'unknown';
  END IF;
END $$;

-- Add check constraint for vmc_needed values
ALTER TABLE construction_forms 
DROP CONSTRAINT IF EXISTS vmc_needed_check,
ADD CONSTRAINT vmc_needed_check 
CHECK (vmc_needed IN ('yes', 'yes-switch', 'no', 'unknown'));