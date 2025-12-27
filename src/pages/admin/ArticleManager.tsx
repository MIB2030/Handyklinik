import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, Save, X, FileText, Search, Filter } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: string;
  status: 'draft' | 'published';
  author_id: string;
  price: number | null;
  meta_title: string;
  meta_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: string;
  status: 'draft' | 'published';
  price: string;
  meta_title: string;
  meta_description: string;
  manufacturer: string;
}

const categories = [
  { value: 'blog', label: 'Blog' },
  { value: 'news', label: 'News' },
  { value: 'produkt', label: 'Produkt' },
  { value: 'ratgeber', label: 'Ratgeber' },
  { value: 'service', label: 'Service' },
];

export default function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<ArticleFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filteredManufacturers, setFilteredManufacturers] = useState<string[]>([]);
  const [showManufacturerDropdown, setShowManufacturerDropdown] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: '',
    category: 'blog',
    status: 'draft',
    price: '',
    meta_title: '',
    meta_description: '',
    manufacturer: '',
  });

  useEffect(() => {
    loadArticles();
    loadManufacturers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [articles, searchTerm, filterCategory, filterStatus, filterPrice]);

  useEffect(() => {
    if (formData.manufacturer) {
      const filtered = manufacturers.filter(m =>
        m.toLowerCase().includes(formData.manufacturer.toLowerCase())
      );
      setFilteredManufacturers(filtered);
    } else {
      setFilteredManufacturers(manufacturers);
    }
  }, [formData.manufacturer, manufacturers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.manufacturer-autocomplete')) {
        setShowManufacturerDropdown(false);
      }
    };

    if (showManufacturerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showManufacturerDropdown]);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Artikel:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadManufacturers = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_prices')
        .select('hersteller')
        .order('hersteller');

      if (error) throw error;

      const uniqueManufacturers = Array.from(
        new Set((data || []).map(item => item.hersteller).filter(Boolean))
      ).sort();

      setManufacturers(uniqueManufacturers);
      setFilteredManufacturers(uniqueManufacturers);
    } catch (error) {
      console.error('Fehler beim Laden der Hersteller:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...articles];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(search) ||
        article.excerpt.toLowerCase().includes(search) ||
        article.slug.toLowerCase().includes(search)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(article => article.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(article => article.status === filterStatus);
    }

    if (filterPrice !== 'all') {
      if (filterPrice === 'with_price') {
        filtered = filtered.filter(article => article.price !== null && article.price > 0);
      } else if (filterPrice === 'without_price') {
        filtered = filtered.filter(article => article.price === null || article.price === 0);
      }
    }

    setFilteredArticles(filtered);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
      meta_title: formData.meta_title || title,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Sie sind nicht angemeldet. Bitte melden Sie sich an.');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile || profile.role !== 'admin') {
        alert('Sie haben keine Berechtigung, Artikel zu erstellen oder zu bearbeiten.');
        return;
      }

      const articleData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        image_url: formData.image_url,
        category: formData.category,
        status: formData.status,
        author_id: user.id,
        price: formData.price ? parseFloat(formData.price) : null,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        manufacturer: formData.manufacturer || null,
        published_at: formData.status === 'published'
          ? (editingArticle?.published_at || new Date().toISOString())
          : null,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) {
          console.error('Update Fehler:', error);
          alert(`Fehler beim Aktualisieren: ${error.message}`);
          return;
        }
        alert('Artikel erfolgreich aktualisiert!');
      } else {
        const { data, error } = await supabase
          .from('articles')
          .insert([articleData])
          .select();

        if (error) {
          console.error('Insert Fehler:', error);
          alert(`Fehler beim Erstellen: ${error.message}`);
          return;
        }
        alert('Artikel erfolgreich erstellt!');
      }

      setShowForm(false);
      setEditingArticle(null);
      resetForm();
      loadArticles();
    } catch (error: any) {
      console.error('Fehler beim Speichern:', error);
      alert(`Fehler beim Speichern des Artikels: ${error.message || 'Unbekannter Fehler'}`);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      image_url: article.image_url,
      category: article.category,
      status: article.status,
      price: article.price?.toString() || '',
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      manufacturer: (article as any).manufacturer || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Artikel wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadArticles();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Artikels');
    }
  };

  const handlePreview = () => {
    setPreviewArticle(formData);
    setShowPreview(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image_url: '',
      category: 'blog',
      status: 'draft',
      price: '',
      meta_title: '',
      meta_description: '',
      manufacturer: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArticle(null);
    resetForm();
  };

  if (loading) {
    return <div className="p-6">Lädt...</div>;
  }

  if (showPreview && previewArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-yellow-100 border-b-4 border-yellow-400 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" />
            <span className="font-bold">VORSCHAU-MODUS</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setShowPreview(false)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
            Vorschau schließen
          </button>

          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {previewArticle.image_url && (
              <img
                src={previewArticle.image_url}
                alt={previewArticle.title}
                className="w-full h-96 object-cover"
              />
            )}

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {categories.find(c => c.value === previewArticle.category)?.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  previewArticle.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {previewArticle.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                </span>
                {previewArticle.price && (
                  <span className="ml-auto text-2xl font-bold text-blue-600">
                    {parseFloat(previewArticle.price).toFixed(2)} €
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{previewArticle.title}</h1>

              {previewArticle.excerpt && (
                <p className="text-xl text-gray-600 mb-6">{previewArticle.excerpt}</p>
              )}

              <div className="prose max-w-none">
                {previewArticle.content.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>

              {(previewArticle.meta_title || previewArticle.meta_description) && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <h3 className="font-bold mb-2 text-sm text-gray-500">SEO Vorschau</h3>
                  <div className="text-blue-600 font-medium">{previewArticle.meta_title || previewArticle.title}</div>
                  <div className="text-green-700 text-sm">website.de/artikel/{previewArticle.slug}</div>
                  <div className="text-gray-600 text-sm mt-1">{previewArticle.meta_description || previewArticle.excerpt}</div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {editingArticle ? 'Artikel bearbeiten' : 'Neuer Artikel'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kategorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Titel *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative manufacturer-autocomplete">
              <label className="block text-sm font-medium mb-2">Hersteller (optional)</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => {
                  setFormData({ ...formData, manufacturer: e.target.value });
                  setShowManufacturerDropdown(true);
                }}
                onFocus={() => setShowManufacturerDropdown(true)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tippen Sie, um Hersteller zu suchen..."
                autoComplete="off"
              />
              {showManufacturerDropdown && filteredManufacturers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredManufacturers.slice(0, 20).map((manufacturer) => (
                    <button
                      key={manufacturer}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, manufacturer });
                        setShowManufacturerDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      {manufacturer}
                    </button>
                  ))}
                  {filteredManufacturers.length > 20 && (
                    <div className="px-4 py-2 text-sm text-gray-500 border-t bg-gray-50">
                      +{filteredManufacturers.length - 20} weitere Hersteller...
                    </div>
                  )}
                </div>
              )}
              {showManufacturerDropdown && filteredManufacturers.length === 0 && formData.manufacturer && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-sm">
                  Keine passenden Hersteller gefunden
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {manufacturers.length > 0 ? `${manufacturers.length} Hersteller verfügbar` : 'Lade Hersteller...'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL-Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">URL: website.de/artikel/{formData.slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kurzbeschreibung (Excerpt)</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Kurze Zusammenfassung für Listen-Ansichten"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Inhalt *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Hauptinhalt des Artikels..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bild URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/bild.jpg"
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Vorschau" className="mt-2 w-full h-48 object-cover rounded" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preis (optional, für Produkte)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="19.99"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">SEO Einstellungen</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meta-Titel</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Falls leer, wird der Titel verwendet"
                  />
                  <p className="text-sm text-gray-500 mt-1">{formData.meta_title.length}/60 Zeichen</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meta-Beschreibung</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Falls leer, wird die Kurzbeschreibung verwendet"
                  />
                  <p className="text-sm text-gray-500 mt-1">{formData.meta_description.length}/160 Zeichen</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Save className="w-5 h-5" />
                Speichern
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                <Eye className="w-5 h-5" />
                Vorschau
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Artikel-Verwaltung</h2>
          <p className="text-gray-600">{filteredArticles.length} von {articles.length} Artikeln</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Neuer Artikel
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter & Suche</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Titel, Beschreibung..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Kategorien</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="published">Veröffentlicht</option>
              <option value="draft">Entwurf</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preis</label>
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Preise</option>
              <option value="with_price">Mit Preis</option>
              <option value="without_price">Ohne Preis</option>
            </select>
          </div>
        </div>

        {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterPrice !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
              setFilterPrice('all');
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Erstellt</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {article.image_url && (
                      <img src={article.image_url} alt={article.title} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-sm text-gray-500">/{article.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {categories.find(c => c.value === article.category)?.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    article.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {article.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {article.price ? `${article.price.toFixed(2)} €` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString('de-DE')}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <a
                    href={`/artikel/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800"
                  >
                    <FileText className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEdit(article)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Noch keine Artikel vorhanden. Erstellen Sie den ersten Artikel!
          </div>
        )}

        {articles.length > 0 && filteredArticles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine Artikel gefunden, die Ihren Filterkriterien entsprechen.
          </div>
        )}
      </div>
    </div>
  );
}
