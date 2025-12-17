/*
  # Fix RLS Infinite Recursion in user_profiles

  1. Problem
    - Die "View profiles" Policy führt zu infinite recursion
    - Prüft Admin-Rolle durch Abfrage von user_profiles selbst
  
  2. Lösung
    - Policy neu erstellen ohne Rekursion
    - Admin-Prüfung über user_roles Tabelle
  
  3. Sicherheit
    - Benutzer können ihr eigenes Profil sehen
    - Admins können alle Profile sehen (geprüft über user_roles)
*/

-- Alte Policy löschen
DROP POLICY IF EXISTS "View profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Neue Policy ohne Rekursion
CREATE POLICY "Users can view own profile or admins view all"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );