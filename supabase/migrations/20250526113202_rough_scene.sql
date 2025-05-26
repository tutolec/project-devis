/*
  # Update form_password constraints

  1. Changes
    - Set default value for form_password
    - Add unique constraint
    - Update RLS policy
*/

-- Update form_password to have a default value and set NOT NULL
ALTER TABLE construction_forms
ALTER COLUMN form_password SET DEFAULT '',
ALTER COLUMN form_password SET NOT NULL;

-- Add unique constraint for form_password
ALTER TABLE construction_forms
ADD CONSTRAINT unique_form_password UNIQUE (form_password);

-- Update the policy for form creation
DROP POLICY IF EXISTS "Users can create their own forms" ON construction_forms;
CREATE POLICY "Users can create their own forms"
  ON construction_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    first_name IS NOT NULL AND
    last_name IS NOT NULL AND
    email IS NOT NULL AND
    phone IS NOT NULL AND
    form_password IS NOT NULL
  );