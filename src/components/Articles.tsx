import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: string;
  price: number | null;
  published_at: string;
}

const categoryLabels: Record<string, string> = {
  blog: 'Blog',
  news: 'News',
  produkt: 'Produkt',
  ratgeber: 'Ratgeber',
  service: 'Service',
};

const categoryColors: Record<string, string> = {
  blog: 'bg-blue-100 text-blue-800',
  news: 'bg-green-100 text-green-800',
  produkt: 'bg-orange-100 text-orange-800',
  ratgeber: 'bg-gray-100 text-gray-800',
  service: 'bg-teal-100 text-teal-800',
};

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, image_url, category, price, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Artikel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Lädt Artikel...</div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Aktuelles & Ratgeber
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Informationen, Tipps und Neuigkeiten rund um Handy-Reparaturen
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {article.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      categoryColors[article.category] || categoryColors.blog
                    }`}>
                      {categoryLabels[article.category] || article.category}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                  {article.price && article.price > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Tag className="w-4 h-4" />
                      <span className="font-semibold text-blue-600">
                        {article.price.toFixed(2)} €
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                )}

                <a
                  href={`/artikel/${article.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium group mt-auto"
                >
                  Weiterlesen
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
