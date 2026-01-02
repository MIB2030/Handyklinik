/*
  # HTML-Content Support für Pop-up Ankündigungen

  1. Neue Spalten
    - `content_type` (text) - Typ des Inhalts: 'text' (Standard) oder 'html'
    - `html_content` (text) - Vollständiger HTML-Code für das Pop-up

  2. Änderungen
    - `content_type` bestimmt, ob normaler Text oder HTML-Code verwendet wird
    - Bei 'text': title und message werden wie bisher verwendet
    - Bei 'html': html_content wird als vollständige HTML-Seite in einem iframe gerendert
    - Die Spalte message ist jetzt optional, wenn html_content verwendet wird
*/

-- Neue Spalten hinzufügen
DO $$
BEGIN
  -- content_type Spalte hinzufügen
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE announcements 
    ADD COLUMN content_type text NOT NULL DEFAULT 'text' 
    CHECK (content_type IN ('text', 'html'));
  END IF;

  -- html_content Spalte hinzufügen
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'html_content'
  ) THEN
    ALTER TABLE announcements 
    ADD COLUMN html_content text;
  END IF;
END $$;

-- Constraint aktualisieren: message ist nur bei 'text' erforderlich
ALTER TABLE announcements 
DROP CONSTRAINT IF EXISTS announcements_message_check;

ALTER TABLE announcements 
ADD CONSTRAINT announcements_message_check 
CHECK (
  (content_type = 'text' AND message IS NOT NULL AND message != '') 
  OR 
  (content_type = 'html' AND html_content IS NOT NULL AND html_content != '')
);