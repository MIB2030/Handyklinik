/*
  # Fix Voucher SELECT Policy für öffentliche Benutzer
  
  1. Problem
    - Öffentliche Benutzer können Gutscheine erstellen (INSERT Policy für public)
    - Aber sie können den erstellten Gutschein nicht zurücklesen (SELECT Policy nur für authenticated)
    - Das führt zu einem Fehler bei .insert().select().single()
  
  2. Lösung
    - Füge eine neue SELECT Policy für anon (öffentliche) Benutzer hinzu
    - Diese erlaubt das Lesen von active Gutscheinen
*/

-- Füge SELECT Policy für anon (nicht-authentifizierte) Benutzer hinzu
CREATE POLICY "Anon can view active vouchers"
  ON public.vouchers
  FOR SELECT
  TO anon
  USING (status = 'active');
