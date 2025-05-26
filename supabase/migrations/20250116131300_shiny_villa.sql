/*
  # Ajout des champs de contact et mot de passe

  1. Modifications
    - Ajout du champ phone pour le numéro de téléphone
    - Ajout du champ form_password pour le mot de passe unique
*/

ALTER TABLE construction_forms
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS form_password text;