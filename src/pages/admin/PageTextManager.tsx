import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface PageText {
  id: string;
  section: string;
  key: string;
  value: string;
  description: string;
  order_index: number;
}

interface GroupedTexts {
  [section: string]: PageText[];
}

const sectionLabels: { [key: string]: string } = {
  'why_us': 'Warum Wir - Hauptsektion',
  'why_us_features': 'Warum Wir - Features',
  'why_us_card': 'Warum Wir - Detailkarte',
  'services': 'Services Sektion',
  'hero': 'Hero Bereich'
};

export default function PageTextManager() {
  const [texts, setTexts] = useState<PageText[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('page_texts')
      .select('*')
      .order('section')
      .order('order_index');

    if (error) {
      console.error('Error loading texts:', error);
    } else if (data) {
      setTexts(data);
    }
    setLoading(false);
  };

  const handleSave = async (text: PageText) => {
    setSaving(text.id);
    const { error } = await supabase
      .from('page_texts')
      .update({
        value: text.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', text.id);

    if (error) {
      console.error('Error saving text:', error);
      setMessage('Fehler beim Speichern!');
    } else {
      setMessage('Text erfolgreich gespeichert!');
      refreshPreview();
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(null);
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      const timestamp = new Date().getTime();
      iframeRef.current.src = `/?t=${timestamp}`;
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleChange = (id: string, value: string) => {
    setTexts(texts.map(text =>
      text.id === id ? { ...text, value } : text
    ));
  };

  const groupedTexts: GroupedTexts = texts.reduce((acc, text) => {
    if (!acc[text.section]) {
      acc[text.section] = [];
    }
    acc[text.section].push(text);
    return acc;
  }, {} as GroupedTexts);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Webseiten-Texte verwalten</h1>
            <p className="text-gray-600 mt-2">Bearbeiten Sie alle Textpassagen Ihrer Webseite</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshPreview}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Vorschau aktualisieren</span>
            </button>
            <button
              onClick={togglePreview}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'Vorschau ausblenden' : 'Vorschau einblenden'}</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      <div className={`flex gap-6 ${showPreview ? '' : ''}`}>
        {showPreview && (
          <div className="w-1/2 sticky top-6 self-start">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                <span className="font-semibold">Live-Vorschau</span>
                <span className="text-xs text-gray-400">Hauptseite</span>
              </div>
              <iframe
                ref={iframeRef}
                src="/"
                className="w-full h-full border-0"
                title="Website Preview"
                style={{ height: 'calc(100% - 50px)' }}
              />
            </div>
          </div>
        )}

        <div className={`space-y-8 ${showPreview ? 'w-1/2' : 'w-full'}`}>
          {Object.entries(groupedTexts).map(([section, sectionTexts]) => (
            <div key={section} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {sectionLabels[section] || section}
              </h2>

              <div className="space-y-6">
                {sectionTexts.map((text) => (
                  <div key={text.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">
                          {text.key}
                        </label>
                        {text.description && (
                          <p className="text-xs text-gray-500 mb-2">{text.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSave(text)}
                        disabled={saving === text.id}
                        className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving === text.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Speichern...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Speichern</span>
                          </>
                        )}
                      </button>
                    </div>

                    {text.value.length > 200 ? (
                      <textarea
                        value={text.value}
                        onChange={(e) => handleChange(text.id, e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        value={text.value}
                        onChange={(e) => handleChange(text.id, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {texts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Keine Texte gefunden.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
