import { useState, useEffect } from 'react';
import { X, Phone, MapPin, Clock, MessageCircle, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VacationMode {
  is_active: boolean;
  start_date: string;
  end_date: string;
  message: string;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  const [vacationMode, setVacationMode] = useState<VacationMode | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVacationMode();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadVacationMode = async () => {
    try {
      const { data } = await supabase
        .from('vacation_mode')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setVacationMode(data);
    } catch (error) {
      console.error('Error loading vacation mode:', error);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setShowOpeningHours(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="max-w-2xl w-full relative my-8"
        style={{ perspective: '1000px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div
          className="relative w-full transition-all duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: showOpeningHours ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-h-[85vh] overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Phone className="w-8 h-8 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-900">Kontakt</h2>
              </div>
            </div>

            {vacationMode && (
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sun className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 mb-1">Urlaubshinweis</p>
                    <p className="text-sm text-orange-800">
                      {vacationMode.message}
                    </p>
                    <p className="text-xs text-orange-700 mt-2">
                      Sie können uns trotzdem gerne kontaktieren. Wir melden uns nach dem Urlaub zurück!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border-2 border-blue-200">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-white" />
              </div>

              <div className="text-sm text-gray-600 mb-3">Telefon</div>
              <a
                href="tel:08963286944"
                className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-8 block"
              >
                089 / 63 28 69 44
              </a>

              <div className="border-t border-blue-200 my-8"></div>

              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 mr-2" />
                <div className="text-lg font-semibold text-gray-700">Adresse</div>
              </div>
              <div className="text-gray-800 font-medium text-lg">
                <p>Unterhachinger Str. 28</p>
                <p className="mb-3">85521 Ottobrunn</p>
                <p className="text-blue-600 text-base">(Im IsarCenter)</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Schnellkontakt</h3>
              <div className="flex space-x-4">
                <a
                  href="tel:08963286944"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Anrufen</span>
                </a>
                <a
                  href="https://wa.me/4908963286944?text=Hallo,%20ich%20interessiere%20mich%20f%C3%BCr%20eine%20Reparatur.%20K%C3%B6nnen%20Sie%20mir%20weiterhelfen?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowOpeningHours(true)}
              className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Öffnungszeiten anzeigen
            </button>
          </div>
          </div>

          <div
            className="bg-white rounded-2xl w-full absolute top-0 left-0 max-h-[85vh] overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Phone className="w-8 h-8 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-900">Kontakt</h2>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white border-2 border-blue-500">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Öffnungszeiten</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-blue-100 text-sm mb-2 font-medium">Abgabe & Abholung</div>
                  <div className="text-2xl font-bold">Mo-Fr: 9:00 - 19:00 Uhr</div>
                </div>

                <div className="border-t border-blue-400 my-4"></div>

                <div>
                  <div className="text-blue-100 text-sm mb-2 font-medium">Reparaturzeit</div>
                  <div className="text-2xl font-bold">Mo-Fr: 14:00 - 18:00 Uhr</div>
                </div>

                <div className="border-t border-blue-400 my-4"></div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Unterhachinger Str. 28, 85521 Ottobrunn</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowOpeningHours(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
