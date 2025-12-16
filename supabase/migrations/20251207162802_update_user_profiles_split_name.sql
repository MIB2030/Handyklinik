/*
  # User Profiles: Name in Vorname und Nachname aufteilen
  
  1. Änderungen an der Tabelle user_profiles
    - Spalte 'name' wird entfernt
    - Neue Spalte 'vorname' (text, Pflichtfeld)
    - Neue Spalte 'nachname' (text, Pflichtfeld)
  
  2. Sicherheit
    - Bestehende RLS-Richtlinien bleiben unverändert
  
  Hinweise:
    - Diese Migration ist sicher, da die Tabelle user_profiles aktuell keine Daten enthält
    - Falls Daten vorhanden wären, müsste eine Datenmigration durchgeführt werden
*/

-- Alte Spalte entfernen und neue Spalten hinzufügen
DO $$
BEGIN
  -- Spalte 'name' entfernen, falls vorhanden
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN name;
  END IF;
  
  -- Spalte 'vorname' hinzufügen, falls noch nicht vorhanden
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'vorname'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN vorname text NOT NULL DEFAULT '';
  END IF;
  
  -- Spalte 'nachname' hinzufügen, falls noch nicht vorhanden
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'nachname'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN nachname text NOT NULL DEFAULT '';
  END IF;
END $$;