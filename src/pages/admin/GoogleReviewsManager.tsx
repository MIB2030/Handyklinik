import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, RefreshCw, Eye, EyeOff, TrendingUp, Calendar, Check, X, Award, Plus } from 'lucide-react';

interface GoogleReview {
  id: string;
  google_review_id: string;
  author_name: string;
  author_photo_url: string | null;
  rating: number;
  text: string | null;
  time: string;
  relative_time_description: string | null;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface SyncLog {
  id: string;
  synced_at: string;
  reviews_count: number;
  new_reviews_count: number;
  status: string;
  error_message: string | null;
  triggered_by: string;
}

interface ReviewStats {
  total: number;
  visible: number;
  featured: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

export default function GoogleReviewsManager() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    visible: 0,
    featured: 0,
    average_rating: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [manualReview, setManualReview] = useState({
    author_name: '',
    rating: 5,
    text: '',
    time: new Date().toISOString().split('T')[0],
    author_photo_url: '',
  });

  useEffect(() => {
    fetchReviews();
    fetchSyncLogs();
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      calculateStats(reviews);
    }
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('google_reviews')
        .select('*')
        .order('time', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('google_reviews_sync_log')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const calculateStats = (reviewList: GoogleReview[]) => {
    const totalRating = reviewList.reduce((sum, r) => sum + r.rating, 0);
    const stats: ReviewStats = {
      total: reviewList.length,
      visible: reviewList.filter(r => r.is_visible).length,
      featured: reviewList.filter(r => r.is_featured).length,
      average_rating: reviewList.length > 0 ? totalRating / reviewList.length : 0,
      five_star: reviewList.filter(r => r.rating === 5).length,
      four_star: reviewList.filter(r => r.rating === 4).length,
      three_star: reviewList.filter(r => r.rating === 3).length,
      two_star: reviewList.filter(r => r.rating === 2).length,
      one_star: reviewList.filter(r => r.rating === 1).length,
    };
    setStats(stats);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-google-reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ triggeredBy: 'manual' }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed');
      }

      alert(`Erfolg! ${result.totalReviews} Bewertungen synchronisiert (${result.newReviews} neu, ${result.updatedReviews} aktualisiert)`);
      await fetchReviews();
      await fetchSyncLogs();
    } catch (error: any) {
      console.error('Error syncing reviews:', error);
      alert(`Fehler beim Synchronisieren: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualReview.author_name || !manualReview.text) {
      alert('Bitte Name und Bewertungstext ausfüllen');
      return;
    }

    setImporting(true);
    try {
      const timestamp = new Date(manualReview.time).getTime();
      const googleReviewId = `manual_${timestamp}_${manualReview.author_name.replace(/\s/g, '_')}`;

      const { error } = await supabase.from('google_reviews').insert({
        google_review_id: googleReviewId,
        author_name: manualReview.author_name,
        author_photo_url: manualReview.author_photo_url || null,
        rating: manualReview.rating,
        text: manualReview.text,
        time: new Date(manualReview.time).toISOString(),
        relative_time_description: 'Manuell importiert',
        is_visible: true,
        is_featured: manualReview.rating === 5,
      });

      if (error) throw error;

      alert('Bewertung erfolgreich hinzugefügt!');
      setShowImportModal(false);
      setManualReview({
        author_name: '',
        rating: 5,
        text: '',
        time: new Date().toISOString().split('T')[0],
        author_photo_url: '',
      });
      await fetchReviews();
    } catch (error: any) {
      console.error('Error importing review:', error);
      alert(`Fehler beim Importieren: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const toggleVisibility = async (review: GoogleReview) => {
    try {
      const { error } = await supabase
        .from('google_reviews')
        .update({ is_visible: !review.is_visible })
        .eq('id', review.id);

      if (error) throw error;

      await fetchReviews();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Fehler beim Aktualisieren der Sichtbarkeit');
    }
  };

  const toggleFeatured = async (review: GoogleReview) => {
    try {
      const { error } = await supabase
        .from('google_reviews')
        .update({ is_featured: !review.is_featured })
        .eq('id', review.id);

      if (error) throw error;

      await fetchReviews();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Fehler beim Aktualisieren des Featured-Status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];

    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === filterRating);
    }

    if (showOnlyVisible) {
      filtered = filtered.filter(r => r.is_visible);
    }

    return filtered;
  };

  const filteredReviews = getFilteredReviews();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Lade Bewertungen...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Google Reviews Verwaltung</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Manuell hinzufügen</span>
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronisieren' : 'Google Sync'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Star className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sichtbar</p>
              <p className="text-3xl font-bold text-green-600">{stats.visible}</p>
            </div>
            <Eye className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.featured}</p>
            </div>
            <Award className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Durchschnitt</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.average_rating.toFixed(1)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Bewertungsverteilung</h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats[`${['', '', 'one', 'two', 'three', 'four', 'five'][rating]}_star` as keyof ReviewStats] as number;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-20">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-yellow-400 h-4 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {syncLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Letzte Synchronisationen</h2>
          <div className="space-y-2">
            {syncLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(log.synced_at)}</span>
                  {log.status === 'success' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="text-sm text-gray-700">
                  {log.reviews_count} Reviews ({log.new_reviews_count} neu)
                  {log.triggered_by === 'manual' && (
                    <span className="ml-2 text-xs text-blue-600">(Manuell)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Bewertungen</option>
              <option value="5">5 Sterne</option>
              <option value="4">4 Sterne</option>
              <option value="3">3 Sterne</option>
              <option value="2">2 Sterne</option>
              <option value="1">1 Stern</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyVisible}
                onChange={(e) => setShowOnlyVisible(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Nur sichtbare</span>
            </label>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4 flex-1">
                  {review.author_photo_url && (
                    <img
                      src={review.author_photo_url}
                      alt={review.author_name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.author_name}</h3>
                      {review.is_featured && (
                        <Award className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-600 mt-1">{formatDate(review.time)}</p>
                    {review.text && (
                      <p className="text-gray-700 mt-3">{review.text}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => toggleVisibility(review)}
                    className={`p-2 rounded-lg transition-colors ${
                      review.is_visible
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={review.is_visible ? 'Ausblenden' : 'Einblenden'}
                  >
                    {review.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => toggleFeatured(review)}
                    className={`p-2 rounded-lg transition-colors ${
                      review.is_featured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={review.is_featured ? 'Von Featured entfernen' : 'Als Featured markieren'}
                  >
                    <Award className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Keine Bewertungen gefunden</p>
              {reviews.length === 0 && (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Jetzt Google Reviews synchronisieren
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Bewertung manuell hinzufügen</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Hinweis: Google Places API gibt max. 5 Reviews zurück. Hier können Sie weitere Bewertungen manuell hinzufügen.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name des Bewerters *
                </label>
                <input
                  type="text"
                  value={manualReview.author_name}
                  onChange={(e) => setManualReview({ ...manualReview, author_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Max Mustermann"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bewertung *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setManualReview({ ...manualReview, rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          rating <= manualReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-medium text-gray-700">
                    {manualReview.rating} Stern{manualReview.rating !== 1 ? 'e' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bewertungstext *
                </label>
                <textarea
                  value={manualReview.text}
                  onChange={(e) => setManualReview({ ...manualReview, text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Bewertungstext..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum der Bewertung *
                </label>
                <input
                  type="date"
                  value={manualReview.time}
                  onChange={(e) => setManualReview({ ...manualReview, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profilbild-URL (optional)
                </label>
                <input
                  type="url"
                  value={manualReview.author_photo_url}
                  onChange={(e) => setManualReview({ ...manualReview, author_photo_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleManualImport}
                disabled={importing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Wird hinzugefügt...' : 'Bewertung hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
