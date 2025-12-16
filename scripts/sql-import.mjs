import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  const { count: before } = await supabase
    .from('repair_prices')
    .select('*', { count: 'exact', head: true });

  console.log(`Current count: ${before}\n`);

  // Import each batch via raw SQL
  for (let i = 2; i <= 8; i++) {
    console.log(`Importing batch ${i}...`);
    const sql = readFileSync(`./scripts/insert_batch_${i}.sql`, 'utf-8');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`Error in batch ${i}:`, error.message);
    } else {
      console.log(`✓ Batch ${i} imported`);
    }
  }

  const { count: after } = await supabase
    .from('repair_prices')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✓ Complete! Total rows: ${after}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
