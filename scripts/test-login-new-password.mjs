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

async function testLogin(username, password) {
  console.log(`\n=== Teste Login für ${username} ===`);

  // Hole E-Mail aus Username
  const { data: emailData, error: emailError } = await supabase.rpc('get_email_by_username', {
    username_input: username
  });

  if (emailError) {
    console.error('Fehler beim Abrufen der E-Mail:', emailError.message);
    return false;
  }

  if (!emailData) {
    console.error(`Kein Benutzer mit Username "${username}" gefunden`);
    return false;
  }

  console.log(`✓ E-Mail für ${username} gefunden: ${emailData}`);

  // Versuche Login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailData,
    password: password
  });

  if (error) {
    console.error('✗ Login fehlgeschlagen:', error.message);
    return false;
  }

  console.log('✓ Login erfolgreich!');
  console.log(`  User ID: ${data.user.id}`);
  console.log(`  Email: ${data.user.email}`);

  // Prüfe Admin-Rolle
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (roleData) {
    console.log(`  Rolle: ${roleData.role}`);
  }

  // Prüfe Profil
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('username, vorname, nachname, role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileData) {
    console.log(`  Profil: ${profileData.vorname} ${profileData.nachname} (${profileData.username})`);
    console.log(`  Profil-Rolle: ${profileData.role}`);
  }

  await supabase.auth.signOut();
  console.log('✓ Logout erfolgreich');

  return true;
}

async function main() {
  console.log('=== Test Login mit neuen Passwörtern ===\n');

  const password = 'Aspire5536';

  await testLogin('marc', password);
  await testLogin('moritz', password);

  console.log('\n=== Test abgeschlossen ===');
}

main().catch(console.error);
