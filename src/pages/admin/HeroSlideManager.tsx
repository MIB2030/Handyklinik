import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Image, Trash2, Plus, Upload, MoveUp, MoveDown, Settings, Clock, Type } from 'lucide-react';

interface HeroSlide {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  duration_seconds: number;
}

interface SlideshowSettings {
  id: string;
  auto_play: boolean;
  transition_duration: number;
}

interface HeroTextSettings {
  id: string;
  title_text: string;
  subtitle_text: string;
  title_font_size: string;
  subtitle_font_size: string;
  title_color: string;
  subtitle_color: string;
  title_font_weight: string;
  subtitle_font_weight: string;
  text_shadow: string;
  overlay_opacity: number;
}

export default function HeroSlideManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [settings, setSettings] = useState<SlideshowSettings | null>(null);
  const [textSettings, setTextSettings] = useState<HeroTextSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTextSettings, setShowTextSettings] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide>>({
    image_url: '',
    alt_text: '',
    is_active: true,
    duration_seconds: 5,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadSlides();
    loadSettings();
    loadTextSettings();
  }, []);

  const loadSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading slides:', error);
    } else {
      setSlides(data || []);
    }
    setLoading(false);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('hero_slideshow_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error loading settings:', error);
    } else {
      setSettings(data);
    }
  };

  const loadTextSettings = async () => {
    const { data, error } = await supabase
      .from('hero_text_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error loading text settings:', error);
    } else {
      setTextSettings(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `hero-slides/${fileName}`;

    try {
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(filePath, file);

      if (uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('hero-images')
          .getPublicUrl(filePath);

        setEditingSlide({ ...editingSlide, image_url: publicUrl });
      } else if (storageData) {
        const { data: { publicUrl } } = supabase.storage
          .from('hero-images')
          .getPublicUrl(storageData.path);

        setEditingSlide({ ...editingSlide, image_url: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSlide = async () => {
    if (!editingSlide.image_url) {
      alert('Bitte Bild-URL eingeben');
      return;
    }

    const maxOrder = Math.max(...slides.map(s => s.display_order), 0);

    const { error } = await supabase.from('hero_slides').insert({
      image_url: editingSlide.image_url,
      alt_text: editingSlide.alt_text || 'Smartphone Reparatur',
      display_order: maxOrder + 1,
      is_active: editingSlide.is_active ?? true,
      duration_seconds: editingSlide.duration_seconds || 5,
    });

    if (error) {
      console.error('Error adding slide:', error);
      alert('Fehler beim Hinzufügen des Slides');
    } else {
      setEditingSlide({ image_url: '', alt_text: '', is_active: true, duration_seconds: 5 });
      loadSlides();
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Slide wirklich löschen?')) return;

    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting slide:', error);
      alert('Fehler beim Löschen des Slides');
    } else {
      loadSlides();
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    const { error } = await supabase
      .from('hero_slides')
      .update({ is_active: !slide.is_active })
      .eq('id', slide.id);

    if (error) {
      console.error('Error updating slide:', error);
    } else {
      loadSlides();
    }
  };

  const handleUpdateDuration = async (slideId: string, newDuration: number) => {
    const duration = Math.max(1, Math.min(30, newDuration));
    const { error } = await supabase
      .from('hero_slides')
      .update({ duration_seconds: duration })
      .eq('id', slideId);

    if (error) {
      console.error('Error updating duration:', error);
    } else {
      loadSlides();
    }
  };

  const handleMoveSlide = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === slides.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherSlide = slides[newIndex];

    const updates = [
      supabase
        .from('hero_slides')
        .update({ display_order: otherSlide.display_order })
        .eq('id', slide.id),
      supabase
        .from('hero_slides')
        .update({ display_order: slide.display_order })
        .eq('id', otherSlide.id),
    ];

    await Promise.all(updates);
    loadSlides();
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    const { error } = await supabase
      .from('hero_slideshow_settings')
      .update({
        auto_play: settings.auto_play,
        transition_duration: settings.transition_duration,
      })
      .eq('id', settings.id);

    if (error) {
      console.error('Error updating settings:', error);
      alert('Fehler beim Speichern der Einstellungen');
    } else {
      alert('Einstellungen gespeichert');
      setShowSettings(false);
    }
  };

  const handleUpdateTextSettings = async () => {
    if (!textSettings) return;

    const { error } = await supabase
      .from('hero_text_settings')
      .update({
        title_text: textSettings.title_text,
        subtitle_text: textSettings.subtitle_text,
        title_font_size: textSettings.title_font_size,
        subtitle_font_size: textSettings.subtitle_font_size,
        title_color: textSettings.title_color,
        subtitle_color: textSettings.subtitle_color,
        title_font_weight: textSettings.title_font_weight,
        subtitle_font_weight: textSettings.subtitle_font_weight,
        text_shadow: textSettings.text_shadow,
        overlay_opacity: textSettings.overlay_opacity,
      })
      .eq('id', textSettings.id);

    if (error) {
      console.error('Error updating text settings:', error);
      alert('Fehler beim Speichern der Text-Einstellungen');
    } else {
      alert('Text-Einstellungen gespeichert');
      setShowTextSettings(false);
    }
  };

  if (loading) {
    return <div className="p-8">Lädt...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hero Slideshow</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTextSettings(!showTextSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Type className="w-5 h-5" />
            Text & Design
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Settings className="w-5 h-5" />
            Slideshow
          </button>
        </div>
      </div>

      {showTextSettings && textSettings && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Text & Design Einstellungen</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Textinhalt</h3>
                <div>
                  <label className="block font-medium mb-2">Haupttitel:</label>
                  <input
                    type="text"
                    value={textSettings.title_text}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, title_text: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Untertitel:</label>
                  <textarea
                    value={textSettings.subtitle_text}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, subtitle_text: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Farben</h3>
                <div>
                  <label className="block font-medium mb-2">Titelfarbe:</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textSettings.title_color}
                      onChange={(e) =>
                        setTextSettings({ ...textSettings, title_color: e.target.value })
                      }
                      className="w-16 h-10 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textSettings.title_color}
                      onChange={(e) =>
                        setTextSettings({ ...textSettings, title_color: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2">Untertitelfarbe:</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textSettings.subtitle_color}
                      onChange={(e) =>
                        setTextSettings({ ...textSettings, subtitle_color: e.target.value })
                      }
                      className="w-16 h-10 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textSettings.subtitle_color}
                      onChange={(e) =>
                        setTextSettings({ ...textSettings, subtitle_color: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Schriftgröße</h3>
                <div>
                  <label className="block font-medium mb-2">Titelgröße:</label>
                  <select
                    value={textSettings.title_font_size}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, title_font_size: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="text-2xl sm:text-3xl md:text-5xl">Klein</option>
                    <option value="text-3xl sm:text-4xl md:text-6xl">Mittel</option>
                    <option value="text-4xl sm:text-5xl md:text-7xl">Groß</option>
                    <option value="text-5xl sm:text-6xl md:text-8xl">Sehr Groß</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Untertitelgröße:</label>
                  <select
                    value={textSettings.subtitle_font_size}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, subtitle_font_size: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="text-base sm:text-lg md:text-xl">Klein</option>
                    <option value="text-lg sm:text-xl md:text-2xl">Mittel</option>
                    <option value="text-xl sm:text-2xl md:text-3xl">Groß</option>
                    <option value="text-2xl sm:text-3xl md:text-4xl">Sehr Groß</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Schriftstärke</h3>
                <div>
                  <label className="block font-medium mb-2">Titel Schriftstärke:</label>
                  <select
                    value={textSettings.title_font_weight}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, title_font_weight: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="font-light">Leicht</option>
                    <option value="font-normal">Normal</option>
                    <option value="font-medium">Medium</option>
                    <option value="font-semibold">Halbbold</option>
                    <option value="font-bold">Bold</option>
                    <option value="font-extrabold">Extra Bold</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Untertitel Schriftstärke:</label>
                  <select
                    value={textSettings.subtitle_font_weight}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, subtitle_font_weight: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="font-light">Leicht</option>
                    <option value="font-normal">Normal</option>
                    <option value="font-medium">Medium</option>
                    <option value="font-semibold">Halbbold</option>
                    <option value="font-bold">Bold</option>
                    <option value="font-extrabold">Extra Bold</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Effekte</h3>
                <div>
                  <label className="block font-medium mb-2">Textschatten:</label>
                  <select
                    value={textSettings.text_shadow}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, text_shadow: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Kein Schatten</option>
                    <option value="drop-shadow">Leicht</option>
                    <option value="drop-shadow-lg">Mittel</option>
                    <option value="drop-shadow-xl">Stark</option>
                    <option value="drop-shadow-2xl">Sehr Stark</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">
                    Overlay-Dunkelheit: {textSettings.overlay_opacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={textSettings.overlay_opacity}
                    onChange={(e) =>
                      setTextSettings({
                        ...textSettings,
                        overlay_opacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Dunkles Overlay über dem Bild für bessere Lesbarkeit
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleUpdateTextSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Text-Einstellungen speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && settings && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Slideshow Einstellungen</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_play"
                checked={settings.auto_play}
                onChange={(e) =>
                  setSettings({ ...settings, auto_play: e.target.checked })
                }
                className="w-5 h-5"
              />
              <label htmlFor="auto_play" className="font-medium">
                Automatischer Wechsel aktiviert
              </label>
            </div>
            <div>
              <label className="block font-medium mb-2">
                Wechselzeit (Sekunden):
              </label>
              <input
                type="number"
                min="3"
                max="60"
                value={settings.transition_duration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    transition_duration: parseInt(e.target.value) || 20,
                  })
                }
                className="w-32 px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={handleUpdateSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Einstellungen speichern
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Neues Slide hinzufügen</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Bild-URL:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingSlide.image_url || ''}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, image_url: e.target.value })
                }
                placeholder="/pfad/zum/bild.jpg"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <label className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {uploadingImage ? 'Lädt...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">Alt-Text:</label>
            <input
              type="text"
              value={editingSlide.alt_text || ''}
              onChange={(e) =>
                setEditingSlide({ ...editingSlide, alt_text: e.target.value })
              }
              placeholder="Smartphone Reparatur"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Anzeigedauer (Sekunden):
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={editingSlide.duration_seconds || 5}
              onChange={(e) =>
                setEditingSlide({ ...editingSlide, duration_seconds: parseInt(e.target.value) || 5 })
              }
              className="w-32 px-3 py-2 border rounded-lg"
            />
            <p className="text-sm text-gray-600 mt-1">
              Wie lange soll dieses Slide angezeigt werden? (1-30 Sekunden)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={editingSlide.is_active ?? true}
              onChange={(e) =>
                setEditingSlide({ ...editingSlide, is_active: e.target.checked })
              }
              className="w-5 h-5"
            />
            <label htmlFor="is_active" className="font-medium">
              Aktiv
            </label>
          </div>
          <button
            onClick={handleAddSlide}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Slide hinzufügen
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vorschau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Alt-Text
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Dauer (Sek.)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reihenfolge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {slides.map((slide, index) => (
              <tr key={slide.id}>
                <td className="px-6 py-4">
                  {slide.image_url ? (
                    <img
                      src={slide.image_url}
                      alt={slide.alt_text}
                      className="w-32 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">{slide.alt_text}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={slide.duration_seconds}
                    onChange={(e) => handleUpdateDuration(slide.id, parseInt(e.target.value) || 5)}
                    className="w-20 px-2 py-1 border rounded text-center"
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      slide.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {slide.is_active ? 'Aktiv' : 'Inaktiv'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveSlide(slide, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <MoveUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMoveSlide(slide, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <MoveDown className="w-5 h-5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
