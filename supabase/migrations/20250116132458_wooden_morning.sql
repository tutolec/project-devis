/*
  # Schéma initial pour le formulaire de construction

  1. Tables
    - construction_forms: Stockage des formulaires principaux
    - rooms: Pièces associées à chaque formulaire
    - lighting_fixtures: Équipements d'éclairage par pièce
    - outlet_blocks: Blocs de prises par pièce
    - specialized_outlets: Prises spécialisées par pièce

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour la gestion des accès utilisateurs

  3. Contraintes et validations
    - Contraintes de format pour email et téléphone
    - Contraintes de valeurs pour les champs énumérés
    - Clés étrangères avec suppression en cascade
*/

-- Table principale des formulaires
CREATE TABLE construction_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type_of_work text NOT NULL CHECK (type_of_work IN ('Construction', 'Rénovation')),
  surface_area text NOT NULL CHECK (surface_area IN ('0 - 30 m²', '31 - 50 m²', '51 - 80 m²', '81 - 120 m²', '> 120 m²')),
  vmc_power text NOT NULL CHECK (vmc_power IN ('yes', 'yes-switch', 'no', 'unknown')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  form_password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT phone_format CHECK (phone ~* '^\+?[0-9\s-]{10,}$'),
  CONSTRAINT unique_form_password UNIQUE (form_password)
);

-- Table des pièces
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES construction_forms(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des équipements d'éclairage
CREATE TABLE lighting_fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Point lumineux DCL', 'Spots', 'DCL applique')),
  quantity integer NOT NULL CHECK (quantity > 0),
  switches integer NOT NULL CHECK (switches > 0),
  created_at timestamptz DEFAULT now()
);

-- Table des blocs de prises
CREATE TABLE outlet_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('simple', 'double', 'triple', 'quadruple')),
  outlets integer NOT NULL CHECK (outlets > 0),
  rj45 integer NOT NULL CHECK (rj45 >= 0),
  created_at timestamptz DEFAULT now()
);

-- Table des prises spécialisées
CREATE TABLE specialized_outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'Lave-linge', 'Sèche-linge', 'Plaque de cuisson', 'Chauffe-eau',
    'Lave-vaisselle', 'Congélateur', 'Hotte', 'Four'
  )),
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE construction_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialized_outlets ENABLE ROW LEVEL SECURITY;

-- Politiques pour construction_forms
CREATE POLICY "Users can view their own forms"
  ON construction_forms
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own forms"
  ON construction_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own forms"
  ON construction_forms
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Politiques pour rooms
CREATE POLICY "Users can view their own rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (form_id IN (
    SELECT id FROM construction_forms WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (form_id IN (
    SELECT id FROM construction_forms WHERE user_id = auth.uid()
  ));

-- Politiques pour lighting_fixtures
CREATE POLICY "Users can manage their lighting fixtures"
  ON lighting_fixtures
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Politiques pour outlet_blocks
CREATE POLICY "Users can manage their outlet blocks"
  ON outlet_blocks
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Politiques pour specialized_outlets
CREATE POLICY "Users can manage their specialized outlets"
  ON specialized_outlets
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Index pour optimisation
CREATE INDEX idx_construction_forms_user_id ON construction_forms(user_id);
CREATE INDEX idx_construction_forms_email ON construction_forms(email);
CREATE INDEX idx_construction_forms_form_password ON construction_forms(form_password);

-- Fonction et trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_construction_forms_updated_at
  BEFORE UPDATE ON construction_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Commentaires sur les colonnes
COMMENT ON COLUMN construction_forms.first_name IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN construction_forms.last_name IS 'Nom de l''utilisateur';
COMMENT ON COLUMN construction_forms.email IS 'Adresse email de l''utilisateur';
COMMENT ON COLUMN construction_forms.phone IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN construction_forms.form_password IS 'Mot de passe unique du formulaire';