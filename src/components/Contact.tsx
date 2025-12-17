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

  useEffect(() => {
    loadCompanyInfo();
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

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Kontakt & Informationen</h2>
            <p className="text-lg text-gray-600">Wir sind für Sie da</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="group bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3">
                  <Gift className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Gutschein</h3>
                  <div className="text-5xl font-black text-white mb-1">10€</div>
                  <p className="text-sm font-semibold text-gray-900">Reparatur-Gutschein</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-gray-900 bg-white/30 px-4 py-2 rounded-full">
                  Jetzt sichern!
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsWertgarantieModalOpen(true)}
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                  <Shield className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">WERTGARANTIE</h3>
                  <img
                    src="/wertgarantie_logo_1.jpg"
                    alt="WERTGARANTIE Logo"
                    className="h-12 w-auto object-contain mx-auto mb-3"
                  />
                  <p className="text-xs text-gray-600">Zertifizierter Partner</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-blue-600">Mehr erfahren →</div>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-2">
              <div className="relative h-80 md:h-auto">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2665.8!2d11.6642!3d48.0657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDAzJzU2LjUiTiAxMcKwMzknNTEuMSJF!5e0!3m2!1sde!2sde!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="MNW Mobilfunk Standort in Ottobrunn"
                  className="absolute inset-0"
                />
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
                    href="https://www.google.com/maps/dir//48.0657,11.6642"
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
