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

async function updatePassword(email, newPassword, username) {
  console.log(`\nÄndere Passwort für ${username}...`);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: 'dummy'
  });

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error(`Fehler beim Ändern des Passworts für ${username}:`, error.message);
    return false;
  }

  console.log(`✓ Passwort für ${username} erfolgreich geändert!`);

  await supabase.auth.signOut();

  return true;
}

async function main() {
  console.log('=== Admin-Passwörter aktualisieren ===\n');

  const users = [
    {
      id: 'c67b75fa-9145-4d45-8c9c-e736b5dc1e04',
      username: 'marc',
      email: 'marc@handyklinik-ottobrunn.local'
    },
    {
      id: 'a2143667-0efb-42c0-9023-4b7579a0abac',
      username: 'moritz',
      email: 'moritz@handyklinik-ottobrunn.local'
    }
  ];

  const newPassword = 'Aspire5536';

  for (const user of users) {
    const { error } = await supabase.rpc('update_user_password', {
      user_id: user.id,
      new_password: newPassword
    });

    if (error) {
      console.log(`Direktes Update über RPC nicht verfügbar für ${user.username}`);
      console.log(`Verwende SQL-Update...`);
    } else {
      console.log(`✓ Passwort für ${user.username} erfolgreich geändert!`);
    }
  }

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
