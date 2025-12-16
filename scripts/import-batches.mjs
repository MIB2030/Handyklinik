import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Starting data import...\n');

  // Get current count
  const { count: beforeCount } = await supabase
    .from('repair_prices')
    .select('*', { count: 'exact', head: true });

  console.log(`Current rows in database: ${beforeCount}\n`);

  // Import batches 2-8 (batch 1 was already imported)
  for (let i = 2; i <= 8; i++) {
    const filePath = join(__dirname, `insert_batch_${i}.sql`);
    console.log(`Reading batch ${i}...`);

    try {
      const sql = readFileSync(filePath, 'utf-8');

      // Execute the SQL using Supabase RPC or by parsing it
      // Since we can't execute raw SQL directly via the client easily,
      // let's parse the VALUES and insert them

      const valuesMatch = sql.match(/VALUES\s+([\s\S]+);/i);
      if (!valuesMatch) {
        console.error(`Could not parse batch ${i}`);
        continue;
      }

      // Parse the values
      const valuesString = valuesMatch[1];
      const rows = [];

      // Split by "),(" to get individual rows
      const rowStrings = valuesString.split(/\),\s*\(/);

      for (let rowStr of rowStrings) {
        // Clean up the string
        rowStr = rowStr.replace(/^\(/, '').replace(/\)$/, '');

        // Match the values - this is complex due to escaped quotes
        const matches = rowStr.match(/'([^']*(?:''[^']*)*)'/g);
        if (matches && matches.length >= 5) {
          const hersteller = matches[0].replace(/^'|'$/g, '').replace(/''/g, "'");
          const modell = matches[1].replace(/^'|'$/g, '').replace(/''/g, "'");
          const reparatur = matches[2].replace(/^'|'$/g, '').replace(/''/g, "'");
          const preisMatch = rowStr.match(/'[^']*',\s*(\d+(?:\.\d+)?)\s*,/);
          const preis = preisMatch ? parseFloat(preisMatch[1]) : 0;
          const beschreibung = matches[matches.length - 1].replace(/^'|'$/g, '').replace(/''/g, "'");

          rows.push({
            hersteller,
            modell,
            reparatur,
            preis,
            beschreibung
          });
        }
      }

      console.log(`Parsed ${rows.length} rows from batch ${i}`);

      // Insert in chunks of 100
      for (let j = 0; j < rows.length; j += 100) {
        const chunk = rows.slice(j, j + 100);
        const { error } = await supabase
          .from('repair_prices')
          .insert(chunk);

        if (error) {
          console.error(`Error inserting chunk from batch ${i}:`, error);
        } else {
          console.log(`  Inserted rows ${j + 1}-${Math.min(j + 100, rows.length)}`);
        }
      }

      console.log(`✓ Batch ${i} completed\n`);

    } catch (error) {
      console.error(`Failed to process batch ${i}:`, error);
    }
  }

  // Get final count
  const { count: afterCount } = await supabase
    .from('repair_prices')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✓ Import complete!`);
  console.log(`Final rows in database: ${afterCount}`);
  console.log(`Rows imported: ${afterCount - beforeCount}`);
}

main().catch(console.error);
