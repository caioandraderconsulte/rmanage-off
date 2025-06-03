/*
  # Add bookings table

  1. New Tables
    - bookings
      - id (uuid, primary key)
      - user_email (text, not null)
      - start_date (timestamptz, not null)
      - end_date (timestamptz, not null)
      - created_at (timestamptz, not null)

  2. Security
    - Enable RLS on bookings table
    - Add policy for authenticated users to:
      - Read their own bookings
      - Create new bookings
      - Update their own bookings
      - Delete their own bookings
*/

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

-- Allow users to create bookings with their email
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Allow users to update their own bookings
CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email)
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Allow users to delete their own bookings
CREATE POLICY "Users can delete own bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);