import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

type ConsentType = 'all' | 'essential' | null;

interface CookieConsentProps {
  onConsentChange?: (consent: ConsentType) => void;
}

export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent') as ConsentType;
    if (!consent) {
      setShowBanner(true);
    } else {
      onConsentChange?.(consent);
    }
  }, [onConsentChange]);

  const handleConsent = (type: ConsentType) => {
    if (type) {
      localStorage.setItem('cookieConsent', type);
      onConsentChange?.(type);
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  if (!showBanner && !showSettings) {
    return null;
  }

  return (
    <>
      {(showBanner || showSettings) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Datenschutzeinstellungen
            </h2>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Wir nutzen Cookies auf unserer Website. Einige von ihnen sind essenziell,
              während andere uns helfen, diese Website und Ihre Erfahrung zu verbessern.
              Sie können Ihre Auswahl jederzeit widerrufen.
            </p>

            {showSettings && (
              <div className="mb-6 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">Essenzielle Cookies</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Erforderlich für die grundlegende Funktionalität der Website.
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Immer aktiv</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">Analyse & Marketing</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Helfen uns, die Nutzung der Website zu analysieren und zu verbessern.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={() => handleConsent('all')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Alle akzeptieren
              </button>
              <button
                onClick={() => handleConsent('essential')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Nur essenzielle Cookies akzeptieren
              </button>
            </div>

            {!showSettings && (
              <button
                onClick={openSettings}
                className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
              >
                Individuelle Einstellungen
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
              Weitere Informationen finden Sie in unserer{' '}
              <Link to="/datenschutz" className="text-blue-600 hover:text-blue-700 underline">
                Datenschutzerklärung
              </Link>
              {' '}und in unseren{' '}
              <Link to="/cookie-richtlinie" className="text-blue-600 hover:text-blue-700 underline">
                Cookie-Richtlinien
              </Link>
              .
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function CookiePreferencesButton() {
  const [showConsent, setShowConsent] = useState(false);

  const openPreferences = () => {
    localStorage.removeItem('cookieConsent');
    setShowConsent(true);
    window.location.reload();
  };

  return (
    <button
      onClick={openPreferences}
      className="fixed bottom-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      aria-label="Cookie-Einstellungen ändern"
      title="Cookie-Einstellungen"
    >
      <Cookie size={20} />
    </button>
  );
}
