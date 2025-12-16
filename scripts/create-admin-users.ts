import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const adminUsers = [
  {
    email: 'info@mnw-mobilfunk.de',
    password: 'Aspire5536',
    name: 'Moritz'
  },
  {
    email: 'service@mnw-mobilfunk.de',
    password: 'Aspire5536',
    name: 'Marc'
  }
];

async function createAdminUsers() {
  console.log('Creating admin users...\n');

  for (const admin of adminUsers) {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: {
          name: admin.name
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`✓ User ${admin.email} already exists`);

          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users.users.find(u => u.email === admin.email);

          if (existingUser) {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .upsert({
                id: existingUser.id,
                vorname: admin.name,
                role: 'admin'
              }, {
                onConflict: 'id'
              });

            if (profileError) {
              console.error(`  Error updating profile: ${profileError.message}`);
            } else {
              console.log(`  ✓ Profile updated with admin role`);
            }
          }
          continue;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          vorname: admin.name,
          role: 'admin'
        });

      if (profileError) {
        console.error(`Error creating profile for ${admin.email}: ${profileError.message}`);
      } else {
        console.log(`✓ Created admin user: ${admin.email}`);
      }
    } catch (error: any) {
      console.error(`Error processing ${admin.email}:`, error.message);
    }
  }

  console.log('\n✓ Admin users setup complete!');
}

createAdminUsers();
