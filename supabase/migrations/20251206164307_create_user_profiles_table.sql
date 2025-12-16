/*
  # Benutzerprofil-Tabelle erstellen

  1. Neue Tabelle
    - user_profiles
      - id (uuid, primary key, verweist auf auth.users)
      - name (text) - Anzeigename des Benutzers
      - created_at (timestamptz) - Erstellungszeitpunkt
      - updated_at (timestamptz) - Aktualisierungszeitpunkt

  2. Sicherheit
    - RLS aktiviert
    - Benutzer können ihr eigenes Profil lesen
    - Benutzer können ihr eigenes Profil aktualisieren
    - Admins können alle Profile lesen
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
