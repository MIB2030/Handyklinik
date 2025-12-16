import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LegalConfig {
  id: string;
  api_url: string;
  api_token: string;
  shop_id: string;
  enabled: boolean;
  updated_at: string;
}

export default function LegalConfigManager() {
  const [config, setConfig] = useState<LegalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [formData, setFormData] = useState({
    api_url: '',
    api_token: '',
    shop_id: '',
    enabled: false,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('legal_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (err) throw err;

      if (data) {
        setConfig(data);
        setFormData({
          api_url: data.api_url,
          api_token: data.api_token,
          shop_id: data.shop_id,
          enabled: data.enabled,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Konfiguration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSuccess('');
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.api_url || !formData.api_token || !formData.shop_id) {
      setError('Bitte füllen Sie alle erforderlichen Felder aus');
      return;
    }

    try {
      setSaving(true);

      if (config) {
        const { error: err } = await supabase
          .from('legal_config')
          .update({
            api_url: formData.api_url,
            api_token: formData.api_token,
            shop_id: formData.shop_id,
            enabled: formData.enabled,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);

        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('legal_config')
          .insert([{
            api_url: formData.api_url,
            api_token: formData.api_token,
            shop_id: formData.shop_id,
            enabled: formData.enabled,
          }]);

        if (err) throw err;
      }

      setSuccess('Konfiguration erfolgreich gespeichert');
      loadConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">IT-Recht Kanzlei API Konfiguration</h1>
        <p className="mt-2 text-gray-600">
          Verwalten Sie die Verbindung zur IT-Recht Kanzlei für automatische Rechtstext-Updates
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Wie Sie die Zugangsdaten erhalten:</p>
            <ol className="mt-2 space-y-1 ml-4 list-decimal">
              <li>Melden Sie sich im IT-Recht Kanzlei Mandantenportal an</li>
              <li>Navigieren Sie zu: Einstellungen → Schnittstellen → API-Zugang</li>
              <li>Aktivieren Sie die API und kopieren Sie API-URL, Token und Shop-ID</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label htmlFor="api_url" className="block text-sm font-medium text-gray-700 mb-2">
            API-URL
          </label>
          <input
            type="text"
            id="api_url"
            name="api_url"
            value={formData.api_url}
            onChange={handleChange}
            placeholder="https://www.it-recht-kanzlei.de/api/v1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">Standard: https://www.it-recht-kanzlei.de/api/v1</p>
        </div>

        <div>
          <label htmlFor="shop_id" className="block text-sm font-medium text-gray-700 mb-2">
            Shop-ID / Mandanten-Nummer
          </label>
          <input
            type="text"
            id="shop_id"
            name="shop_id"
            value={formData.shop_id}
            onChange={handleChange}
            placeholder="z.B. 12345"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="api_token" className="block text-sm font-medium text-gray-700 mb-2">
            API-Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              id="api_token"
              name="api_token"
              value={formData.api_token}
              onChange={handleChange}
              placeholder="Ihr API-Token..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            API aktivieren
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {saving ? 'Speichern...' : 'Konfiguration speichern'}
        </button>
      </form>

      {config && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>Zuletzt aktualisiert: {new Date(config.updated_at).toLocaleString('de-DE')}</p>
        </div>
      )}
    </div>
  );
}
