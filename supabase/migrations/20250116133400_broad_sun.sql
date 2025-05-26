/*
  # Correction du schéma de la base de données

  1. Vérifications
    - Vérifier l'existence des colonnes avant de les ajouter
    - Vérifier l'existence des contraintes avant de les ajouter
  
  2. Corrections
    - Ajouter les colonnes manquantes si nécessaire
    - Ajouter les contraintes manquantes si nécessaire
*/

-- Fonction utilitaire pour vérifier l'existence d'une colonne
CREATE OR REPLACE FUNCTION column_exists(tbl text, col text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = tbl 
    AND column_name = col
  );
END;
$$ LANGUAGE plpgsql;

-- Ajout sécurisé des colonnes manquantes
DO $$ 
BEGIN
  -- Vérification et ajout des colonnes pour construction_forms
  IF NOT column_exists('construction_forms', 'first_name') THEN
    ALTER TABLE construction_forms ADD COLUMN first_name text;
  END IF;

  IF NOT column_exists('construction_forms', 'last_name') THEN
    ALTER TABLE construction_forms ADD COLUMN last_name text;
  END IF;

  IF NOT column_exists('construction_forms', 'email') THEN
    ALTER TABLE construction_forms ADD COLUMN email text;
  END IF;

  IF NOT column_exists('construction_forms', 'phone') THEN
    ALTER TABLE construction_forms ADD COLUMN phone text;
  END IF;

  IF NOT column_exists('construction_forms', 'form_password') THEN
    ALTER TABLE construction_forms ADD COLUMN form_password text;
  END IF;

  -- Ajout sécurisé des contraintes NOT NULL
  ALTER TABLE construction_forms 
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN phone SET NOT NULL,
    ALTER COLUMN form_password SET NOT NULL;

  -- Ajout sécurisé des contraintes de format si elles n'existent pas
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'email_format'
  ) THEN
    ALTER TABLE construction_forms
    ADD CONSTRAINT email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'phone_format'
  ) THEN
    ALTER TABLE construction_forms
    ADD CONSTRAINT phone_format 
    CHECK (phone ~* '^\+?[0-9\s-]{10,}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_form_password'
  ) THEN
    ALTER TABLE construction_forms
    ADD CONSTRAINT unique_form_password 
    UNIQUE (form_password);
  END IF;

END $$;

-- Vérification et création des index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'construction_forms' 
    AND indexname = 'idx_construction_forms_user_id'
  ) THEN
    CREATE INDEX idx_construction_forms_user_id ON construction_forms(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'construction_forms' 
    AND indexname = 'idx_construction_forms_email'
  ) THEN
    CREATE INDEX idx_construction_forms_email ON construction_forms(email);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'construction_forms' 
    AND indexname = 'idx_construction_forms_form_password'
  ) THEN
    CREATE INDEX idx_construction_forms_form_password ON construction_forms(form_password);
  END IF;
END $$;

