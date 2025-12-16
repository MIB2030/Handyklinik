-- Admin-Profile für bestehende Benutzer erstellen oder aktualisieren
-- Führen Sie dieses SQL im Supabase SQL Editor aus:
-- https://supabase.com/dashboard/project/lnimxmbghbdadbotjyan/editor

-- Profile für Admin-Benutzer erstellen/aktualisieren
INSERT INTO user_profiles (id, vorname, role)
SELECT
  id,
  CASE
    WHEN email = 'info@mnw-mobilfunk.de' THEN 'Moritz'
    WHEN email = 'service@mnw-mobilfunk.de' THEN 'Marc'
  END as vorname,
  'admin' as role
FROM auth.users
WHERE email IN ('info@mnw-mobilfunk.de', 'service@mnw-mobilfunk.de')
ON CONFLICT (id) DO UPDATE
SET
  vorname = EXCLUDED.vorname,
  role = EXCLUDED.role;

-- Prüfen, ob die Profile erstellt wurden
SELECT
  au.email,
  up.vorname,
  up.role,
  up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email IN ('info@mnw-mobilfunk.de', 'service@mnw-mobilfunk.de');
