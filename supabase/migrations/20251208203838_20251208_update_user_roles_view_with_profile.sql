/*
  # Update user_roles_with_email view to include profile data
  
  1. Changes
    - Drop existing view `user_roles_with_email`
    - Recreate view with JOIN to user_profiles table
    - Include vorname (first name) and nachname (last name)
    - Join on user_id from both user_roles and user_profiles
*/

DROP VIEW IF EXISTS user_roles_with_email;

CREATE VIEW user_roles_with_email AS
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  COALESCE(u.email, 'unknown@example.com'::character varying) AS email,
  COALESCE(up.vorname, ''::text) AS vorname,
  COALESCE(up.nachname, ''::text) AS nachname
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN user_profiles up ON ur.user_id = up.id;
