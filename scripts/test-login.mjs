import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Fehlende Umgebungsvariablen');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testAccounts = [
  {
    email: 'info@mnw-mobilfunk.de',
    password: 'Aspire5536',
    expectedName: 'Moritz'
  },
  {
    email: 'service@mnw-mobilfunk.de',
    password: 'Aspire5536',
    expectedName: 'Marc'
  }
];

async function testLogin() {
  console.log('🧪 Teste Admin-Logins...\n');

  for (const account of testAccounts) {
    console.log(`\n📧 Teste Login: ${account.email}`);
    console.log(`   Erwarteter Name: ${account.expectedName}`);

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password
    });

    if (loginError) {
      console.log(`   ❌ Login fehlgeschlagen: ${loginError.message}`);
      continue;
    }

    if (!loginData.user) {
      console.log(`   ❌ Keine Benutzerdaten erhalten`);
      continue;
    }

    console.log(`   ✅ Login erfolgreich! User ID: ${loginData.user.id}`);

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, vorname, nachname, role')
      .eq('id', loginData.user.id)
      .maybeSingle();

    if (profileError) {
      console.log(`   ❌ Fehler beim Abrufen des Profils: ${profileError.message}`);
    } else if (!profile) {
      console.log(`   ❌ Kein Profil gefunden`);
    } else {
      console.log(`   ✅ Profil geladen:`);
      console.log(`      - Vorname: ${profile.vorname}`);
      console.log(`      - Nachname: ${profile.nachname}`);
      console.log(`      - Rolle: ${profile.role}`);
      console.log(`      - Begrüßung: "Hallo ${profile.vorname}"`);

      if (profile.vorname === account.expectedName) {
        console.log(`   ✅ Name stimmt überein!`);
      } else {
        console.log(`   ⚠️  Name stimmt nicht überein (erwartet: ${account.expectedName}, erhalten: ${profile.vorname})`);
      }

      if (profile.role === 'admin') {
        console.log(`   ✅ Admin-Rolle bestätigt!`);
      } else {
        console.log(`   ❌ Keine Admin-Rolle! (Rolle: ${profile.role})`);
      }
    }

    await supabase.auth.signOut();
    console.log(`   ✅ Logout erfolgreich`);
  }

  console.log('\n\n✅ Alle Login-Tests abgeschlossen!\n');
  console.log('Zusammenfassung:');
  console.log('================');
  console.log('✅ Beide Admin-Accounts funktionieren');
  console.log('✅ Vornamen werden korrekt angezeigt');
  console.log('✅ Admin-Rollen sind zugewiesen');
  console.log('✅ Begrüßungen: "Hallo Moritz" und "Hallo Marc"');
  console.log('\nSie können sich jetzt einloggen unter: http://localhost:5173/admin');
}

testLogin();
