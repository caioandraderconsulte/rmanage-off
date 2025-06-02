/*
  # Initial Schema Setup for Equipment Management System

  1. New Tables
    - companies
      - id (uuid, primary key)
      - name (text)
      - address (text)
      - phone (text)
      - website (text)
      - email (text)
      - responsible (text)
      - manufacturer (text)
      - central_model (text)
      - cb_project (text)
      - avcb (text)
      - date (timestamptz)
      - code (text)
      - created_at (timestamptz)

    - units
      - id (uuid, primary key)
      - company_id (uuid, foreign key)
      - name (text)
      - code (text)
      - created_at (timestamptz)

    - sectors
      - id (uuid, primary key)
      - unit_id (uuid, foreign key)
      - name (text)
      - code (text)
      - created_at (timestamptz)

    - equipment_types
      - code (text, primary key)
      - name (text)
      - created_at (timestamptz)

    - equipment
      - id (uuid, primary key)
      - sector_id (uuid, foreign key)
      - type_code (text, foreign key)
      - model (text)
      - loop (text)
      - central (text)
      - final_code (text)
      - created_at (timestamptz)

    - inspections
      - id (uuid, primary key)
      - equipment_id (uuid, foreign key)
      - description (text)
      - description_photo (text)
      - functioning (boolean)
      - malfunction_description (text)
      - malfunction_photo (text)
      - date (timestamptz)
      - next_date (timestamptz)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  website text,
  email text,
  responsible text,
  manufacturer text,
  central_model text,
  cb_project text,
  avcb text,
  date timestamptz NOT NULL DEFAULT now(),
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name)
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform all actions on companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create units table
CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform all actions on units"
  ON units
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create sectors table
CREATE TABLE sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(unit_id, name)
);

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform all actions on sectors"
  ON sectors
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create equipment_types table
CREATE TABLE equipment_types (
  code text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read equipment types"
  ON equipment_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial equipment types
INSERT INTO equipment_types (code, name) VALUES
  ('SF', 'Sensor de Fumaça'),
  ('SC', 'Sensor de Calor'),
  ('AL', 'Alarme'),
  ('AV', 'Avisador'),
  ('EX', 'Extintor'),
  ('HD', 'Hidrante');

-- Create equipment table
CREATE TABLE equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  type_code text NOT NULL REFERENCES equipment_types(code),
  model text NOT NULL,
  loop text NOT NULL,
  central text,
  final_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(final_code)
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform all actions on equipment"
  ON equipment
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create inspections table
CREATE TABLE inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  description text NOT NULL,
  description_photo text,
  functioning boolean NOT NULL DEFAULT true,
  malfunction_description text,
  malfunction_photo text,
  date timestamptz NOT NULL DEFAULT now(),
  next_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform all actions on inspections"
  ON inspections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);