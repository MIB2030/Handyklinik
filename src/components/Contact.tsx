import { useState, useEffect } from 'react';
import { Phone, Gift, Shield } from 'lucide-react';
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
      <section className="py-16 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <button
            onClick={() => setIsWertgarantieModalOpen(true)}
            className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-lg transition-all"
          >
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Shield className="w-7 h-7 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">WERTGARANTIE Partner</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <div className="flex justify-center mb-6">
                <img
                  src="/wertgarantie_logo_1.jpg"
                  alt="WERTGARANTIE Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-gray-600 mb-6">
                Zertifizierter Partner für professionelle Reparaturdienstleistungen
              </p>
              <div
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWertgarantieModalOpen(true);
                }}
              >
                Mehr erfahren
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="w-full bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 border-2 border-yellow-300 hover:shadow-lg transition-all"
          >
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Gift className="w-7 h-7 text-yellow-600" />
                <h3 className="text-2xl font-bold text-gray-900">Gutschein</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold text-yellow-600 mb-2">10€</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">Reparatur-Gutschein</div>
              <div className="text-sm text-gray-600">Jetzt sichern!</div>
            </div>
          </button>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border-2 border-blue-200 hover:shadow-lg transition-all"
          >
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Phone className="w-7 h-7 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Kontakt</h3>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">Telefon</div>
            <a
              href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
              className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-6 block"
            >
              {companyInfo.phone}
            </a>

            <div className="border-t border-blue-200 my-6"></div>

            <div className="text-sm text-gray-600 mb-2">Adresse</div>
            <div className="text-gray-800 font-medium">
              <p>{companyInfo.street}</p>
              <p className="mb-2">{companyInfo.postal_code} {companyInfo.city}</p>
              <p className="text-blue-600 text-sm">(Im IsarCenter)</p>
            </div>
          </button>
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
