import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importPrices() {
  try {
    const filePath = join(__dirname, '../src/data/preisliste_strukturiert_final.xlsx');
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} rows in the Excel file`);

    const priceData = data.map((row: any) => {
      let preis = 0;
      if (row.Preisneu) {
        const preisStr = String(row.Preisneu).replace('€', '').replace(',', '.').trim();
        preis = parseFloat(preisStr) || 0;
      }

      return {
        hersteller: row.Hersteller || '',
        modell: row.Modell || '',
        reparatur: row.Reparatur || '',
        preis: preis,
        beschreibung: row.Beschreibung || ''
      };
    });

    const validData = priceData.filter(item =>
      item.hersteller && item.modell && item.reparatur && item.preis > 0
    );

    console.log(`Importing ${validData.length} valid entries...`);

    const { error: deleteError } = await supabase
      .from('repair_prices')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error clearing table:', deleteError);
    }

    const batchSize = 100;
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);
      const { error } = await supabase
        .from('repair_prices')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} items)`);
      }
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing prices:', error);
    process.exit(1);
  }
}

importPrices();
