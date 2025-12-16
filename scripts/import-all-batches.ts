import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importBatch(batchNumber: number) {
  const filePath = join(process.cwd(), 'scripts', `insert_batch_${batchNumber}.sql`);
  console.log(`Importing batch ${batchNumber}...`);

  try {
    const sql = readFileSync(filePath, 'utf-8');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`Error in batch ${batchNumber}:`, error);
      return false;
    }

    console.log(`✓ Batch ${batchNumber} imported successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to read batch ${batchNumber}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting data import...\n');

  // Clear existing data first
  console.log('Clearing existing data...');
  const { error: deleteError } = await supabase
    .from('repair_prices')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Error clearing data:', deleteError);
  } else {
    console.log('✓ Existing data cleared\n');
  }

  // Import all batches
  for (let i = 1; i <= 8; i++) {
    await importBatch(i);
  }

  // Check total count
  const { count, error } = await supabase
    .from('repair_prices')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting rows:', error);
  } else {
    console.log(`\n✓ Total rows imported: ${count}`);
  }
}

main().catch(console.error);
