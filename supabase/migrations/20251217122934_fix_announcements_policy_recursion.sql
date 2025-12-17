/*
  # Fix infinite recursion in announcements policy

  1. Changes
    - Drop the existing "View announcements" policy that causes recursion
    - Create a new simplified policy that uses is_admin() function instead of checking user_profiles.role
    - This prevents the circular dependency: announcements -> user_profiles -> user_roles -> user_profiles
  
  2. Security
    - Maintains the same security model: active announcements are public, all announcements visible to admins
    - Uses is_admin() function which directly queries user_roles without triggering user_profiles RLS
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "View announcements" ON announcements;

-- Create new policy without circular dependency
CREATE POLICY "View announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR is_admin()
  );

-- Also allow anonymous users to view active announcements
CREATE POLICY "Anonymous can view active announcements"
  ON announcements
  FOR SELECT
  TO anon
  USING (is_active = true);
