/*
  # Google Settings öffentlich lesbar machen
  
  1. Änderungen
    - Entferne die Admin-only SELECT Policy
    - Füge PUBLIC SELECT Policy hinzu (jeder kann lesen)
    - Behalte INSERT/UPDATE nur für Admins
  
  2. Grund
    - Die Karte muss für alle Website-Besucher sichtbar sein
    - Dafür müssen API Key und Place ID öffentlich lesbar sein
    - Nur Admins können sie ändern
*/

-- Entferne die alte Admin-only Policy
DROP POLICY IF EXISTS "Admins can view google settings" ON google_settings;

-- Neue PUBLIC SELECT Policy
CREATE POLICY "Anyone can view google settings"
  ON google_settings
  FOR SELECT
  TO public
  USING (true);
