/*
  # Ajout de la validation d'email

  1. Changements
    - Vérification de l'existence de la colonne email
    - Ajout d'un index pour optimiser les recherches (si non existant)

  2. Sécurité
    - Maintien des politiques RLS existantes
*/

-- Vérifier si la colonne email existe déjà
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'construction_forms' 
    AND column_name = 'email'
  ) THEN
    -- Ajouter la colonne email
    ALTER TABLE construction_forms
    ADD COLUMN email text NOT NULL;
  END IF;
END $$;

-- Créer un index sur la colonne email s'il n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'construction_forms'
    AND indexname = 'idx_construction_forms_email'
  ) THEN
    CREATE INDEX idx_construction_forms_email ON construction_forms(email);
  END IF;
END $$;