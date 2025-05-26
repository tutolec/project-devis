/*
  # Correction des contraintes et politiques pour le formulaire

  1. Modifications
    - Ajout de contraintes NOT NULL pour les champs de contact
    - Ajout d'une contrainte UNIQUE pour form_password
    - Mise à jour des politiques de sécurité
*/

-- Ajout des contraintes NOT NULL
ALTER TABLE construction_forms
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN phone SET NOT NULL,
ALTER COLUMN form_password SET NOT NULL;

-- Ajout de la contrainte UNIQUE pour form_password
ALTER TABLE construction_forms
ADD CONSTRAINT unique_form_password UNIQUE (form_password);

-- Mise à jour des politiques
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