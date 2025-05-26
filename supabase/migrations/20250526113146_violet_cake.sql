/*
  # Schema for construction form responses

  1. Tables
    - `construction_forms`: Main form responses
    - `rooms`: Rooms associated with each form
    - `lighting_fixtures`: Lighting equipment for each room
    - `outlet_blocks`: Standard outlet blocks for each room
    - `specialized_outlets`: Specialized outlets for each room

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Table principale des formulaires
CREATE TABLE IF NOT EXISTS construction_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type_of_work text NOT NULL CHECK (type_of_work IN ('Construction', 'Rénovation')),
  lodging_type text NOT NULL,
  department text NOT NULL,
  surface_area text NOT NULL CHECK (surface_area IN ('0 - 30 m²', '31 - 50 m²', '51 - 80 m²', '81 - 120 m²', '> 120 m²')),
  disjoncteur_location text NOT NULL,
  high_tension_line text NOT NULL,
  tableau_type text NOT NULL,
  aluminum_joinery text NOT NULL,
  vmc_needed text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  form_password text NOT NULL DEFAULT '',
  equipment jsonb,
  heating_types jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des pièces
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES construction_forms(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des équipements d'éclairage
CREATE TABLE IF NOT EXISTS lighting_fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Point lumineux DCL', 'Spots', 'DCL applique')),
  quantity integer NOT NULL CHECK (quantity > 0),
  switches integer NOT NULL CHECK (switches > 0),
  created_at timestamptz DEFAULT now()
);

-- Table des blocs de prises
CREATE TABLE IF NOT EXISTS outlet_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('simple', 'double', 'triple', 'quadruple')),
  outlets integer NOT NULL CHECK (outlets > 0),
  rj45 integer NOT NULL CHECK (rj45 >= 0),
  created_at timestamptz DEFAULT now()
);

-- Table des prises spécialisées
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

-- Fonction pour la mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;