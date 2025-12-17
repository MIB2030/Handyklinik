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

async function deleteAndRecreateUser(username, email, password, vorname, nachname, oldUserId) {
  console.log(`\nLösche alten Benutzer ${username}...`);

  await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', oldUserId);

  await supabase
    .from('user_profiles')
    .delete()
    .eq('id', oldUserId);

  console.log(`✓ Alte Daten für ${username} gelöscht`);

  console.log(`Erstelle neuen Benutzer ${username} mit neuem Passwort...`);

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
    .insert({
      id: signUpData.user.id,
      username,
      vorname,
      nachname,
      role: 'admin'
    });

  if (profileError) {
    console.error(`Fehler beim Erstellen des Profils für ${username}:`, profileError.message);
  } else {
    console.log(`✓ Profil für ${username} erstellt`);
  }

  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: signUpData.user.id,
      role: 'admin'
    });

  if (roleError) {
    console.error(`Fehler beim Zuweisen der Admin-Rolle für ${username}:`, roleError.message);
  } else {
    console.log(`✓ Admin-Rolle für ${username} zugewiesen`);
  }

  console.log(`✓ Benutzer ${username} erfolgreich neu erstellt mit neuem Passwort!`);

  return signUpData.user.id;
}

async function main() {
  console.log('=== Admin-Benutzer mit neuem Passwort neu erstellen ===\n');

  const newPassword = 'Aspire5536';

  await deleteAndRecreateUser(
    'marc',
    'marc@handyklinik-ottobrunn.local',
    newPassword,
    'Marc',
    'Admin',
    'c67b75fa-9145-4d45-8c9c-e736b5dc1e04'
  );

  await deleteAndRecreateUser(
    'moritz',
    'moritz@handyklinik-ottobrunn.local',
    newPassword,
    'Moritz',
    'Admin',
    'a2143667-0efb-42c0-9023-4b7579a0abac'
  );

  console.log('\n=== Fertig! ===');
  console.log('\nNeue Login-Daten:');
  console.log('Benutzer 1:');
  console.log('  Benutzername: marc');
  console.log('  Passwort: Aspire5536');
  console.log('\nBenutzer 2:');
  console.log('  Benutzername: moritz');
  console.log('  Passwort: Aspire5536');
}

main().catch(console.error);
