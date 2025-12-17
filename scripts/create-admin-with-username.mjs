import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Fehler: VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY müssen in .env gesetzt sein');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser(username, email, password, vorname, nachname) {
  console.log(`\nErstelle Admin-Benutzer: ${username} (${email})...`);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        vorname,
        nachname
      }
    }
  });

  if (signUpError) {
    console.error(`Fehler beim Erstellen des Benutzers ${username}:`, signUpError.message);
    return null;
  }

  console.log(`✓ Benutzer ${username} erstellt mit ID: ${signUpData.user.id}`);

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: signUpData.user.id,
      username,
      vorname,
      nachname,
      role: 'admin'
    });

  if (profileError) {
    console.error(`Fehler beim Erstellen des Profils für ${username}:`, profileError.message);
    return signUpData.user.id;
  }

  console.log(`✓ Profil für ${username} erstellt`);

  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: signUpData.user.id,
      role: 'admin'
    });

  if (roleError) {
    console.error(`Fehler beim Zuweisen der Admin-Rolle für ${username}:`, roleError.message);
    return signUpData.user.id;
  }

  console.log(`✓ Admin-Rolle für ${username} zugewiesen`);
  console.log(`✓ Benutzer ${username} erfolgreich erstellt!`);

  return signUpData.user.id;
}

async function main() {
  console.log('=== Admin-Benutzer mit Benutzernamen erstellen ===\n');

  await createAdminUser(
    'marc',
    'marc@handyklinik-ottobrunn.local',
    'Admin2024!Marc',
    'Marc',
    'Admin'
  );

  await createAdminUser(
    'moritz',
    'moritz@handyklinik-ottobrunn.local',
    'Admin2024!Moritz',
    'Moritz',
    'Admin'
  );

  console.log('\n=== Fertig! ===');
  console.log('\nLogin-Daten:');
  console.log('Benutzer 1:');
  console.log('  Benutzername: marc');
  console.log('  Passwort: Admin2024!Marc');
  console.log('\nBenutzer 2:');
  console.log('  Benutzername: moritz');
  console.log('  Passwort: Admin2024!Moritz');
}

main().catch(console.error);