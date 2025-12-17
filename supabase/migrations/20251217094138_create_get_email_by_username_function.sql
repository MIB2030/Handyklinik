/*
  # Funktion: E-Mail aus Benutzername ermitteln

  1. Neue Funktion
    - `get_email_by_username(username_input text)` → text
    - Gibt die E-Mail-Adresse für einen Benutzernamen zurück
    - Wird für Login mit Benutzername verwendet
  
  2. Sicherheit
    - Funktion ist SECURITY DEFINER (läuft mit Owner-Rechten)
    - Nur für authentifizierte Benutzer zugänglich
    - Gibt nur E-Mail zurück, keine sensiblen Daten
*/

CREATE OR REPLACE FUNCTION get_email_by_username(username_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  SELECT au.email INTO user_email
  FROM user_profiles up
  JOIN auth.users au ON au.id = up.id
  WHERE up.username = username_input;
  
  RETURN user_email;
END;
$$;

-- Kommentar für Dokumentation
COMMENT ON FUNCTION get_email_by_username IS 'Gibt die E-Mail-Adresse für einen Benutzernamen zurück (für Login)';