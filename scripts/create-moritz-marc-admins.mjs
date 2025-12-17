import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

console.log('⚠️  WICHTIGER HINWEIS:');
console.log('Dieses Skript kann auth.users nicht direkt löschen.');
console.log('Bitte führen Sie folgende Schritte im Supabase Dashboard aus:\n');
console.log('1. Gehen Sie zu: https://supabase.com/dashboard/project/lnimxmbghbdadbotjyan/auth/users');
console.log('2. Löschen Sie alle bestehenden Benutzer manuell');
console.log('3. Erstellen Sie zwei neue Benutzer:');
console.log('   - Email: moritz@admin.local, Password: Aspire5536');
console.log('   - Email: marc@admin.local, Password: Aspire5536');
console.log('4. Führen Sie danach das folgende SQL im SQL Editor aus:\n');

const sql = `
-- Löschen Sie zuerst alle bestehenden Profile
DELETE FROM user_profiles;

-- Fügen Sie die Profile für moritz und marc hinzu
-- Ersetzen Sie MORITZ_USER_ID und MARC_USER_ID mit den tatsächlichen IDs aus auth.users
INSERT INTO user_profiles (id, vorname, username, role)
VALUES
  ('MORITZ_USER_ID', 'Moritz', 'moritz', 'admin'),
  ('MARC_USER_ID', 'Marc', 'marc', 'admin');
`;

console.log(sql);
console.log('\n📋 Die USER_IDs finden Sie in der auth.users Tabelle nach dem Erstellen der Benutzer.');
