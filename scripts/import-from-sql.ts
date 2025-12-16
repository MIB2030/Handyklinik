import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const priceData = [
  { hersteller: 'Apple iPad', modell: 'Apple iPad 10', reparatur: 'Akkutausch', preis: 455, beschreibung: 'Ihr iPad 10 Akkutausch lädt nicht mehr oder geht schnell leer? Wir tauschen den verschlissenen Akku gegen eine neue Hochleistungs-Batterie. Genießen Sie wieder die volle Laufzeit und Zuverlässigkeit Ihres Geräts. Inklusive fachgerechter Entsorgung des Altteils.' },
  { hersteller: 'Apple iPad', modell: 'Apple iPad 10', reparatur: 'Displaytausch', preis: 140, beschreibung: 'Professioneller Display-Austausch für Ihr iPad 10 Display Reparatur. Wir ersetzen die defekte Fronteinheit durch ein Ersatzteil in Top-Qualität. Pixelfehler, Glasbruch oder Touch-Probleme gehören damit der Vergangenheit an. Ihre Daten bleiben bei der Reparatur in der Regel erhalten.' },
  { hersteller: 'Apple iPad', modell: 'Apple iPad 10', reparatur: 'Fehlerdiagnose', preis: 35, beschreibung: 'Ausführliche Fehlerdiagnose für Ihr iPad 10 Fehlerdiagnose. Unsere Experten prüfen das Gerät auf Herz und Nieren und erstellen einen genauen Kostenvoranschlag. Die Pauschale von 35,00 € wird bei einer anschließenden Reparatur in vielen Fällen verrechnet.' },
  { hersteller: 'Apple iPhone', modell: 'Apple iPhone 11', reparatur: 'Akkutausch', preis: 110, beschreibung: 'Ihr iPhone 11 Akkutausch lädt nicht mehr oder geht schnell leer? Wir tauschen den verschlissenen Akku gegen eine neue Hochleistungs-Batterie. Genießen Sie wieder die volle Laufzeit und Zuverlässigkeit Ihres Geräts. Inklusive fachgerechter Entsorgung des Altteils.' },
  { hersteller: 'Apple iPhone', modell: 'Apple iPhone 11', reparatur: 'Drittanbieter Display', preis: 100, beschreibung: 'Professioneller Display-Austausch für Ihr iPhone 11 Display Reparatur. Wir ersetzen die defekte Fronteinheit durch ein Ersatzteil in Top-Qualität. Pixelfehler, Glasbruch oder Touch-Probleme gehören damit der Vergangenheit an. Ihre Daten bleiben bei der Reparatur in der Regel erhalten.' },
  { hersteller: 'Apple iPhone', modell: 'Apple iPhone 11', reparatur: 'Original Display', preis: 250, beschreibung: 'Professioneller Display-Austausch für Ihr iPhone 11 Display Reparatur. Wir ersetzen die defekte Fronteinheit durch ein Ersatzteil in Top-Qualität. Pixelfehler, Glasbruch oder Touch-Probleme gehören damit der Vergangenheit an. Ihre Daten bleiben bei der Reparatur in der Regel erhalten.' },
  { hersteller: 'Samsung Galaxy', modell: 'Samsung Galaxy S21', reparatur: 'Displaytausch', preis: 280, beschreibung: 'Professioneller Display-Austausch für Ihr Samsung Galaxy S21. Wir ersetzen die defekte Fronteinheit durch ein Ersatzteil in Top-Qualität.' },
  { hersteller: 'Samsung Galaxy', modell: 'Samsung Galaxy S21', reparatur: 'Akkutausch', preis: 90, beschreibung: 'Ihr Samsung Galaxy S21 Akkutausch. Wir tauschen den verschlissenen Akku gegen eine neue Hochleistungs-Batterie.' },
];

async function importTestData() {
  console.log('Clearing existing data...');
  const { error: deleteError } = await supabase
    .from('repair_prices')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Error clearing:', deleteError);
  }

  console.log('Inserting test data...');
  const { data, error } = await supabase
    .from('repair_prices')
    .insert(priceData)
    .select();

  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log(`Successfully inserted ${data?.length} test entries`);
    console.log('Test data inserted - you can now test the configurator!');
    console.log('\nTo import all 714 entries, use the SQL files in scripts/ folder via Supabase Dashboard.');
  }
}

importTestData();
