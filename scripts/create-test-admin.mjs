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

async function createTestAdmin() {
  const email = 'admin@handyklinik.de';
  const password = 'Admin2024!Test';
  const vorname = 'Admin';
  const nachname = 'Handyklinik';

  console.log('Erstelle Test-Admin-Benutzer...');
  console.log('Email:', email);
  console.log('Passwort:', password);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        vorname,
        nachname
      }
    }
  });

  if (signUpError) {
    console.error('Fehler beim Erstellen des Benutzers:', signUpError.message);
    process.exit(1);
  }

  console.log('Benutzer erstellt:', signUpData.user?.id);

  if (signUpData.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: signUpData.user.id,
        vorname,
        nachname,
        role: 'admin'
      });

    if (profileError) {
      console.error('Fehler beim Erstellen des Profils:', profileError.message);
    } else {
      console.log('Admin-Rolle erfolgreich zugewiesen!');
    }
  }

  console.log('\n✅ Test-Admin-Benutzer erfolgreich erstellt!');
  console.log('\nLogin-Daten:');
  console.log('Email:', email);
  console.log('Passwort:', password);
  console.log('\nLogin unter: http://localhost:5173/admin');
}

createTestAdmin();
