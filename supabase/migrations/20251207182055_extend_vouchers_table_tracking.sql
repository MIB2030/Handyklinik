/*
  # Extend Vouchers Table for Complete Tracking

  1. Changes to vouchers table
    - Add `generated_at` (timestamptz) - Wann wurde der Gutschein generiert
    - Add `printed_at` (timestamptz, nullable) - Wann wurde der Gutschein gedruckt
    - Add `print_count` (integer) - Wie oft wurde der Gutschein gedruckt
    - Add `redeemed_at` (timestamptz, nullable) - Wann wurde der Gutschein eingelöst
    - Add `redeemed_by` (uuid, nullable) - Admin der den Gutschein eingelöst hat
    - Add `status` (text) - active/redeemed/expired
    - Add `notes` (text, nullable) - Admin-Notizen zum Gutschein

  2. Security
    - Maintain existing RLS policies
    - Add admin-only policies for redemption tracking
*/

-- Add new columns to vouchers table
DO $$
BEGIN
  -- Add generated_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'generated_at'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN generated_at timestamptz DEFAULT now();
  END IF;

  -- Add printed_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'printed_at'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN printed_at timestamptz;
  END IF;

  -- Add print_count if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'print_count'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN print_count integer DEFAULT 0;
  END IF;

  -- Add redeemed_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'redeemed_at'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN redeemed_at timestamptz;
  END IF;

  -- Add redeemed_by if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'redeemed_by'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN redeemed_by uuid REFERENCES auth.users(id);
  END IF;

  -- Add status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'status'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired'));
  END IF;

  -- Add notes if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN notes text;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_generated_at ON vouchers(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vouchers_redeemed_at ON vouchers(redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);

-- Enable RLS if not already enabled
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public can view active vouchers by code" ON vouchers;
DROP POLICY IF EXISTS "Public can insert vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public can update printed_at" ON vouchers;
DROP POLICY IF EXISTS "Admins can view all vouchers" ON vouchers;
DROP POLICY IF EXISTS "Admins can update vouchers" ON vouchers;
DROP POLICY IF EXISTS "Admins can delete vouchers" ON vouchers;

-- Public can view active vouchers by code (to check validity)
CREATE POLICY "Public can view active vouchers by code"
  ON vouchers FOR SELECT
  TO public
  USING (status = 'active');

-- Public can insert vouchers (customer generates voucher)
CREATE POLICY "Public can insert vouchers"
  ON vouchers FOR INSERT
  TO public
  WITH CHECK (true);

-- Public can update print tracking (when customer prints voucher)
CREATE POLICY "Public can update printed_at"
  ON vouchers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can view all vouchers
CREATE POLICY "Admins can view all vouchers"
  ON vouchers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Authenticated admins can update vouchers (mark as redeemed, add notes)
CREATE POLICY "Admins can update vouchers"
  ON vouchers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Authenticated admins can delete vouchers
CREATE POLICY "Admins can delete vouchers"
  ON vouchers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Function to automatically mark voucher as redeemed
CREATE OR REPLACE FUNCTION mark_voucher_redeemed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.redeemed_at IS NOT NULL AND OLD.redeemed_at IS NULL THEN
    NEW.status = 'redeemed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update status when redeemed_at is set
DROP TRIGGER IF EXISTS update_voucher_status_on_redeem ON vouchers;
CREATE TRIGGER update_voucher_status_on_redeem
  BEFORE UPDATE ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION mark_voucher_redeemed();