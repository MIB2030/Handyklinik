import { useState, useEffect } from 'react';
import { Save, Key, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

interface GoogleSettings {
  id: string;
  api_key: string | null;
  place_id: string | null;
  auto_sync_enabled: boolean;
  last_sync_at: string | null;
}

export default function GoogleSettingsManager() {
  const [settings, setSettings] = useState<GoogleSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('google_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setApiKey(data.api_key || '');
        setPlaceId(data.place_id || '');
        setAutoSync(data.auto_sync_enabled || false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Fehler beim Laden der Einstellungen' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('google_settings')
        .upsert({
          id: SETTINGS_ID,
          api_key: apiKey.trim() || null,
          place_id: placeId.trim() || null,
          auto_sync_enabled: autoSync,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Einstellungen erfolgreich gespeichert!' });
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">So richten Sie Google Reviews ein:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Besuchen Sie die <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
              <li>Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes aus</li>
              <li>Aktivieren Sie die "Places API" für Ihr Projekt</li>
              <li>Erstellen Sie einen API-Schlüssel unter "APIs & Dienste" → "Anmeldedaten"</li>
              <li>Finden Sie Ihre Place ID über die <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="underline font-medium">Place ID Finder</a></li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Google API Einstellungen</h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4 mr-2" />
              Google Places API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="••••••••••••••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">
              Ihr API-Schlüssel aus der Google Cloud Console
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              Google Place ID
            </label>
            <input
              type="password"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="••••••••••••••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">
              Die eindeutige ID Ihres Google Business Profils
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Automatische Synchronisierung</p>
                <p className="text-xs text-gray-500">Reviews automatisch alle 24 Stunden abrufen</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings?.last_sync_at && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Letzte Synchronisierung: {new Date(settings.last_sync_at).toLocaleString('de-DE')}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Speichern...' : 'Einstellungen speichern'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
