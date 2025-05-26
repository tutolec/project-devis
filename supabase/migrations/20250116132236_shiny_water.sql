/*
  # Ajout de la colonne email à la table construction_forms

  1. Changements
    - Ajout de la colonne email si elle n'existe pas déjà
    - Ajout de contraintes de validation pour l'email
    - Ajout d'un index pour optimiser les recherches

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

    -- Ajouter la contrainte de format email
    ALTER TABLE construction_forms
    ADD CONSTRAINT email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

    -- Créer un index sur la colonne email
    CREATE INDEX IF NOT EXISTS idx_construction_forms_email 
    ON construction_forms(email);
  END IF;
END $$;