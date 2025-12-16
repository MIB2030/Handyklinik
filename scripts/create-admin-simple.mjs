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

const adminUsers = [
  {
    email: 'info@mnw-mobilfunk.de',
    password: 'Aspire5536',
    vorname: 'Moritz',
    nachname: 'MNW'
  },
  {
    email: 'service@mnw-mobilfunk.de',
    password: 'Aspire5536',
    vorname: 'Marc',
    nachname: 'MNW'
  }
];

async function createAdminUsers() {
  console.log('Erstelle Admin-Benutzer...\n');

  for (const admin of adminUsers) {
    console.log(`Erstelle: ${admin.email} (${admin.vorname})`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: admin.email,
      password: admin.password,
      options: {
        data: {
          vorname: admin.vorname,
          nachname: admin.nachname
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log(`  ⚠️  Benutzer existiert bereits, aktualisiere Profil...`);

        const { data: { user } } = await supabase.auth.signInWithPassword({
          email: admin.email,
          password: admin.password
        });

        if (user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              vorname: admin.vorname,
              nachname: admin.nachname,
              role: 'admin'
            });

          if (profileError) {
            console.error(`  ❌ Fehler beim Aktualisieren des Profils:`, profileError.message);
          } else {
            console.log(`  ✅ Profil aktualisiert und Admin-Rolle zugewiesen`);
          }

          await supabase.auth.signOut();
        }
      } else {
        console.error(`  ❌ Fehler:`, signUpError.message);
      }
      continue;
    }

    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: signUpData.user.id,
          vorname: admin.vorname,
          nachname: admin.nachname,
          role: 'admin'
        });

      if (profileError) {
        console.error(`  ❌ Fehler beim Erstellen des Profils:`, profileError.message);
      } else {
        console.log(`  ✅ Admin-Benutzer erfolgreich erstellt`);
      }
    }
  }

  console.log('\n✅ Admin-Benutzer-Erstellung abgeschlossen!\n');
  console.log('Login-Daten:');
  console.log('1. Email: info@mnw-mobilfunk.de | Passwort: Aspire5536 (Moritz)');
  console.log('2. Email: service@mnw-mobilfunk.de | Passwort: Aspire5536 (Marc)');
  console.log('\nLogin-URL: http://localhost:5173/admin');
}

createAdminUsers();
