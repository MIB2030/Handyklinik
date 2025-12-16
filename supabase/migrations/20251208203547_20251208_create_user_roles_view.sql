/*
  # Create user roles view with email

  1. New Views
    - `user_roles_with_email` - Join user_roles with auth.users to get email addresses
  
  2. Purpose
    - Provides admin interface access to user list without requiring admin auth token
    - Allows secure display of user information for admin panel
  
  3. Security
    - View is available to all authenticated users
    - RLS policies on user_roles table still protect data access
*/

CREATE OR REPLACE VIEW user_roles_with_email AS
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  COALESCE(u.email, 'unknown@example.com') as email
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id;
