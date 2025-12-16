import { useEffect, useState } from 'react';
import { Upload, Plus, Edit2, Trash2, Search, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

interface RepairPrice {
  id: string;
  hersteller: string;
  modell: string;
  reparatur: string;
  preis: number;
  beschreibung: string | null;
}

export default function PriceManager() {
  const [prices, setPrices] = useState<RepairPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<RepairPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RepairPrice>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrice, setNewPrice] = useState<Omit<RepairPrice, 'id'>>({
    hersteller: '',
    modell: '',
    reparatur: '',
    preis: 0,
    beschreibung: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPrices();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = prices.filter(p =>
        p.hersteller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.modell.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reparatur.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPrices(filtered);
    } else {
      setFilteredPrices(prices);
    }
  }, [searchTerm, prices]);

  const loadPrices = async () => {
    const { data, error } = await supabase
      .from('repair_prices')
      .select('*')
      .order('hersteller')
      .order('modell');

    if (!error && data) {
      setPrices(data);
      setFilteredPrices(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('Excel-Datei wird importiert...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map((row: any) => ({
        hersteller: row['Hersteller'] || row['hersteller'] || '',
        modell: row['Modell'] || row['modell'] || '',
        reparatur: row['Reparaturtyp'] || row['Reparatur'] || row['reparatur'] || '',
        preis: parseFloat(row['Preis'] || row['preis'] || 0),
        beschreibung: row['Beschreibung'] || row['beschreibung'] || '',
      }));

      const { error } = await supabase
        .from('repair_prices')
        .upsert(formattedData);

      if (error) throw error;

      setMessage(`${formattedData.length} Preise erfolgreich importiert`);
      loadPrices();
    } catch (error) {
      setMessage('Fehler beim Import der Excel-Datei');
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const startEdit = (price: RepairPrice) => {
    setEditingId(price.id);
    setEditForm(price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('repair_prices')
      .update(editForm)
      .eq('id', editingId);

    if (!error) {
      setMessage('Erfolgreich gespeichert');
      loadPrices();
      cancelEdit();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deletePrice = async (id: string) => {
    if (!confirm('Möchten Sie diesen Preis wirklich löschen?')) return;

    const { error } = await supabase
      .from('repair_prices')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessage('Erfolgreich gelöscht');
      loadPrices();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addNewPrice = async () => {
    if (!newPrice.hersteller || !newPrice.modell || !newPrice.reparatur || !newPrice.preis) {
      setMessage('Bitte alle Pflichtfelder ausfüllen');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const { error } = await supabase
      .from('repair_prices')
      .insert([newPrice]);

    if (!error) {
      setMessage('Erfolgreich hinzugefügt');
      setShowAddForm(false);
      setNewPrice({
        hersteller: '',
        modell: '',
        reparatur: '',
        preis: 0,
        beschreibung: ''
      });
      loadPrices();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Fehler beim Hinzufügen');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Artikel verwalten</h1>
        <p className="text-gray-600 mt-2">Verwalten Sie Ihre Reparaturpreise</p>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Suche nach Hersteller, Modell oder Reparaturtyp..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Neuer Artikel</span>
          </button>
          <label className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <Upload className="h-5 w-5" />
            <span>Excel importieren</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Neuen Artikel hinzufügen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hersteller *</label>
              <input
                type="text"
                value={newPrice.hersteller}
                onChange={(e) => setNewPrice({...newPrice, hersteller: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Apple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modell *</label>
              <input
                type="text"
                value={newPrice.modell}
                onChange={(e) => setNewPrice({...newPrice, modell: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. iPhone 13"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reparaturtyp *</label>
              <input
                type="text"
                value={newPrice.reparatur}
                onChange={(e) => setNewPrice({...newPrice, reparatur: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Display"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preis (€) *</label>
              <input
                type="number"
                step="0.01"
                value={newPrice.preis}
                onChange={(e) => setNewPrice({...newPrice, preis: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
              <input
                type="text"
                value={newPrice.beschreibung || ''}
                onChange={(e) => setNewPrice({...newPrice, beschreibung: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional: Zusätzliche Informationen"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={addNewPrice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hersteller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modell</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reparaturtyp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.map((price) => (
                <tr key={price.id}>
                  {editingId === price.id ? (
                    <>
                      <td className="px-6 py-4"><input value={editForm.hersteller} onChange={(e) => setEditForm({...editForm, hersteller: e.target.value})} className="w-full px-2 py-1 border rounded" /></td>
                      <td className="px-6 py-4"><input value={editForm.modell} onChange={(e) => setEditForm({...editForm, modell: e.target.value})} className="w-full px-2 py-1 border rounded" /></td>
                      <td className="px-6 py-4"><input value={editForm.reparatur} onChange={(e) => setEditForm({...editForm, reparatur: e.target.value})} className="w-full px-2 py-1 border rounded" /></td>
                      <td className="px-6 py-4"><input type="number" step="0.01" value={editForm.preis} onChange={(e) => setEditForm({...editForm, preis: parseFloat(e.target.value)})} className="w-full px-2 py-1 border rounded" /></td>
                      <td className="px-6 py-4"><input value={editForm.beschreibung || ''} onChange={(e) => setEditForm({...editForm, beschreibung: e.target.value})} className="w-full px-2 py-1 border rounded" /></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={saveEdit} className="text-green-600 hover:text-green-900 mr-3">Speichern</button>
                        <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-900">Abbrechen</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-900">{price.hersteller}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{price.modell}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{price.reparatur}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{price.preis.toFixed(2)} €</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{price.beschreibung || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button onClick={() => startEdit(price)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 className="h-4 w-4 inline" /></button>
                        <button onClick={() => deletePrice(price.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4 inline" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Zeige {filteredPrices.length} von {prices.length} Preisen
      </div>
    </div>
  );
}
