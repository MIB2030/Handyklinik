import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Footer from './Footer';
import { useLegalText } from '../hooks/useLegalText';

interface LegalPageProps {
  type: 'impressum' | 'datenschutz' | 'agb';
  title: string;
  fallbackContent: React.ReactNode;
}

export default function LegalPage({ type, title, fallbackContent }: LegalPageProps) {
  const fallbackHtml = typeof fallbackContent === 'string'
    ? fallbackContent
    : '';

  const { content, isLoading, error } = useLegalText(type, fallbackHtml);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Zurück zur Startseite
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600">Lade rechtliche Hinweise...</p>
            </div>
          </div>
        )}

        {!isLoading && content && (
          <div className="prose prose-lg max-w-none">
            {content.startsWith('<') ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              fallbackContent
            )}
          </div>
        )}

        {!isLoading && !content && fallbackContent && (
          <div className="prose prose-lg max-w-none">
            {fallbackContent}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
