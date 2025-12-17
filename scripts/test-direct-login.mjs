import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnimxmbghbdadbotjyan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaW14bWJnaGJkYWRib3RqeWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMjMzMzgsImV4cCI6MjA4MDY5OTMzOH0.4jrkeiOdsY__oJ5FNFVYmcju2uklb5jXYYiUVt3F_Aw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectLogin(email, password) {
  console.log(`\n🧪 Testing direct login with email: ${email}`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    console.error('   Error details:', error);
    return false;
  }

  console.log('✅ Login successful!');
  console.log(`   User ID: ${data.user.id}`);
  console.log(`   Email: ${data.user.email}`);

  await supabase.auth.signOut();
  return true;
}

async function testUsernameLogin(username, password) {
  console.log(`\n🧪 Testing username login: ${username}`);

  // Get email from username
  const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_username', {
    p_username: username
  });

  if (rpcError) {
    console.error('❌ Error getting email:', rpcError.message);
    return false;
  }

  if (!emailData) {
    console.error('❌ No email found for username:', username);
    return false;
  }

  console.log(`   Found email: ${emailData}`);

  // Try to login with email
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailData,
    password: password,
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    console.error('   Error details:', error);
    return false;
  }

  console.log('✅ Login successful!');
  console.log(`   User ID: ${data.user.id}`);
  console.log(`   Email: ${data.user.email}`);

  await supabase.auth.signOut();
  return true;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Authentication');
  console.log('='.repeat(60));

  // Test direct email login
  await testDirectLogin('moritz@admin.local', 'Aspire5536');
  await testDirectLogin('marc@admin.local', 'Aspire5536');

  // Test username-based login
  await testUsernameLogin('moritz', 'Aspire5536');
  await testUsernameLogin('marc', 'Aspire5536');

  console.log('\n' + '='.repeat(60));
  console.log('Tests completed!');
  console.log('='.repeat(60));
}

runTests();
