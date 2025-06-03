/*
  # Update Bookings Table Policies

  1. Changes
    - Remove email-based restrictions from RLS policies
    - Allow all authenticated users to access all bookings
    - Maintain basic authentication check to prevent public access

  2. Security
    - Enable RLS on bookings table
    - Add policies for authenticated users to perform all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;

-- Create new policy for all operations
CREATE POLICY "Users can perform all actions on bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);