import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  message: string;
  color: 'red' | 'blue' | 'green' | 'orange' | 'yellow';
  content_type: 'text' | 'html';
  html_content?: string;
}

const colorClasses = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    title: 'text-red-800',
    button: 'bg-red-600 hover:bg-red-700'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    title: 'text-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    title: 'text-green-800',
    button: 'bg-green-600 hover:bg-green-700'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    title: 'text-orange-800',
    button: 'bg-orange-600 hover:bg-orange-700'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    title: 'text-yellow-800',
    button: 'bg-yellow-600 hover:bg-yellow-700'
  }
};

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    try {
      const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]');

      let query = supabase
        .from('announcements')
        .select('id, title, message, color, content_type, html_content')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (dismissedIds.length > 0) {
        query = query.not('id', 'in', `(${dismissedIds.join(',')})`);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;

      if (data) {
        setAnnouncement(data);
        setIsVisible(true);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Ankündigung:', err);
    }
  };

  const handleDismiss = () => {
    if (announcement) {
      const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]');
      dismissedIds.push(announcement.id);
      sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds));
    }
    setIsVisible(false);
  };

  if (!isVisible || !announcement) {
    return null;
  }

  const colors = colorClasses[announcement.color];

  if (announcement.content_type === 'html' && announcement.html_content) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
        <div
          className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
          role="dialog"
          aria-label="Ankündigung"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-110 shadow-lg"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>

          <iframe
            srcDoc={announcement.html_content}
            className="w-full h-full border-0"
            title="Ankündigung"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div
        className={`relative w-full max-w-lg ${colors.bg} ${colors.border} border-2 rounded-2xl shadow-2xl p-6 md:p-8 animate-slideUp`}
        role="dialog"
        aria-labelledby="announcement-title"
        aria-describedby="announcement-message"
      >
        <button
          onClick={handleDismiss}
          className={`absolute top-4 right-4 p-2 rounded-full ${colors.button} text-white transition-all hover:scale-110`}
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pr-10">
          {announcement.title && (
            <h2
              id="announcement-title"
              className={`text-2xl md:text-3xl font-bold ${colors.title} mb-4`}
            >
              {announcement.title}
            </h2>
          )}

          <p
            id="announcement-message"
            className={`text-base md:text-lg ${colors.text} whitespace-pre-wrap leading-relaxed`}
          >
            {announcement.message}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDismiss}
            className={`px-6 py-3 ${colors.button} text-white font-semibold rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
          >
            Verstanden
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
