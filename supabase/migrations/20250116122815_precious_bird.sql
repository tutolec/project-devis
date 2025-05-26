/*
  # Schema pour les formulaires de construction

  1. Tables principales
    - `construction_forms` : Stocke les informations principales du formulaire
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers auth.users)
      - `type_of_work` (text, 'Construction' ou 'Rénovation')
      - `surface_area` (text, surface du logement)
      - `vmc_power` (text, type d'alimentation VMC)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `rooms` : Stocke les pièces de chaque formulaire
      - `id` (uuid, clé primaire)
      - `form_id` (uuid, référence vers construction_forms)
      - `name` (text, nom de la pièce)
      - `created_at` (timestamp)
    
    - `lighting_fixtures` : Stocke les équipements d'éclairage
      - `id` (uuid, clé primaire)
      - `room_id` (uuid, référence vers rooms)
      - `type` (text, type d'éclairage)
      - `quantity` (integer, nombre de points)
      - `switches` (integer, nombre d'interrupteurs)
      - `created_at` (timestamp)
    
    - `outlet_blocks` : Stocke les blocs de prises
      - `id` (uuid, clé primaire)
      - `room_id` (uuid, référence vers rooms)
      - `type` (text, type de bloc)
      - `outlets` (integer, nombre de prises)
      - `rj45` (integer, nombre de prises RJ45)
      - `created_at` (timestamp)
    
    - `specialized_outlets` : Stocke les prises spécialisées
      - `id` (uuid, clé primaire)
      - `room_id` (uuid, référence vers rooms)
      - `type` (text, type de prise spécialisée)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour permettre aux utilisateurs de :
      - Voir uniquement leurs propres données
      - Créer de nouvelles entrées
      - Mettre à jour leurs propres données
*/

-- Tables principales
CREATE TABLE IF NOT EXISTS construction_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type_of_work text NOT NULL CHECK (type_of_work IN ('Construction', 'Rénovation')),
  surface_area text NOT NULL CHECK (surface_area IN ('0 - 30 m²', '31 - 50 m²', '51 - 80 m²', '81 - 120 m²', '> 120 m²')),
  vmc_power text NOT NULL CHECK (vmc_power IN ('yes', 'yes-switch', 'no', 'unknown')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES construction_forms(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lighting_fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Point lumineux DCL', 'Spots', 'DCL applique')),
  quantity integer NOT NULL CHECK (quantity > 0),
  switches integer NOT NULL CHECK (switches > 0),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outlet_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('simple', 'double', 'triple', 'quadruple')),
  outlets integer NOT NULL CHECK (outlets > 0),
  rj45 integer NOT NULL CHECK (rj45 >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS specialized_outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'Lave-linge', 'Sèche-linge', 'Plaque de cuisson', 'Chauffe-eau',
    'Lave-vaisselle', 'Congélateur', 'Hotte', 'Four'
  )),
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
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

-- Politiques pour les tables liées
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

-- Politiques similaires pour lighting_fixtures
CREATE POLICY "Users can view their lighting fixtures"
  ON lighting_fixtures
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Politiques similaires pour outlet_blocks
CREATE POLICY "Users can view their outlet blocks"
  ON outlet_blocks
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Politiques similaires pour specialized_outlets
CREATE POLICY "Users can view their specialized outlets"
  ON specialized_outlets
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Fonction de mise à jour du timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour construction_forms
CREATE TRIGGER update_construction_forms_updated_at
  BEFORE UPDATE ON construction_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();