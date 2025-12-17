import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetAllUsers() {
  console.log('🗑️  Deleting all existing users...');

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  for (const user of users.users) {
    console.log(`Deleting user: ${user.email}`);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`Error deleting user ${user.email}:`, error);
    }
  }

  console.log('✅ All users deleted\n');

  console.log('👤 Creating admin user: moritz');
  const { data: moritz, error: moritzError } = await supabase.auth.admin.createUser({
    email: 'moritz@admin.local',
    password: 'Aspire5536',
    email_confirm: true,
    user_metadata: {
      vorname: 'Moritz'
    }
  });

  if (moritzError) {
    console.error('Error creating moritz:', moritzError);
  } else {
    console.log('✅ Moritz created with ID:', moritz.user.id);

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: moritz.user.id,
        vorname: 'Moritz',
        username: 'moritz',
        role: 'admin'
      });

    if (profileError) {
      console.error('Error creating moritz profile:', profileError);
    } else {
      console.log('✅ Moritz profile created');
    }
  }

  console.log('\n👤 Creating admin user: marc');
  const { data: marc, error: marcError } = await supabase.auth.admin.createUser({
    email: 'marc@admin.local',
    password: 'Aspire5536',
    email_confirm: true,
    user_metadata: {
      vorname: 'Marc'
    }
  });

  if (marcError) {
    console.error('Error creating marc:', marcError);
  } else {
    console.log('✅ Marc created with ID:', marc.user.id);

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: marc.user.id,
        vorname: 'Marc',
        username: 'marc',
        role: 'admin'
      });

    if (profileError) {
      console.error('Error creating marc profile:', profileError);
    } else {
      console.log('✅ Marc profile created');
    }
  }

  console.log('\n🎉 Setup complete!');
  console.log('Username: moritz');
  console.log('Username: marc');
  console.log('Password: Aspire5536');
}

resetAllUsers().catch(console.error);
