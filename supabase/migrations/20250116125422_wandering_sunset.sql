/*
  # Ajout des informations de contact au formulaire

  1. Modifications
    - Ajout des colonnes nom, prénom et email à la table construction_forms
  
  2. Sécurité
    - Les contraintes NOT NULL sont appliquées pour garantir que ces informations sont toujours fournies
*/

ALTER TABLE construction_forms
ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';

-- Supprimer les valeurs par défaut après avoir ajouté les colonnes
ALTER TABLE construction_forms 
ALTER COLUMN first_name DROP DEFAULT,
ALTER COLUMN last_name DROP DEFAULT,
ALTER COLUMN email DROP DEFAULT;