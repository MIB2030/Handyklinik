import { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface WertgarantieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WertgarantieModal({ isOpen, onClose }: WertgarantieModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <img
              src="/wertgarantie_logo_1.jpg"
              alt="WERTGARANTIE Logo"
              className="w-full max-w-xl mx-auto mb-6 rounded-lg"
              loading="lazy"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Ihr WERTGARANTIE Service:
            </h2>
            <p className="text-xl sm:text-2xl font-semibold text-blue-600">
              Kein Stress, keine Vorkasse!
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 sm:p-8 border-2 border-blue-200 mb-6">
            <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-6">
              Als offizieller WERTGARANTIE Partner übernehmen wir für Sie die komplette Abwicklung Ihres Schadens. Sie erhalten Ihr repariertes Gerät schnell zurück und wir erledigen den gesamten Papierkram.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">Volle Abwicklung:</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Wir kümmern uns um die gesamte Kommunikation und den Schriftverkehr.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">Keine Vorkasse:</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Wir rechnen die Kosten direkt mit der WERTGARANTIE ab.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">Ihr Vorteil:</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Stressfrei und unkompliziert zur Reparatur!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="https://www.wertgarantie.de"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors text-center text-lg"
            >
              WERTGARANTIE
            </a>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
