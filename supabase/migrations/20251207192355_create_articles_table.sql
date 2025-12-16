/*
  # Artikel-System erstellen

  1. Neue Tabellen
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text) - Artikel-Titel
      - `slug` (text, unique) - SEO-freundliche URL
      - `content` (text) - Haupt-Inhalt
      - `excerpt` (text) - Kurze Zusammenfassung
      - `image_url` (text) - Haupt-Bild URL
      - `category` (text) - Kategorie (Blog, News, Produkt, etc.)
      - `status` (text) - Status (draft, published)
      - `author_id` (uuid) - Autor-Referenz zu user_profiles
      - `price` (numeric) - Optional: Preis für Produkte
      - `meta_title` (text) - SEO Meta-Titel
      - `meta_description` (text) - SEO Meta-Beschreibung
      - `published_at` (timestamptz) - Veröffentlichungsdatum
      - `created_at` (timestamptz) - Erstellungsdatum
      - `updated_at` (timestamptz) - Aktualisierungsdatum

  2. Sicherheit
    - Enable RLS on `articles` table
    - Policy: Jeder kann veröffentlichte Artikel lesen
    - Policy: Admins können alle Artikel sehen
    - Policy: Admins können Artikel erstellen
    - Policy: Admins können Artikel bearbeiten
    - Policy: Admins können Artikel löschen

  3. Hinweise
    - Slug wird automatisch aus Titel generiert (Frontend)
    - Status: 'draft' oder 'published'
    - published_at wird beim Veröffentlichen gesetzt
    - Trigger für updated_at bei Änderungen
*/

-- Artikel-Tabelle erstellen
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT 'blog',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  price numeric(10, 2) DEFAULT NULL,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  published_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- RLS aktivieren
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann veröffentlichte Artikel lesen
CREATE POLICY "Anyone can view published articles"
  ON articles
  FOR SELECT
  USING (status = 'published');

-- Policy: Admins können alle Artikel sehen
CREATE POLICY "Admins can view all articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins können Artikel erstellen
CREATE POLICY "Admins can create articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins können Artikel bearbeiten
CREATE POLICY "Admins can update articles"
  ON articles
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

-- Policy: Admins können Artikel löschen
CREATE POLICY "Admins can delete articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );