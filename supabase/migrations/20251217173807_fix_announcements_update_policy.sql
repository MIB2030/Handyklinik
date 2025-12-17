/*
  # Fix announcements UPDATE policy
  
  1. Problem
    - Die UPDATE-Policy für announcements fehlt die WITH CHECK Klausel
    - Dies verhindert, dass Updates korrekt durchgeführt werden können
  
  2. Lösung
    - DROP der alten UPDATE-Policy
    - Erstellen einer neuen UPDATE-Policy mit sowohl USING als auch WITH CHECK
  
  3. Sicherheit
    - Nur Admins können announcements aktualisieren
    - Verwendet is_admin() Funktion für sichere Admin-Prüfung
*/

-- Drop alte UPDATE-Policy
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;

-- Neue UPDATE-Policy mit USING und WITH CHECK
CREATE POLICY "Admins can update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
