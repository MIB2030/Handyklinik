/*
  # Add role column to user_profiles

  1. Changes
    - Add `role` column to `user_profiles` table
    - Set default value to 'customer'
    - Add index for faster role-based queries
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add role column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- Add index for role queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
