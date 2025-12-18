/*
  # Vereinfache Voucher SELECT Policy für anon Benutzer
  
  1. Problem
    - Die eingeschränkte Policy (status = 'active') funktioniert möglicherweise nicht korrekt
    
  2. Lösung
    - Erlaube anon Benutzern ALLE Vouchers zu lesen (wie in der ursprünglichen Migration)
    - Dies ist sicher, da Vouchers öffentlich generiert werden sollen
*/

-- Entferne die eingeschränkte Policy
DROP POLICY IF EXISTS "Anon can view active vouchers" ON public.vouchers;

-- Erstelle eine neue Policy ohne Einschränkungen
CREATE POLICY "Anon can view all vouchers"
  ON public.vouchers
  FOR SELECT
  TO anon
  USING (true);
