import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, RefreshCw, Eye, EyeOff, TrendingUp, Calendar, Check, X, Award } from 'lucide-react';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-google-reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ triggeredBy: 'manual' }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed');
      }

      alert(`Erfolg! ${result.reviews_count} Bewertungen synchronisiert (${result.new_reviews_count} neu)`);
      await fetchReviews();
      await fetchSyncLogs();
    } catch (error: any) {
      console.error('Error syncing reviews:', error);
      alert(`Fehler beim Synchronisieren: ${error.message}`);
    } finally {
      setSyncing(false);
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
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}</span>
        </button>
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
    </div>
  );
}
