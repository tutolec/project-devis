/*
  # Complete schema for electrical construction forms

  1. Tables
    - construction_forms: Main form data with user info and general settings
    - rooms: Rooms associated with each form
    - lighting_fixtures: Lighting equipment per room
    - outlet_blocks: Standard outlet blocks per room
    - specialized_outlets: Specialized outlets per room

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users
*/

-- Main form table
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
  vmc_needed text NOT NULL CHECK (vmc_needed IN ('yes', 'yes-switch', 'no', 'unknown')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone text NOT NULL CHECK (phone ~* '^\+?[0-9\s-]{10,}$'),
  form_password text NOT NULL DEFAULT '',
  equipment jsonb,
  heating_types jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_form_password UNIQUE (form_password)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES construction_forms(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Lighting fixtures table
CREATE TABLE IF NOT EXISTS lighting_fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Point lumineux DCL', 'Spots', 'DCL applique')),
  quantity integer NOT NULL CHECK (quantity > 0),
  switches integer NOT NULL CHECK (switches > 0),
  detectors integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Outlet blocks table
CREATE TABLE IF NOT EXISTS outlet_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('simple', 'double', 'triple', 'quadruple')),
  outlets integer NOT NULL CHECK (outlets > 0),
  rj45 integer NOT NULL CHECK (rj45 >= 0),
  created_at timestamptz DEFAULT now()
);

-- Specialized outlets table
CREATE TABLE IF NOT EXISTS specialized_outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'Lave-linge', 'Sèche-linge', 'Plaque de cuisson', 'Chauffe-eau',
    'Lave-vaisselle', 'Congélateur', 'Hotte', 'Four'
  )),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE construction_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialized_outlets ENABLE ROW LEVEL SECURITY;

-- Policies for construction_forms
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

-- Policies for rooms
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

-- Policies for equipment tables
CREATE POLICY "Users can manage their lighting fixtures"
  ON lighting_fixtures
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their outlet blocks"
  ON outlet_blocks
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their specialized outlets"
  ON specialized_outlets
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_construction_forms_user_id ON construction_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_construction_forms_email ON construction_forms(email);
CREATE INDEX IF NOT EXISTS idx_construction_forms_form_password ON construction_forms(form_password);
CREATE INDEX IF NOT EXISTS idx_rooms_form_id ON rooms(form_id);
CREATE INDEX IF NOT EXISTS idx_lighting_fixtures_room_id ON lighting_fixtures(room_id);
CREATE INDEX IF NOT EXISTS idx_outlet_blocks_room_id ON outlet_blocks(room_id);
CREATE INDEX IF NOT EXISTS idx_specialized_outlets_room_id ON specialized_outlets(room_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to construction_forms
CREATE TRIGGER update_construction_forms_updated_at
  BEFORE UPDATE ON construction_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();