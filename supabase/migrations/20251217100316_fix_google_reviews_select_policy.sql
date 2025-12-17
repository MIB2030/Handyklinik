/*
  # Fix Google Reviews SELECT Policy
  
  1. Changes
    - Drop the complex SELECT policy with nested EXISTS query
    - Create a new simple SELECT policy using is_admin() function
    - Admins can see all reviews
    - Public/authenticated users can see only visible reviews
  
  2. Security
    - Admins have full access to all reviews
    - Regular users only see published reviews
*/

-- Drop the old SELECT policy
DROP POLICY IF EXISTS "View reviews" ON google_reviews;

-- Create new SELECT policy for public/authenticated (only visible reviews)
CREATE POLICY "Public can view visible reviews"
  ON google_reviews
  FOR SELECT
  TO authenticated
  USING (is_visible = true OR is_admin());

-- Also allow anonymous users to see visible reviews on frontend
CREATE POLICY "Anonymous can view visible reviews"
  ON google_reviews
  FOR SELECT
  TO anon
  USING (is_visible = true);
