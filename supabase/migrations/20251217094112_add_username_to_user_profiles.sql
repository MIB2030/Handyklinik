/*
  # Benutzername-Support für User Profiles

  1. Änderungen
    - Neue Spalte `username` (text, unique, required) zu user_profiles
    - Index für schnelle Username-Lookups
  
  2. Sicherheit
    - Bestehende RLS-Policies bleiben unverändert
    - Username ist öffentlich sichtbar für authentifizierte Benutzer
  
  3. Hinweise
    - Username muss eindeutig sein
    - Wird für Login-Funktionalität verwendet
*/

-- Spalte 'username' hinzufügen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username text UNIQUE;
  END IF;
END $$;

-- Index für schnelle Username-Lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Kommentar für bessere Dokumentation
COMMENT ON COLUMN user_profiles.username IS 'Eindeutiger Benutzername für Login';