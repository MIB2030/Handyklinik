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

    console.log('Clearing existing data...');
    const { error: deleteError } = await supabase.rpc('exec_sql', {
      query: 'DELETE FROM repair_prices'
    });

    if (deleteError) {
      console.log('Note: Could not clear table (might not have permission, continuing anyway)');
    }

    console.log('Inserting new data...');
    const batchSize = 50;
    let successCount = 0;

    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);

      const values = batch.map(item =>
        `('${item.hersteller.replace(/'/g, "''")}', '${item.modell.replace(/'/g, "''")}', '${item.reparatur.replace(/'/g, "''")}', ${item.preis}, '${item.beschreibung.replace(/'/g, "''")}')`
      ).join(',');

      const sql = `INSERT INTO repair_prices (hersteller, modell, reparatur, preis, beschreibung) VALUES ${values}`;

      const { error } = await supabase.rpc('exec_sql', { query: sql });

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      } else {
        successCount += batch.length;
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${successCount}/${validData.length} items)`);
      }
    }

    console.log(`Import completed! Successfully imported ${successCount} entries.`);
  } catch (error) {
    console.error('Error importing prices:', error);
    process.exit(1);
  }
}

importPrices();
