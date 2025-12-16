import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VacationBanner from '../components/VacationBanner';
import { Calendar, Tag, ArrowLeft, ChevronRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: string;
  price: number | null;
  meta_title: string;
  meta_description: string;
  published_at: string;
}

const categoryLabels: Record<string, string> = {
  blog: 'Blog',
  news: 'News',
  produkt: 'Produkt',
  ratgeber: 'Ratgeber',
  service: 'Service',
};

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
        return;
      }

      setArticle(data);

      const { data: related } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, image_url, category, price, published_at')
        .eq('status', 'published')
        .eq('category', data.category)
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(3);

      setRelatedArticles(related || []);
    } catch (error) {
      console.error('Fehler beim Laden des Artikels:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <VacationBanner />
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-white">
        <VacationBanner />
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artikel nicht gefunden</h1>
          <p className="text-gray-600 mb-8">Der gesuchte Artikel existiert nicht oder wurde entfernt.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Zur Startseite
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{article.meta_title || article.title}</title>
        <meta name="description" content={article.meta_description || article.excerpt} />
      </Helmet>

      <VacationBanner />
      <Header />

      <nav className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Startseite</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{article.title}</span>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {article.image_url && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {categoryLabels[article.category] || article.category}
            </span>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
            </div>
            {article.price && article.price > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <Tag className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {article.price.toFixed(2)} €
                </span>
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="prose prose-lg max-w-none">
          {article.content.split('\n').map((paragraph, idx) => (
            paragraph.trim() && <p key={idx} className="mb-6 text-gray-700 leading-relaxed">{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Startseite
          </Link>
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Weitere Artikel</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((relArticle) => (
                <Link
                  key={relArticle.id}
                  to={`/artikel/${relArticle.slug}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                >
                  {relArticle.image_url && (
                    <img
                      src={relArticle.image_url}
                      alt={relArticle.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {relArticle.title}
                    </h3>
                    {relArticle.excerpt && (
                      <p className="text-gray-600 line-clamp-3">
                        {relArticle.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
