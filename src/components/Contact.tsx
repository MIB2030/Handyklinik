import { useState, useEffect } from 'react';
import { Phone, Gift, Shield, Clock } from 'lucide-react';
import VoucherModal from './VoucherModal';
import ContactModal from './ContactModal';
import WertgarantieModal from './WertgarantieModal';
import { supabase } from '../lib/supabase';

interface CompanyInfo {
  phone: string;
  street: string;
  postal_code: string;
  city: string;
}

export default function Contact() {
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isWertgarantieModalOpen, setIsWertgarantieModalOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    phone: '089 / 63 28 69 44',
    street: 'Unterhachinger Str. 28',
    postal_code: '85521',
    city: 'Ottobrunn',
  });
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    loadCompanyInfo();
    loadGoogleMapsSettings();
  }, []);

  const loadCompanyInfo = async () => {
    const { data } = await supabase
      .from('company_info')
      .select('phone, street, postal_code, city')
      .maybeSingle();

    if (data) {
      setCompanyInfo(data);
    }
  };

  const loadGoogleMapsSettings = async () => {
    try {
      setIsMapLoading(true);
      const { data, error } = await supabase
        .from('google_settings')
        .select('api_key, place_id')
        .maybeSingle();

      console.log('Maps Data von DB:', data);
      console.log('Maps Error von DB:', error);

      if (error) {
        console.error('Fehler beim Laden der Google Settings:', error);
        setIsMapLoading(false);
        return;
      }

      if (!data) {
        console.warn('Keine Google Settings in der Datenbank gefunden');
        setIsMapLoading(false);
        return;
      }

      if (!data.api_key || !data.place_id) {
        console.warn('API Key oder Place ID fehlt:', {
          hasApiKey: !!data.api_key,
          hasPlaceId: !!data.place_id,
          apiKey: data.api_key ? `${data.api_key.substring(0, 10)}...` : 'undefined',
          placeId: data.place_id || 'undefined'
        });
        setIsMapLoading(false);
        return;
      }

      const url = `https://www.google.com/maps/embed/v1/place?key=${data.api_key}&q=place_id:${data.place_id}`;
      console.log('Google Maps URL generiert:', url);
      setGoogleMapsUrl(url);
      setIsMapLoading(false);
    } catch (err) {
      console.error('Unerwarteter Fehler beim Laden der Map-Settings:', err);
      setIsMapLoading(false);
    }
  };

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="w-full bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 mb-12 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-yellow-200 hover:border-yellow-300 group"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Exklusiver Reparatur-Gutschein</h3>
                  <p className="text-gray-600 text-base">
                    Sichere dir jetzt deinen <span className="font-bold text-yellow-600">10€ Gutschein</span> auf deine nächste Reparatur!
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white px-8 py-4 rounded-xl group-hover:from-yellow-500 group-hover:to-yellow-600 transition-all">
                  <div className="text-4xl font-black mb-1">10€</div>
                  <div className="text-sm font-semibold">Jetzt einlösen →</div>
                </div>
              </div>
            </div>
          </button>

          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Unser Partner</h2>
              <p className="text-lg text-gray-600">Vertrauen durch Zertifizierung</p>
            </div>

            <button
              onClick={() => setIsWertgarantieModalOpen(true)}
              className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 group"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">WERTGARANTIE</h3>
                    <p className="text-gray-600 text-base">
                      Zertifizierter Reparaturpartner für Versicherungsschäden
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <img
                    src="/wertgarantie_logo_1.jpg"
                    alt="WERTGARANTIE Logo"
                    className="h-16 w-auto object-contain"
                  />
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                    <div className="text-sm font-semibold">Mehr erfahren →</div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Kontakt & Informationen</h2>
            <p className="text-lg text-gray-600">Wir sind für Sie da</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Phone className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Telefon</h3>
                <a
                  href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
                  className="text-xl font-bold text-blue-600 hover:text-blue-700 mb-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {companyInfo.phone}
                </a>
                <div className="text-sm text-gray-500 mt-auto">
                  <p className="font-medium">{companyInfo.street}</p>
                  <p>{companyInfo.postal_code} {companyInfo.city}</p>
                  <p className="text-blue-600 text-xs mt-1">(Im IsarCenter)</p>
                </div>
              </div>
            </button>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Öffnungszeiten</h3>
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-gray-600">Mo - Fr</span>
                    <span className="font-semibold text-gray-900">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-gray-600">Samstag</span>
                    <span className="font-semibold text-gray-900">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-gray-600">Sonntag</span>
                    <span className="font-semibold text-red-600">Geschlossen</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Termine auch außerhalb möglich</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-2">
              <div className="relative h-80 md:h-auto">
                {googleMapsUrl && (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={googleMapsUrl}
                    title="MNW Mobilfunk Standort in Ottobrunn"
                    className="absolute inset-0"
                  />
                )}
                {!googleMapsUrl && !isMapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center px-4">
                      <p className="text-gray-700 font-medium mb-2">Karte nicht verfügbar</p>
                      <p className="text-gray-500 text-sm">Google Maps Einstellungen fehlen in der Datenbank</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Besuchen Sie uns</h3>
                  <p className="text-gray-600 mb-4">Direkt im IsarCenter Ottobrunn</p>
                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium">{companyInfo.street}</p>
                    <p className="font-medium">{companyInfo.postal_code} {companyInfo.city}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href={`https://www.google.com/maps/dir//${encodeURIComponent(companyInfo.street + ', ' + companyInfo.postal_code + ' ' + companyInfo.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    Route planen
                  </a>
                  <a
                    href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
                    className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    Jetzt anrufen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WertgarantieModal
        isOpen={isWertgarantieModalOpen}
        onClose={() => setIsWertgarantieModalOpen(false)}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
    </>
  );
}
