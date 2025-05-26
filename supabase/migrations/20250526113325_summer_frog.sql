/*
  # Complete schema for construction form application

  1. Tables
    - construction_forms: Main form data with user info
    - rooms: Individual rooms in each form
    - lighting_fixtures: Lighting equipment per room
    - outlet_blocks: Power outlets per room
    - specialized_outlets: Special-purpose outlets per room

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users
    - Data validation constraints
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS specialized_outlets CASCADE;
DROP TABLE IF EXISTS outlet_blocks CASCADE;
DROP TABLE IF EXISTS lighting_fixtures CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS construction_forms CASCADE;

-- Main form table
CREATE TABLE construction_forms (
  id bigint PRIMARY KEY DEFAULT nextval('construction_forms_id_seq'),
  user_id uuid REFERENCES auth.users(id),
  type_of_work text NOT NULL,
  lodging_type text NOT NULL,
  department text NOT NULL,
  surface_area text NOT NULL,
  disjoncteur_location text NOT NULL,
  high_tension_line text NOT NULL,
  tableau_type text NOT NULL,
  aluminum_joinery text NOT NULL,
  vmc_needed text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  equipment jsonb,
  heating_types jsonb,
  form_password text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT phone_format CHECK (phone ~* '^\+?[0-9\s-]{10,}$'),
  CONSTRAINT unique_form_password UNIQUE (form_password)
);

-- Rooms table
CREATE TABLE rooms (
  id bigint PRIMARY KEY DEFAULT nextval('rooms_id_seq'),
  form_id bigint REFERENCES construction_forms(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Lighting fixtures table
CREATE TABLE lighting_fixtures (
  id bigint PRIMARY KEY DEFAULT nextval('lighting_fixtures_id_seq'),
  room_id bigint REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  switches integer NOT NULL CHECK (switches > 0),
  detectors integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Outlet blocks table
CREATE TABLE outlet_blocks (
  id bigint PRIMARY KEY DEFAULT nextval('outlet_blocks_id_seq'),
  room_id bigint REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL,
  outlets integer NOT NULL CHECK (outlets > 0),
  rj45 integer NOT NULL CHECK (rj45 >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Specialized outlets table
CREATE TABLE specialized_outlets (
  id bigint PRIMARY KEY DEFAULT nextval('specialized_outlets_id_seq'),
  room_id bigint REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE construction_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialized_outlets ENABLE ROW LEVEL SECURITY;

-- Policies for construction_forms
CREATE POLICY "Users can view their own forms"
  ON construction_forms FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own forms"
  ON construction_forms FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own forms"
  ON construction_forms FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for rooms
CREATE POLICY "Users can view their own rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (form_id IN (
    SELECT id FROM construction_forms WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (form_id IN (
    SELECT id FROM construction_forms WHERE user_id = auth.uid()
  ));

-- Policies for lighting_fixtures
CREATE POLICY "Users can manage their lighting fixtures"
  ON lighting_fixtures FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Policies for outlet_blocks
CREATE POLICY "Users can manage their outlet blocks"
  ON outlet_blocks FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Policies for specialized_outlets
CREATE POLICY "Users can manage their specialized outlets"
  ON specialized_outlets FOR ALL
  TO authenticated
  USING (room_id IN (
    SELECT r.id FROM rooms r
    JOIN construction_forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_construction_forms_user_id ON construction_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_construction_forms_email ON construction_forms(email);
CREATE INDEX IF NOT EXISTS idx_construction_forms_form_password ON construction_forms(form_password);
CREATE INDEX IF NOT EXISTS idx_rooms_form_id ON rooms(form_id);
CREATE INDEX IF NOT EXISTS idx_lighting_fixtures_room_id ON lighting_fixtures(room_id);
CREATE INDEX IF NOT EXISTS idx_outlet_blocks_room_id ON outlet_blocks(room_id);
CREATE INDEX IF NOT EXISTS idx_specialized_outlets_room_id ON specialized_outlets(room_id);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION set_timestamp_forms()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_timestamp_rooms()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_timestamp_lighting()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_timestamp_outlet_blocks()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_timestamp_specialized_outlets()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_timestamp_on_construction_forms
  BEFORE UPDATE ON construction_forms
  FOR EACH ROW
  EXECUTE FUNCTION set_timestamp_forms();

CREATE TRIGGER set_timestamp_on_rooms
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_timestamp_rooms();

CREATE TRIGGER set_timestamp_on_lighting_fixtures
  BEFORE UPDATE ON lighting_fixtures
  FOR EACH ROW
  EXECUTE FUNCTION set_timestamp_lighting();

CREATE TRIGGER set_timestamp_on_outlet_blocks
  BEFORE UPDATE ON outlet_blocks
  FOR EACH ROW
  EXECUTE FUNCTION set_timestamp_outlet_blocks();

CREATE TRIGGER set_timestamp_on_specialized_outlets
  BEFORE UPDATE ON specialized_outlets
  FOR EACH ROW
  EXECUTE FUNCTION set_timestamp_specialized_outlets();

-- Add column comments
COMMENT ON COLUMN construction_forms.first_name IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN construction_forms.last_name IS 'Nom de l''utilisateur';
COMMENT ON COLUMN construction_forms.email IS 'Adresse email de l''utilisateur';
COMMENT ON COLUMN construction_forms.phone IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN construction_forms.form_password IS 'Mot de passe unique du formulaire';