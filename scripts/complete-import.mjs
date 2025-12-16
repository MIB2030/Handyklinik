import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function importFromFile(filename) {
  console.log(`\nImporting ${filename}...`);

  const content = readFileSync(filename, 'utf-8');
  const lines = content.trim().split('\n');

  const rows = [];

  for (const line of lines) {
    if (!line.trim() || line.startsWith('INSERT')) continue;

    // Parse each row - format: ('value1', 'value2', 'value3', 123, 'value4'),
    const match = line.match(/\('([^']*(?:''[^']*)*)'\s*,\s*'([^']*(?:''[^']*)*)'\s*,\s*'([^']*(?:''[^']*)*)'\s*,\s*(\d+(?:\.\d+)?)\s*,\s*'([^']*(?:''[^']*)*)'\)/);

    if (match) {
      rows.push({
        hersteller: match[1].replace(/''/g, "'"),
        modell: match[2].replace(/''/g, "'"),
        reparatur: match[3].replace(/''/g, "'"),
        preis: parseFloat(match[4]),
        beschreibung: match[5].replace(/''/g, "'")
      });
    }
  }

  console.log(`Parsed ${rows.length} rows`);

  // Insert in chunks
  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('repair_prices').insert(chunk);

    if (error) {
      console.error(`Error inserting chunk ${i}-${i+chunk.length}:`, error.message);
    } else {
      console.log(`✓ Inserted rows ${i+1}-${i+chunk.length}`);
    }
  }
}

async function main() {
  const { count: before } = await supabase
    .from('repair_prices')
    .select('*', { count: 'exact', head: true });

  console.log(`Current count: ${before}`);

  // Import batches 2-8
  for (let i = 2; i <= 8; i++) {
    await importFromFile(`./scripts/insert_batch_${i}.sql`);
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
