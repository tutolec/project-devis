/*
  # Fix duplicate RLS policies

  1. Changes
    - Drop duplicate RLS policies
    - Recreate necessary policies
*/

-- Drop duplicate policies
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'construction_forms'
    AND policyname = 'Users can view their own forms'
  ) THEN
    DROP POLICY "Users can view their own forms" ON construction_forms;
  END IF;
END $$;

-- Recreate the policy
CREATE POLICY "Users can view their own forms"
  ON construction_forms
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());