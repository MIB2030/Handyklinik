import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Sun, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VacationMode {
  id: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  message: string;
  show_banner: boolean;
  created_at: string;
  updated_at: string;
}

export default function VacationModeManager() {
  const [vacationMode, setVacationMode] = useState<VacationMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    is_active: false,
    start_date: '',
    end_date: '',
    message: '🏖️ Unsere Handyklinik ist im Urlaub! Unser Handyshop ist weiterhin normal geöffnet.',
    show_banner: true
  });

  useEffect(() => {
    loadVacationMode();
  }, []);

  const loadVacationMode = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_mode')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVacationMode(data);
        setFormData({
          is_active: data.is_active,
          start_date: data.start_date,
          end_date: data.end_date,
          message: data.message,
          show_banner: data.show_banner
        });
      }
    } catch (error) {
      console.error('Error loading vacation mode:', error);
      setMessage('Fehler beim Laden der Urlaubs-Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      if (!formData.start_date || !formData.end_date) {
        throw new Error('Bitte Start- und Enddatum ausfüllen');
      }

      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        throw new Error('Startdatum muss vor dem Enddatum liegen');
      }

      if (vacationMode) {
        const { error } = await supabase
          .from('vacation_mode')
          .update({
            is_active: formData.is_active,
            start_date: formData.start_date,
            end_date: formData.end_date,
            message: formData.message,
            show_banner: formData.show_banner
          })
          .eq('id', vacationMode.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vacation_mode')
          .insert([{
            is_active: formData.is_active,
            start_date: formData.start_date,
            end_date: formData.end_date,
            message: formData.message,
            show_banner: formData.show_banner
          }]);

        if (error) throw error;
      }

      setMessage('✅ Urlaubs-Einstellungen erfolgreich gespeichert!');
      await loadVacationMode();
    } catch (error: any) {
      console.error('Error saving vacation mode:', error);
      setMessage(`❌ Fehler: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Lade Urlaubs-Einstellungen...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Urlaubs-Modus</h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Urlaubszeiten und Benachrichtigungen für Kunden
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Wichtige Hinweise:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kunden können während des Urlaubs weiterhin Anfragen senden</li>
              <li>Der Banner wird auf allen Seiten angezeigt (wenn aktiviert)</li>
              <li>Die Nachricht sollte erwähnen, dass der Handyshop geöffnet bleibt</li>
              <li>Formulare zeigen automatisch einen Hinweis auf die Urlaubszeit</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b">
            <div className="flex-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    Urlaubs-Modus {formData.is_active ? 'AKTIV' : 'INAKTIV'}
                  </span>
                  <p className="text-sm text-gray-600">
                    {formData.is_active
                      ? '🏖️ Urlaubs-Banner wird auf der Website angezeigt'
                      : 'Banner ist derzeit ausgeblendet'
                    }
                  </p>
                </div>
              </label>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              formData.is_active
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {formData.is_active ? 'IM URLAUB' : 'NORMAL GEÖFFNET'}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Urlaub von (Startdatum)
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Urlaub bis (Enddatum)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nachricht für Kunden
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. 🏖️ Unsere Handyklinik ist vom 15.12. bis 06.01. im Urlaub! Unser Handyshop ist weiterhin normal geöffnet."
              required
            />
            <p className="text-sm text-gray-600 mt-2">
              💡 Tipp: Verwenden Sie Emojis wie 🏖️ ☀️ 🌴 für mehr Aufmerksamkeit
            </p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_banner}
                onChange={(e) => setFormData({ ...formData, show_banner: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Banner auf der Website anzeigen
              </span>
            </label>
          </div>

          {formData.is_active && formData.show_banner && formData.message && (
            <div className="border-t pt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Vorschau:</p>
              <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <Sun className="w-6 h-6 flex-shrink-0 animate-pulse" />
                  <p className="font-semibold">{formData.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Speichere...' : 'Einstellungen speichern'}
            </button>

            {message && (
              <p className={`text-sm font-semibold ${
                message.includes('✅') ? 'text-green-600' : 'text-red-600'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {vacationMode && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>Zuletzt aktualisiert: {new Date(vacationMode.updated_at).toLocaleString('de-DE')}</p>
        </div>
      )}
    </div>
  );
}