import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, AlertCircle, X, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  message: string;
  color: 'red' | 'blue' | 'green' | 'orange' | 'yellow';
  content_type: 'text' | 'html';
  html_content?: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

const colorOptions = [
  { value: 'red', label: 'Rot (Wichtig/Warnung)', bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-200' },
  { value: 'blue', label: 'Blau (Information)', bgClass: 'bg-blue-100', textClass: 'text-blue-800', borderClass: 'border-blue-200' },
  { value: 'green', label: 'Grün (Erfolg/Positiv)', bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-200' },
  { value: 'orange', label: 'Orange (Aufmerksamkeit)', bgClass: 'bg-orange-100', textClass: 'text-orange-800', borderClass: 'border-orange-200' },
  { value: 'yellow', label: 'Gelb (Hinweis)', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', borderClass: 'border-yellow-200' }
];

const popupColorClasses = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    title: 'text-red-800',
    button: 'bg-red-600 hover:bg-red-700'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    title: 'text-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    title: 'text-green-800',
    button: 'bg-green-600 hover:bg-green-700'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    title: 'text-orange-800',
    button: 'bg-orange-600 hover:bg-orange-700'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    title: 'text-yellow-800',
    button: 'bg-yellow-600 hover:bg-yellow-700'
  }
};

export default function PopManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    color: 'blue' as Announcement['color'],
    content_type: 'text' as 'text' | 'html',
    html_content: '',
    is_active: true,
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      setError('Fehler beim Laden der Ankündigungen');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        setSuccessMessage('Änderungen wurden gespeichert und sind sofort für Endkunden sichtbar!');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([formData]);

        if (error) throw error;
        setSuccessMessage('Pop-up wurde erstellt und ist sofort für Endkunden sichtbar!');
      }

      setFormData({
        title: '',
        message: '',
        color: 'blue',
        content_type: 'text',
        html_content: '',
        is_active: true,
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      });
      setEditingId(null);
      loadAnnouncements();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Fehler beim Speichern der Ankündigung');
      console.error(err);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      color: announcement.color,
      content_type: announcement.content_type,
      html_content: announcement.html_content || '',
      is_active: announcement.is_active,
      start_date: new Date(announcement.start_date).toISOString().slice(0, 16),
      end_date: new Date(announcement.end_date).toISOString().slice(0, 16)
    });
    setEditingId(announcement.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Ankündigung wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAnnouncements();
    } catch (err) {
      setError('Fehler beim Löschen der Ankündigung');
      console.error(err);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      const newStatus = !currentStatus;
      setSuccessMessage(
        newStatus
          ? 'Pop-up wurde aktiviert und ist jetzt für Endkunden sichtbar!'
          : 'Pop-up wurde deaktiviert und ist nicht mehr für Endkunden sichtbar!'
      );

      loadAnnouncements();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Fehler beim Aktualisieren des Status');
      console.error(err);
    }
  };

  const getColorClasses = (color: string) => {
    const option = colorOptions.find(opt => opt.value === color);
    return option || colorOptions[1];
  };

  const isActive = (announcement: Announcement) => {
    if (!announcement.is_active) return false;
    const now = new Date();
    const start = new Date(announcement.start_date);
    const end = new Date(announcement.end_date);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pop-up Ankündigungen</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {editingId ? 'Ankündigung bearbeiten' : 'Neue Ankündigung'}
            </h2>
            <p className="text-sm text-gray-600">
              Änderungen werden sofort für alle Endkunden wirksam. Deaktivierte Pop-ups werden nicht mehr angezeigt.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inhaltstyp *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="content_type"
                  value="text"
                  checked={formData.content_type === 'text'}
                  onChange={(e) => setFormData({ ...formData, content_type: 'text' })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Kurzer Text</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="content_type"
                  value="html"
                  checked={formData.content_type === 'html'}
                  onChange={(e) => setFormData({ ...formData, content_type: 'html' })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">HTML-Code (Vollbild)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.content_type === 'text'
                ? 'Einfaches Text-Popup mit Titel und Nachricht'
                : 'Vollständige HTML-Seite im Popup (z.B. Stellenanzeige)'}
            </p>
          </div>

          {formData.content_type === 'text' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Wichtige Ankündigung"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachricht *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required={formData.content_type === 'text'}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ihre Ankündigungsnachricht..."
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML-Code *
              </label>
              <textarea
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                required={formData.content_type === 'html'}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <title>Ihre Seite</title>&#10;</head>&#10;<body>&#10;  ...&#10;</body>&#10;</html>"
              />
              <p className="text-xs text-gray-500 mt-1">
                Vollständiger HTML-Code inkl. &lt;html&gt;, &lt;head&gt; und &lt;body&gt; Tags
              </p>
            </div>
          )}

          {formData.content_type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farbe *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {colorOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.color === option.value
                        ? `${option.borderClass} ${option.bgClass}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={option.value}
                      checked={formData.color === option.value}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value as Announcement['color'] })}
                      className="w-4 h-4"
                    />
                    <span className={`font-medium ${formData.color === option.value ? option.textClass : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startdatum *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enddatum *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                Pop-up für Endkunden aktivieren
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-2 ml-7">
              {formData.is_active
                ? 'Das Pop-up wird Endkunden im angegebenen Zeitraum angezeigt'
                : 'Das Pop-up ist deaktiviert und wird Endkunden nicht angezeigt'}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
            >
              {editingId ? (
                <>
                  <Pencil className="w-5 h-5" />
                  Änderungen speichern
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Pop-up erstellen
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    title: '',
                    message: '',
                    color: 'blue',
                    content_type: 'text',
                    html_content: '',
                    is_active: true,
                    start_date: new Date().toISOString().slice(0, 16),
                    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                  });
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            )}
          </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Live-Vorschau</h2>
            <p className="text-sm text-gray-600">
              So wird das Pop-up für Endkunden angezeigt
            </p>
          </div>

          <div className="relative bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            {formData.content_type === 'html' && formData.html_content ? (
              <div className="relative w-full h-[500px]">
                <div className="absolute top-2 right-2 z-10">
                  <button
                    type="button"
                    className="p-2 rounded-full bg-red-600 text-white shadow-lg"
                    disabled
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <iframe
                  srcDoc={formData.html_content}
                  className="w-full h-full border-2 border-gray-300 rounded-lg"
                  title="HTML Vorschau"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              </div>
            ) : formData.content_type === 'text' && formData.message ? (
              <div className="relative w-full max-w-md">
                <div
                  className={`relative ${popupColorClasses[formData.color].bg} ${popupColorClasses[formData.color].border} border-2 rounded-2xl shadow-2xl p-6 md:p-8`}
                >
                  <button
                    type="button"
                    className={`absolute top-4 right-4 p-2 rounded-full ${popupColorClasses[formData.color].button} text-white transition-all hover:scale-110`}
                    disabled
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="pr-10">
                    {formData.title && (
                      <h2
                        className={`text-2xl md:text-3xl font-bold ${popupColorClasses[formData.color].title} mb-4`}
                      >
                        {formData.title}
                      </h2>
                    )}

                    <p
                      className={`text-base md:text-lg ${popupColorClasses[formData.color].text} whitespace-pre-wrap leading-relaxed`}
                    >
                      {formData.message}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className={`px-6 py-3 ${popupColorClasses[formData.color].button} text-white font-semibold rounded-lg transition-all hover:scale-105`}
                      disabled
                    >
                      Verstanden
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {formData.content_type === 'text'
                    ? 'Geben Sie eine Nachricht ein, um die Vorschau zu sehen'
                    : 'Geben Sie HTML-Code ein, um die Vorschau zu sehen'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>• Die Vorschau zeigt das exakte Design des Popups</p>
            <p>• Buttons in der Vorschau sind deaktiviert</p>
            {formData.content_type === 'html' ? (
              <p>• HTML-Popups werden im Vollbild angezeigt</p>
            ) : (
              <p>• Das echte Popup wird mittig auf dem Bildschirm angezeigt</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Alle Ankündigungen</h2>
        </div>

        {announcements.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Keine Ankündigungen vorhanden. Erstellen Sie die erste Ankündigung oben.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => {
              const colorClasses = getColorClasses(announcement.color);
              const active = isActive(announcement);

              return (
                <div key={announcement.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        {announcement.content_type === 'text' && announcement.title && (
                          <h3 className="text-lg font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                        )}
                        {announcement.content_type === 'html' && (
                          <h3 className="text-lg font-semibold text-gray-900">
                            HTML Pop-up
                          </h3>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          announcement.content_type === 'html'
                            ? 'bg-purple-100 text-purple-800'
                            : `${colorClasses.bgClass} ${colorClasses.textClass}`
                        }`}>
                          {announcement.content_type === 'html'
                            ? 'HTML (Vollbild)'
                            : colorOptions.find(opt => opt.value === announcement.color)?.label.split(' ')[0]}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>

                      {announcement.content_type === 'text' ? (
                        <p className="text-gray-700 whitespace-pre-wrap">{announcement.message}</p>
                      ) : (
                        <p className="text-gray-600 text-sm italic">HTML-Code ({announcement.html_content?.length || 0} Zeichen)</p>
                      )}

                      <div className="text-sm text-gray-500 space-y-1">
                        <div>
                          Von: {new Date(announcement.start_date).toLocaleString('de-DE')}
                          {' '} Bis: {new Date(announcement.end_date).toLocaleString('de-DE')}
                        </div>
                      </div>

                      {announcement.content_type === 'text' ? (
                        <div className={`mt-3 p-4 rounded-lg border-2 ${colorClasses.bgClass} ${colorClasses.borderClass}`}>
                          <p className="text-sm text-gray-600 mb-2">Vorschau:</p>
                          {announcement.title && (
                            <h4 className={`text-lg font-bold mb-2 ${colorClasses.textClass}`}>
                              {announcement.title}
                            </h4>
                          )}
                          <p className={`${colorClasses.textClass}`}>{announcement.message}</p>
                        </div>
                      ) : (
                        <div className="mt-3 p-4 rounded-lg border-2 bg-gray-50 border-gray-300">
                          <p className="text-sm text-gray-600 mb-2">HTML Vorschau:</p>
                          <div className="bg-white border border-gray-300 rounded p-2 max-h-40 overflow-auto">
                            <code className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                              {announcement.html_content?.substring(0, 200)}
                              {(announcement.html_content?.length || 0) > 200 && '...'}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleActive(announcement.id, announcement.is_active)}
                        className={`px-4 py-2 rounded-lg transition-all font-medium text-sm flex items-center gap-2 ${
                          announcement.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        title={announcement.is_active ? 'Für Endkunden deaktivieren' : 'Für Endkunden aktivieren'}
                      >
                        {announcement.is_active ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Aktiv</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span className="hidden sm:inline">Inaktiv</span>
                          </>
                        )}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewAnnouncement(announcement)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Vorschau"
                        >
                          <Play className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleEdit(announcement)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Bearbeiten"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
          {previewAnnouncement.content_type === 'html' && previewAnnouncement.html_content ? (
            <div
              className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
              role="dialog"
              aria-label="Vorschau"
            >
              <button
                onClick={() => setPreviewAnnouncement(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-110 shadow-lg"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>

              <iframe
                srcDoc={previewAnnouncement.html_content}
                className="w-full h-full border-0"
                title="Vorschau"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          ) : (
            <div
              className={`relative w-full max-w-lg ${popupColorClasses[previewAnnouncement.color].bg} ${popupColorClasses[previewAnnouncement.color].border} border-2 rounded-2xl shadow-2xl p-6 md:p-8 animate-slideUp`}
              role="dialog"
              aria-labelledby="preview-title"
              aria-describedby="preview-message"
            >
              <button
                onClick={() => setPreviewAnnouncement(null)}
                className={`absolute top-4 right-4 p-2 rounded-full ${popupColorClasses[previewAnnouncement.color].button} text-white transition-all hover:scale-110`}
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-10">
                {previewAnnouncement.title && (
                  <h2
                    id="preview-title"
                    className={`text-2xl md:text-3xl font-bold ${popupColorClasses[previewAnnouncement.color].title} mb-4`}
                  >
                    {previewAnnouncement.title}
                  </h2>
                )}

                <p
                  id="preview-message"
                  className={`text-base md:text-lg ${popupColorClasses[previewAnnouncement.color].text} whitespace-pre-wrap leading-relaxed`}
                >
                  {previewAnnouncement.message}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setPreviewAnnouncement(null)}
                  className={`px-6 py-3 ${popupColorClasses[previewAnnouncement.color].button} text-white font-semibold rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
                >
                  Verstanden
                </button>
              </div>
            </div>
          )}

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }

            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }

            .animate-slideUp {
              animation: slideUp 0.4s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
