/*
  # Fix Google Settings RLS Policies

  1. Problem
    - Google Settings Policies prüfen Admin-Rolle über user_profiles
    - Dies verursacht infinite recursion da user_profiles auch RLS hat
  
  2. Lösung
    - Aktualisiere alle google_settings Policies
    - Verwende is_admin() Helper-Funktion statt direkter user_profiles Abfrage
  
  3. Sicherheit
    - Nur Admins können Google Settings lesen, bearbeiten und erstellen
    - Verwendet bereits vorhandene is_admin() Funktion
*/

-- Lösche alte Policies
DROP POLICY IF EXISTS "Admin users can view google settings" ON google_settings;
DROP POLICY IF EXISTS "Admin users can update google settings" ON google_settings;
DROP POLICY IF EXISTS "Admin users can insert google settings" ON google_settings;

-- Erstelle neue Policies mit is_admin() Funktion
CREATE POLICY "Admins can view google settings"
  ON google_settings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update google settings"
  ON google_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can insert google settings"
  ON google_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());
