/*
  # Fix Hero Slides Public Access

  1. Changes
    - Add public SELECT policy for hero_slides table
    - Allow anonymous users to view active slides
  
  2. Security
    - Only active slides are visible to public
    - Admin operations remain protected
*/

-- Drop the old authenticated-only policy
DROP POLICY IF EXISTS "View hero slides" ON hero_slides;

-- Create new public policy for viewing active slides
CREATE POLICY "Public can view active hero slides"
  ON hero_slides
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create policy for admins to view all slides
CREATE POLICY "Admins can view all hero slides"
  ON hero_slides
  FOR SELECT
  TO authenticated
  USING (check_is_admin());
