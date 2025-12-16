/*
  # Pop-up Ankündigungen System

  1. Neue Tabelle
    - `announcements`
      - `id` (uuid, primary key) - Eindeutige ID
      - `title` (text) - Überschrift des Pop-ups
      - `message` (text) - Haupttext des Pop-ups
      - `color` (text) - Farbe des Pop-ups (red, blue, green, orange, yellow)
      - `is_active` (boolean) - Ob das Pop-up aktiv ist
      - `start_date` (timestamptz) - Ab wann das Pop-up erscheinen soll
      - `end_date` (timestamptz) - Bis wann das Pop-up erscheinen soll
      - `created_at` (timestamptz) - Erstellungsdatum
      - `updated_at` (timestamptz) - Aktualisierungsdatum

  2. Sicherheit
    - RLS aktiviert
    - Öffentlicher Lesezugriff für aktive Pop-ups
    - Nur Admins können Pop-ups verwalten
*/

-- Tabelle erstellen
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  message text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  is_active boolean DEFAULT true,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann aktive Pop-ups im richtigen Zeitraum lesen
CREATE POLICY "Anyone can view active announcements"
  ON announcements
  FOR SELECT
  TO public
  USING (
    is_active = true 
    AND start_date <= now() 
    AND end_date >= now()
  );

-- Policy: Admins können alle Pop-ups sehen
CREATE POLICY "Admins can view all announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins können Pop-ups erstellen
CREATE POLICY "Admins can create announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins können Pop-ups aktualisieren
CREATE POLICY "Admins can update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins können Pop-ups löschen
CREATE POLICY "Admins can delete announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Index für bessere Performance bei Datum-Abfragen
CREATE INDEX IF NOT EXISTS idx_announcements_active_dates 
  ON announcements(is_active, start_date, end_date) 
  WHERE is_active = true;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();