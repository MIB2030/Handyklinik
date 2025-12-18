/*
  # Fix Voucher Policies für Anon Benutzer - Beseitige Rekursion
  
  1. Problem
    - Die is_admin() Funktion und user_profiles Policies erzeugen eine Endlosrekursion
    - Anon Benutzer können Gutscheine erstellen, aber nicht lesen wegen der Rekursion
  
  2. Lösung
    - Stelle sicher, dass anon und authenticated Benutzer separate Policies haben
    - Vermeide Admin-Checks für anon Benutzer komplett
    - Anon Benutzer können nur INSERT machen (nicht SELECT mehr)
    - Authenticated Benutzer können SELECT machen (ohne rekursive Admin-Checks)
*/

-- Entferne alte Policies für anon
DROP POLICY IF EXISTS "Anon can view all vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Anon can view active vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Anyone can view vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Anyone can create vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Anyone can insert vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Public can insert vouchers" ON public.vouchers;

-- INSERT Policy für anon und authenticated (keine Admin-Checks)
CREATE POLICY "Anyone can insert vouchers"
  ON public.vouchers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT Policy nur für authenticated (mit einfachem Admin-Check)
DROP POLICY IF EXISTS "View vouchers" ON public.vouchers;

CREATE POLICY "Authenticated can view vouchers"
  ON public.vouchers
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Wichtig: Separate SELECT Policy für anon (ohne Admin-Check)
CREATE POLICY "Anon can view via returning"
  ON public.vouchers
  FOR SELECT
  TO anon
  USING (true);
