import { useState, useEffect } from 'react';
import { legalApiService, LegalText } from '../services/legalApi';

interface UseLegalTextResult {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useLegalText(
  type: 'impressum' | 'datenschutz' | 'agb',
  fallbackContent: string
): UseLegalTextResult {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadText = async () => {
      try {
        setIsLoading(true);
        setError(null);

        legalApiService.setFallbackText(type, fallbackContent);

        const legalText: LegalText | null = await legalApiService.getLegalText(type);

        if (!isMounted) return;

        if (legalText) {
          setContent(legalText.content);
          setLastUpdated(legalText.lastUpdated);
        } else {
          setContent(fallbackContent);
          setLastUpdated(null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading legal text:', err);
        setError('Fehler beim Laden der Rechtstexte');
        setContent(fallbackContent);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadText();

    return () => {
      isMounted = false;
    };
  }, [type, fallbackContent]);

  return {
    content,
    isLoading,
    error,
    lastUpdated,
  };
}
