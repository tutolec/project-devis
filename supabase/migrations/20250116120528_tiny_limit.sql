/*
  # Schema for construction form responses

  1. New Tables
    - `construction_forms`
      - Main form responses
      - Stores type of work, surface area, and VMC power requirements
    - `rooms`
      - Rooms associated with each form
      - Links to the main form via foreign key
    - `lighting_fixtures`
      - Lighting equipment for each room
      - Tracks type, quantity, and number of switches
    - `outlet_blocks`
      - Standard outlet blocks for each room
      - Records type, number of outlets, and RJ45 ports
    - `specialized_outlets`
      - Specialized outlets for each room
      - Stores the type of specialized outlet

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own form submissions
      - Create new submissions
      - Update their submissions
*/

-- Main form responses table
CREATE TABLE IF NOT EXISTS construction_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type_of_work text NOT NULL CHECK (type_of_work IN ('Construction', 'Rénovation')),
  surface_area text NOT NULL CHECK (surface_area IN ('0 - 30 m²', '31 - 50 m²', '51 - 80 m²', '81 - 120 m²', '> 120 m²')),
  vmc_power text NOT NULL CHECK (vmc_power IN ('yes', 'yes-switch', 'no', 'unknown')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

-- Enable Row Level Security
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

-- Policies for rooms and related tables
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

-- Similar policies for lighting_fixtures
CREATE POLICY "Users can view their lighting fixtures"
  ON lighting_fixtures
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Similar policies for outlet_blocks
CREATE POLICY "Users can view their outlet blocks"
  ON outlet_blocks
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Similar policies for specialized_outlets
CREATE POLICY "Users can view their specialized outlets"
  ON specialized_outlets
  FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to construction_forms
CREATE TRIGGER update_construction_forms_updated_at
  BEFORE UPDATE ON construction_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();