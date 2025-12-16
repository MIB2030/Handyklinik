import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface SearchResult {
  id: string;
  hersteller: string;
  modell: string;
  reparatur: string;
  preis: number;
}

interface QuickSearchProps {
  onSelect: (result: SearchResult) => void;
}

export default function QuickSearch({ onSelect }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      searchRepairs(query);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  async function searchRepairs(searchQuery: string) {
    try {
      const { data, error } = await supabase.rpc('search_repairs_fuzzy', {
        search_query: searchQuery,
        match_limit: 10
      });

      if (error) {
        console.error('Search error:', error);
        const { data: fallbackData } = await supabase
          .from('repair_prices')
          .select('id, hersteller, modell, reparatur, preis')
          .or(`hersteller.ilike.%${searchQuery}%,modell.ilike.%${searchQuery}%,reparatur.ilike.%${searchQuery}%`)
          .limit(10);

        setResults(fallbackData || []);
      } else {
        setResults(data || []);
      }

      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(result: SearchResult) {
    onSelect(result);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  return (
    <div ref={searchRef} className="relative max-w-3xl mx-auto mb-12">
      <div className="relative">
        <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
        <input
          type="text"
          placeholder="Suche Handy oder Reparatur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-4 sm:py-5 bg-white border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none text-base sm:text-lg shadow-lg transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      {isOpen && (query.trim().length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-6 py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-600">Suche läuft...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full px-6 py-4 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {result.modell}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                          {result.hersteller}
                        </span>
                        <span>•</span>
                        <span>{result.reparatur}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-xl font-bold text-blue-600">
                        {result.preis.toFixed(2).replace('.', ',')} €
                      </div>
                      <div className="text-xs text-gray-500">inkl. MwSt.</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-600">
              <p className="text-lg font-medium mb-2">Keine Ergebnisse gefunden</p>
              <p className="text-sm">Versuchen Sie eine andere Schreibweise oder nutzen Sie den Konfigurator unten</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
